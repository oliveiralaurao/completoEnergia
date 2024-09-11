document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const unidadeConsumidoraId = urlParams.get('unidadeConsumidoraId');
    document.getElementById('unidadeConsumidoraId').value = unidadeConsumidoraId;

    window.uniId = unidadeConsumidoraId;  
    console.log("unidadeConsumidoraId recebido:", unidadeConsumidoraId);

    fetchDependencias(unidadeConsumidoraId);

    document.getElementById('dependenciaFormElement').addEventListener('submit', function (event) {
        event.preventDefault();
        saveDependencia();
    });
});


function manageDispositivos(dependenciaId, unidadeConsumidoraId) {

    window.location.href = `dispositivos.html?dependenciaId=${dependenciaId}&unidadeConsumidoraId=${unidadeConsumidoraId}`;
}



function fetchDependencias(unidadeConsumidoraId) {
    fetch(`http://localhost:8000/dependencias/unidade-consumidora/${unidadeConsumidoraId}`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('dependenciasList');
            list.innerHTML = '<ul class="list-group border border-danger">';
            data.dependencias.forEach(dependencia => {
                console.log(unidadeConsumidoraId)
                list.innerHTML += `
                    <li class="list-group-item m-2 p-2 border-bottom">
                        <div class="row d-flex justify-content-between">
                            <div class="col"><strong>${dependencia.nome}</strong></div>
                            <div class="col">
                                <button class="btn btn-info btn-sm float-end ms-2" onclick="showEditForm(${dependencia.id}, '${dependencia.nome}', ${dependencia.unidade_consumidora_id})">Editar</button>
                                <button class="btn btn-danger btn-sm float-end" onclick="deleteDependencia(${dependencia.id})">Deletar</button>
                                <button class="btn btn-primary btn-sm float-end" onclick="manageDispositivos(${dependencia.id}, ${unidadeConsumidoraId})">Gerenciar Dispositivos</button>
                            </div>
                        </div>
                    </li>`;

                });
            list.innerHTML += '</ul>';
        })
        .catch(error => console.error('Erro ao buscar as dependências:', error));
}
function showAddForm() {
    document.getElementById('dependenciaForm').classList.remove('d-none');
    document.getElementById('dependenciaId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('formTitle').innerText = 'Adicionar Dependência';
}

function showEditForm(id, nome, unidadeConsumidoraId) {
    document.getElementById('dependenciaForm').classList.remove('d-none');
    document.getElementById('dependenciaId').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('unidadeConsumidoraId').value = unidadeConsumidoraId;
    document.getElementById('formTitle').innerText = 'Editar Dependência';
    console.log(unidadeConsumidoraId)
}

function saveDependencia() {
    const id = document.getElementById('dependenciaId').value;
    const nome = document.getElementById('nome').value;
    const unidadeConsumidoraId = document.getElementById('unidadeConsumidoraId').value;
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `http://localhost:8000/dependencias/${id}` : 'http://localhost:8000/dependencias';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: nome, unidade_consumidora_id: parseInt(unidadeConsumidoraId) })
    })
        .then(response => response.json())
        .then(() => {
            fetchDependencias(unidadeConsumidoraId);
            document.getElementById('dependenciaForm').classList.add('d-none');
        });
}

function deleteDependencia(id) {
    const unidadeConsumidoraId = document.getElementById('unidadeConsumidoraId').value;
    fetch(`http://localhost:8000/dependencias/${id}`, {
        method: 'DELETE'
    })
        .then(() => fetchDependencias(unidadeConsumidoraId));
}
