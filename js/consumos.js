document.addEventListener("DOMContentLoaded", function () {
    const origemSelect = document.getElementById('origemDoConsumo');
    const itemSelect = document.getElementById('itemId');
    const residenciaContainer = document.getElementById('residenciaContainer');
    const residenciaSelect = document.getElementById('residenciaId');
    const dependenciaSelect = document.getElementById('dependenciaId');
    const dispositivoContainer = document.getElementById('dispositivoContainer');
    const oi = document.getElementById('oi');

    origemSelect.addEventListener('change', function () {
        const origem = this.value;
        if (origem === 'dependencias') {
            residenciaContainer.style.display = 'block';
            dispositivoContainer.style.display = 'none';
            itemSelect.style.display = 'block'; // Mostrar campo itemId
            itemSelect.required = true; // Adicionar o atributo required
            loadResidencias();
        } else if (origem === 'dispositivos') {
            residenciaContainer.style.display = 'block';
            dispositivoContainer.style.display = 'block';
            itemSelect.style.display = 'none'; // Esconder campo itemId
            oi.style.display = 'none'; // Esconder campo itemId
            itemSelect.required = false; // Remover o atributo required
            loadResidencias();
        } else {
            residenciaContainer.style.display = 'none';
            dispositivoContainer.style.display = 'none';
            itemSelect.style.display = 'block'; // Esconder campo itemId
            itemSelect.required = true; // Remover o atributo required
            loadResidencias();
            if (origem) {
                loadItemIds(origem);
            } else {
                itemSelect.innerHTML = '<option value="">Selecione um item</option>';
            }
        }
    });

    residenciaSelect.addEventListener('change', function () {
        const residenciaId = this.value;
        if (residenciaId) {
            loadDependencias(residenciaId);
            if (origemSelect.value === 'dispositivos') {
                loadDispositivos(residenciaId);
            }
        } else {
            dependenciaSelect.innerHTML = '<option value="">Selecione um cômodo</option>';
            dispositivoSelect.innerHTML = '<option value="">Selecione um dispositivo</option>';
        }
    });

    itemSelect.addEventListener('change', function () {
        const dependenciaId = this.value;
        if (dependenciaId) {
            loadDispositivos(dependenciaId);
        } else {
            dispositivoSelect.innerHTML = '<option value="">Selecione um dispositivo</option>';
        }
    });

    document.getElementById('consumoForm').addEventListener('submit', function (event) {
        event.preventDefault();
        calcularConsumo();
    });
    fetchBandeira()
});

function loadResidencias() {
    fetch(`http://localhost:8000/unidades-consumidoras`)
        .then(response => response.json())
        .then(data => {
            const residenciaSelect = document.getElementById('residenciaId');
            residenciaSelect.innerHTML = '<option value="">Selecione uma residência</option>';
            data.unidades_consumidoras.forEach(residencia => {
                residenciaSelect.innerHTML += `<option value="${residencia.id}">${residencia.nome || residencia.id}</option>`;
            });
        })
        .catch(error => console.error('Erro ao carregar as residências:', error));
}

function loadDependencias(residenciaId) {
    fetch(`http://localhost:8000/dependencias/unidade-consumidora/${residenciaId}`)
        .then(response => response.json())
        .then(data => {
            const itemId = document.getElementById('itemId');
            itemId.innerHTML = '<option value="">Selecione um cômodo</option>';
            data.dependencias.forEach(dependencia => {
                itemId.innerHTML += `<option value="${dependencia.id}">${dependencia.nome || dependencia.id}</option>`;
            });
        })
        .catch(error => console.error('Erro ao carregar os cômodos:', error));
}

function loadDispositivos(residenciaId) {
    fetch(`http://localhost:8000/dispositivos/unidades-consumidoras/${residenciaId}`)
        .then(response => response.json())
        .then(data => {
            const dispositivoSelect = document.getElementById('dispositivoId');
            dispositivoSelect.innerHTML = '<option value="">Selecione um dispositivo</option>';
            if (data.dispositivos) {
                data.dispositivos.forEach(dispositivo => {
                    dispositivoSelect.innerHTML += `<option value="${dispositivo.id}">${dispositivo.nome || dispositivo.id} - Consumo: ${dispositivo.consumo} kWh - Uso diário: ${dispositivo.uso_diario} horas</option>`;
                });
            } else {
                console.error('Dados de dispositivos não encontrados:', data);
            }
        })
        .catch(error => console.error('Erro ao carregar os dispositivos:', error));
}

function loadItemIds(origem) {
    const itemSelect = document.getElementById('itemId');
    let url;

    if (origem === 'dispositivos') {
        const residenciaId = document.getElementById('residenciaId').value;
        if (residenciaId) {
            url = `http://localhost:8000/dispositivos/unidades-consumidoras/${residenciaId}`;
        } else {
            console.error('ID da residência não encontrado.');
            return;
        }
    } else {
        url = `http://localhost:8000/unidades-consumidoras`;
    } 

    if (url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                itemSelect.innerHTML = '<option value="">Selecione um item</option>';
                if (origem === 'dispositivos') {
                    if (data.dispositivos) {
                        data.dispositivos.forEach(item => {
                            itemSelect.innerHTML += `
                            <option value="${item.id}">
                              ${item.nome || item.id} - Consumo: ${item.consumo} kWh - Uso diário: ${item.uso_diario} horas
                            </option>
                          `;
                        });
                    } else {
                        console.error('Dados de dispositivos não encontrados:', data);
                    }
                } else {
                    if (data.unidades_consumidoras) {
                        data.unidades_consumidoras.forEach(item => {
                            itemSelect.innerHTML += `<option value="${item.id}">${item.nome || item.id}</option>`;
                        });
                    } else {
                        console.error('Dados de unidades consumidoras não encontrados:', data);
                    }
                }
            })
            .catch(error => console.error('Erro ao carregar os IDs dos itens:', error));
    } else {
        itemSelect.innerHTML = '<option value="">Selecione um item</option>';
    }
}
function fetchBandeira() {
    const bandeiraSelect = document.getElementById("bandeiraId");
    fetch('http://127.0.0.1:8000/bandeiras')
        .then(response => response.json())
        .then(data => {
            bandeiraSelect.innerHTML = '<option value="">Selecione uma bandeira</option>';
            
            data.bandeiras.forEach(item => {
                bandeiraSelect.innerHTML += `
                    <option value="${item.id}">
                      ${item.nome || item.id} - Valor: R$${item.tarifa} 
                    </option>
                `;
            });
        })
        .catch(error => console.error('Erro ao carregar os IDs dos itens:', error));
}

function calcularConsumo() {
    let origemDoConsumo = document.getElementById('origemDoConsumo').value;

    let itemId = document.getElementById('itemId').value;
    let dispositivoId = document.getElementById('dispositivoId').value;
    const bandeira = document.getElementById('bandeiraId').value

    if (!itemId && !dispositivoId) {
        alert("Por favor, selecione um item.");
        return;
    }

    if (origemDoConsumo === 'unidades-consumidoras') {
        origemDoConsumo = 'residencia';  
    } else if (origemDoConsumo === 'dependencias') {
        origemDoConsumo = 'comodo';  
    } else if (origemDoConsumo === 'dispositivos') {
        origemDoConsumo = 'dispositivo_eletrico';
        itemId = dispositivoId;  // Defina itemId com o valor de dispositivoId
    }

    itemId = String(itemId);
    console.log(bandeira)

    fetch(`http://localhost:8000/consumos/?origem_do_consumo=${origemDoConsumo}&item_id=${itemId}&bandeira_id=${bandeira}`)
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
            <div class="alert alert-success mt-4" role="alert">
                <h4 class="alert-heading"><i class="bi bi-check-circle"></i> Consumo Calculado</h4>
                <hr>
                <p><strong>Consumo Diário:</strong> <span class="badge bg-primary">${data.consumo_diario} kWh</span></p>
                <p><strong>Consumo Mensal:</strong> <span class="badge bg-primary">${data.consumo_mensal} kWh</span></p>
                <p><strong>Consumo Anual:</strong> <span class="badge bg-primary">${data.consumo_anual} kWh</span></p>
                <p><strong>Custo Diário:</strong> <span class="badge bg-secondary">${data.custo_diario} R$</span></p>
                <p><strong>Custo Mensal:</strong> <span class="badge bg-secondary">${data.custo_mensal} R$</span></p>
                <p><strong>Custo Anual:</strong> <span class="badge bg-secondary">${data.custo_anual} R$</span></p>
            </div>`;
    } else {
        resultadoDiv.innerHTML = `
            <div class="alert alert-danger mt-4" role="alert">
                <h4 class="alert-heading"><i class="bi bi-x-circle"></i> Erro ao Calcular</h4>
                <hr>
                <p>Não foi possível calcular o consumo. Por favor, verifique os dados e tente novamente.</p>
            </div>`;
    }
}

