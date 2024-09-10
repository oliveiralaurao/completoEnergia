document.addEventListener("DOMContentLoaded", function () {
    fetchTiposConsumidores();

    document.getElementById('tipoConsumidorFormElement').addEventListener('submit', function (event) {
        event.preventDefault();
        saveTipoConsumidor();
    });
});

function fetchTiposConsumidores() {
    fetch('http://localhost:8000/tipos-consumidores')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('tiposConsumidoresList');
            list.innerHTML = '<ul class="list-group border border-danger">';
            data.tipos_consumidores.forEach(tipo => {
                list.innerHTML += `
                    <li class="list-group-item m-2 p-2 border-bottom">
                        <div class="row d-flex justify-content-between">
                            <div class="col"><strong>${tipo.nome}</strong> (Valor kWh: ${tipo.valor_kwh.toFixed(2)})</div>
                            <div class="col">
                                <button class="btn btn-info btn-sm float-end ms-2" onclick="showEditForm(${tipo.id}, '${tipo.nome}', ${tipo.valor_kwh})">Editar</button>
                                <button class="btn btn-danger btn-sm float-end" onclick="deleteTipoConsumidor(${tipo.id})">Deletar</button>
                            </div>
                        </div>
                    </li>`;
            });
            list.innerHTML += '</ul>';
        })
        .catch(error => console.error('Erro ao buscar os tipos de consumidores:', error));
}

function showAddForm() {
    document.getElementById('tipoConsumidorForm').classList.remove('d-none');
    document.getElementById('tipoConsumidorId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('valorKwh').value = '';
    document.getElementById('formTitle').innerText = 'Adicionar Tipo de Consumidor';
}

function showEditForm(id, nome, valorKwh) {
    document.getElementById('tipoConsumidorForm').classList.remove('d-none');
    document.getElementById('tipoConsumidorId').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('valorKwh').value = valorKwh;
    document.getElementById('formTitle').innerText = 'Editar Tipo de Consumidor';
}

function saveTipoConsumidor() {
    const id = document.getElementById('tipoConsumidorId').value;
    const nome = document.getElementById('nome').value;
    const valorKwh = parseFloat(document.getElementById('valorKwh').value);
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `http://localhost:8000/tipos-consumidores/${id}` : 'http://localhost:8000/tipos-consumidores';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            nome: nome, 
            valor_kwh: valorKwh // Envia como número decimal
        })
    })
        .then(response => response.json())
        .then(() => {
            fetchTiposConsumidores();
            document.getElementById('tipoConsumidorForm').classList.add('d-none');
        })
        .catch(error => console.error('Erro ao salvar o tipo de consumidor:', error));
}

function deleteTipoConsumidor(id) {
    fetch(`http://localhost:8000/tipos-consumidores/${id}`, {
        method: 'DELETE'
    })
        .then(() => fetchTiposConsumidores())
        .catch(error => console.error('Erro ao deletar o tipo de consumidor:', error));
}
