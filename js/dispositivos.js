document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const dependenciaId = urlParams.get('dependenciaId');
    const unidadeConsumidoraId = urlParams.get('unidadeConsumidoraId'); 
    console.log(urlParams)
   
    window.globalUnidadeConsumidoraId = unidadeConsumidoraId;  
    console.log("unidade recebido:", unidadeConsumidoraId);

    if (dependenciaId) {
        const dependenciaInt = parseInt(dependenciaId, 10);
        
        if (!isNaN(dependenciaInt)) {
            fetchDependencias(dependenciaInt);
            fetchDispositivos(dependenciaInt);
        } else {
            console.error("O valor de dependenciaId não é um número válido.");
        }
    } else {
        console.error("Nenhum dependenciaId fornecido na URL.");
    }
    
    fetchUnidadesConsumidoras();
    fetchTipo();

    if (unidadeConsumidoraId) {
        document.getElementById('unidadeConsumidoraId').value = unidadeConsumidoraId;
    }

    document.getElementById('dispositivoFormElement').addEventListener('submit', function (event) {
        event.preventDefault();
        saveDispositivo();
    });
});



function fetchDependencias(dependenciaInt) {

    if (isNaN(dependenciaInt)) {
        console.error("O valor passado para dependenciaInt não é um número válido.");
        return;
    }

    var dependenciaInput = document.getElementById('dependenciaId');
    dependenciaInput.value = dependenciaInt;

}



function fetchTipo() {
    fetch(`http://localhost:8000/tipos-dispositivos`)
        .then(response => response.json())
        .then(data => {
            const tipoSelect = document.getElementById('tipoId');
            tipoSelect.innerHTML = '<option value="">Selecione o Tipo </option>'; // Reset the select options

            data.tipos_dispositivos.forEach(tipo => {
                tipoSelect.innerHTML += `
                    <option value="${tipo.id}">${tipo.nome}</option>
                `;
            });
        })
        .catch(error => console.error('Erro ao buscar os tipos:', error));
}


function fetchUnidadesConsumidoras() {
    fetch('http://localhost:8000/unidades-consumidoras')
        .then(response => response.json())
        .then(data => {
            const unidadeSelect = document.getElementById('unidadeConsumidoraId');
            unidadeSelect.innerHTML = '<option value="">Selecione a Unidade Consumidora</option>'; // Reset the select options

            data.unidades_consumidoras.forEach(unidade => {
                unidadeSelect.innerHTML += `
                    <option value="${unidade.id}">${unidade.nome}</option>
                `;
            });
        })
        .catch(error => console.error('Erro ao buscar as unidades consumidoras:', error));
}

function fetchDispositivos(dependenciaId) {
    fetch(`http://localhost:8000/dispositivos/dependencias/${dependenciaId}`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('dispositivosList');
            list.innerHTML = '<ul class="list-group border border-danger">';
            data.dispositivos.forEach(dispositivo => {
                list.innerHTML += `
                    <li class="list-group-item m-2 p-2 border-bottom">
                        <div class="row d-flex justify-content-between">
                            <div class="col"><strong>${dispositivo.nome}</strong></div>
                            <div class="col">
                                <button class="btn btn-info btn-sm float-end ms-2" onclick="showEditForm(${dispositivo.id}, '${dispositivo.nome}', ${dispositivo.tipo_id}, ${dispositivo.consumo}, ${dispositivo.uso_diario})">Editar</button>
                                <button class="btn btn-danger btn-sm float-end" onclick="deleteDispositivo(${dispositivo.id})">Deletar</button>
                            </div>
                        </div>
                    </li>`;
            });
            list.innerHTML += '</ul>';
        })
        .catch(error => console.error('Erro ao buscar os dispositivos:', error));
}

function showAddForm() {
    document.getElementById('dispositivoForm').classList.remove('d-none');

    const form = document.getElementById('dispositivoFormElement');

    for (let element of form.elements) {
        if (element.type !== 'hidden') {
            element.value = '';
            if (element.tagName === 'SELECT') {
                element.selectedIndex = -1;
            }
        }
    }

    document.getElementById('formTitle').innerText = 'Adicionar Dispositivo';
}


function showEditForm(id, nome, tipoId, consumo, usoDiario) {
    document.getElementById('dispositivoForm').classList.remove('d-none');
    document.getElementById('dispositivoId').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('tipoId').value = tipoId;
    document.getElementById('consumo').value = consumo;
    document.getElementById('usoDiario').value = usoDiario;
    document.getElementById('formTitle').innerText = 'Editar Dispositivo';
}

function saveDispositivo() {
    const id = document.getElementById('dispositivoId').value;
    const nome = document.getElementById('nome').value.trim();
    const tipoId = parseInt(document.getElementById('tipoId').value.trim(), 10);
    const consumo = parseInt(document.getElementById('consumo').value.trim(), 10);
    const usoDiario = parseInt(document.getElementById('usoDiario').value.trim(), 10);
    const dependenciaId = parseInt(document.getElementById('dependenciaId').value.trim(), 10);
    const unidadeConsumidoraId = parseInt(document.getElementById('unidadeConsumidoraId').value.trim(), 10);
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `http://localhost:8000/dispositivos/${id}` : 'http://localhost:8000/dispositivos';
    console.log(nome)
    console.log(tipoId)
    console.log(consumo)
    console.log(usoDiario)
    console.log(dependenciaId)
    console.log(unidadeConsumidoraId)
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            nome: nome, 
            tipo_id: tipoId, 
            consumo: consumo,
            uso_diario: usoDiario,
            dependencia_id: dependenciaId,
            unidade_consumidora_id: unidadeConsumidoraId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        fetchDispositivos(dependenciaId);
        document.getElementById('dispositivoForm').classList.add('d-none');
    })
    .catch(error => console.error('Houve um problema com a requisição:', error));
}

function deleteDispositivo(id) {
    const dependenciaId = document.getElementById('dependenciaId').value;
    fetch(`http://localhost:8000/dispositivos/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            fetchDispositivos(dependenciaId);
        })
        .catch(error => console.error('Houve um problema com a requisição:', error));
}
