document.addEventListener("DOMContentLoaded", function () {
    fetchUnidadesConsumidoras();
    fetchTiposConsumidores();

    document.getElementById('unidadeFormElement').addEventListener('submit', function (event) {
        event.preventDefault();
        saveUnidadeConsumidora();
    });
});

function fetchTiposConsumidores() {
    fetch('http://localhost:8000/tipos-consumidores')
        .then(response => response.json())
        .then(data => {
            const tipoSelect = document.getElementById('tipoId');
            tipoSelect.innerHTML = '<option value="">Selecione o Tipo</option>'; // Reset the select options

            data.tipos_consumidores.forEach(tipo => {
                tipoSelect.innerHTML += `
                    <option value="${tipo.id}">${tipo.nome}</option>
                `;
            });
        })
        .catch(error => console.error('Erro ao buscar os tipos de consumidores:', error));
}

function fetchUnidadesConsumidoras() {
    fetch('http://localhost:8000/unidades-consumidoras')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('unidadesList');
            list.innerHTML = '<ul class="list-group border border-danger">';
            data.unidades_consumidoras.forEach(unidade => {
                list.innerHTML += `
                    <li class="list-group-item m-2 p-2 border-bottom">
                        <div class="row d-flex justify-content-between">
                            <div class="col"><strong>${unidade.nome}</strong></div>
                            <div class="col">
                                <button class="btn btn-info btn-sm float-end" onclick="showEditForm(${unidade.id}, '${unidade.nome}', ${unidade.tipo_id})">Editar</button>
                                <button class="btn btn-danger btn-sm float-end" onclick="deleteUnidadeConsumidora(${unidade.id})">Deletar</button>
                                <button class="btn btn-primary btn-sm float-end" onclick="manageDependencias(${unidade.id})">Gerenciar Dependências</button>
                            </div>
                        </div>
                    </li>`;
            });
            list.innerHTML += '</ul>';
        })
        .catch(error => console.error('Erro ao buscar as unidades consumidoras:', error));
}

function showAddForm() {
    document.getElementById('unidadeForm').classList.remove('d-none');
    document.getElementById('unidadeId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('tipoId').value = '';
    document.getElementById('formTitle').innerText = 'Adicionar Unidade Consumidora';
}

function showEditForm(id, nome, tipoId) {
    document.getElementById('unidadeForm').classList.remove('d-none');
    document.getElementById('unidadeId').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('tipoId').value = tipoId;
    document.getElementById('formTitle').innerText = 'Editar Unidade Consumidora';
}

function saveUnidadeConsumidora() {
    const id = document.getElementById('unidadeId').value;
    const nome = document.getElementById('nome').value;
    const tipoId = document.getElementById('tipoId').value;
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `http://localhost:8000/unidades-consumidoras/${id}` : 'http://localhost:8000/unidades-consumidoras';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: nome, tipo_id: parseInt(tipoId) })
    })
        .then(response => response.json())
        .then(() => {
            fetchUnidadesConsumidoras();
            document.getElementById('unidadeForm').classList.add('d-none');
        });
}

function deleteUnidadeConsumidora(id) {
    fetch(`http://localhost:8000/unidades-consumidoras/${id}`, {
        method: 'DELETE'
    })
        .then(() => fetchUnidadesConsumidoras());
}

function manageDependencias(unidadeConsumidoraId) {
    window.location.href = `dependencias.html?unidadeConsumidoraId=${unidadeConsumidoraId}`;
}
