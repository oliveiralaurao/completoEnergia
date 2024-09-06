document.addEventListener("DOMContentLoaded", function () {
    const origemSelect = document.getElementById('origemDoConsumo');
    const itemSelect = document.getElementById('itemId');

    origemSelect.addEventListener('change', function () {
        const origem = this.value;
        if (origem) {
            loadItemIds(origem);
        } else {
            itemSelect.innerHTML = '<option value="">Selecione um item</option>';
        }
    });

    document.getElementById('consumoForm').addEventListener('submit', function (event) {
        event.preventDefault();
        calcularConsumo();
    });
});

function loadItemIds(origem) {
    fetch(`http://localhost:8000/${origem}`)
        .then(response => response.json())
        .then(data => {
            const itemSelect = document.getElementById('itemId');
            itemSelect.innerHTML = '<option value="">Selecione um item</option>';
            data.unidades_consumidoras.forEach(item => {
                itemSelect.innerHTML += `<option value="${item.id}">${item.nome || item.id}</option>`;
            });
        })
        .catch(error => console.error('Erro ao carregar os IDs dos itens:', error));
}

function calcularConsumo() {
    const origemDoConsumo = document.getElementById('origemDoConsumo').value;
    const itemId = document.getElementById('itemId').value;

    fetch(`http://localhost:8000/consumos/?origem_do_consumo=residencia&item_id=${itemId}`)
        .then(response => response.json())
        .then(data => {
            mostrarResultado(data);
        })
        .catch(error => console.error('Erro ao calcular o consumo:', error));
}

function mostrarResultado(data) {
    const resultadoDiv = document.getElementById('resultado');
    
    if (data && data.consumo_diario !== undefined && data.consumo_mensal !== undefined && data.consumo_anual !== undefined) {
        resultadoDiv.innerHTML = `
            <div class="alert alert-success" role="alert">
                <h4>Consumo Calculado:</h4>
                <p><strong>Consumo Diário:</strong> ${data.consumo_diario} kWh</p>
                <p><strong>Consumo Mensal:</strong> ${data.consumo_mensal} kWh</p>
                <p><strong>Consumo Anual:</strong> ${data.consumo_anual} kWh</p>
            </div>`;
    } else {
        resultadoDiv.innerHTML = '<div class="alert alert-danger" role="alert">Não foi possível calcular o consumo.</div>';
    }
}
