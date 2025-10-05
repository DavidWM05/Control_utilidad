function procesarTurnosParaExcel() {
    debugger;
    // Asegúrate de tener listaDeRegistros y listaDeRegistrosTurno cargados
    const resultado = [];
    const combustibles = ["Magna", "Premium", "Diesel"];

    // 1. Construir un mapa de pipas por combustible ordenadas por fecha
    const pipasPorCombustible = { Magna: [], Premium: [], Diesel: [] };
    listaDeRegistros.forEach(registroFecha => {
        const fecha = Object.keys(registroFecha)[0];
        const registro = registroFecha[fecha];
        combustibles.forEach(comb => {
            if (registro[comb]) {
                pipasPorCombustible[comb].push({
                    fecha,
                    litros: Number(registro[comb].litrosComprados),
                    precio: Number(registro[comb].precioXLitro)
                });
            }
        });
    });
    // Ordenar pipas por fecha para cada combustible
    combustibles.forEach(comb => {
        pipasPorCombustible[comb].sort((a, b) => {
            const [d1, m1, y1] = a.fecha.split('/').map(Number);
            const [d2, m2, y2] = b.fecha.split('/').map(Number);
            return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        });
    });

    // 2. Procesar los turnos
    listaDeRegistrosTurno.forEach(diaTurno => {
        //debugger;
        const fecha = diaTurno.fecha;
        diaTurno.turnos.forEach(turnoObj => {
            combustibles.forEach(comb => {
                debugger;
                let litrosPendientes = Number(turnoObj[comb]?.litros || 0);
                if (litrosPendientes <= 0) return;

                // Buscar la pipa activa para este combustible
                let pipaIdx = 0;
                let precioAplicado = null;
                let precioNuevo = null;

                // Mantener un stock virtual por combustible
                if (!procesarTurnosParaExcel.stock) procesarTurnosParaExcel.stock = {};
                if (!procesarTurnosParaExcel.stock[comb]) {
                    // Inicializar stock y pipaIdx
                    procesarTurnosParaExcel.stock[comb] = {
                        idx: 0,
                        restante: pipasPorCombustible[comb][0]?.litros || 0
                    };
                }
                let stock = procesarTurnosParaExcel.stock[comb];

                while (litrosPendientes > 0 && stock.idx < pipasPorCombustible[comb].length) {
                    const pipa = pipasPorCombustible[comb][stock.idx];
                    precioAplicado = pipa.precio;
                    let litrosDeEstaPipa = Math.min(litrosPendientes, stock.restante);

                    stock.restante -= litrosDeEstaPipa;
                    litrosPendientes -= litrosDeEstaPipa;                    

                    // Si se acaba la pipa, pasar a la siguiente
                    if (stock.restante === 0 && litrosPendientes > 0) {
                        stock.idx++;
                        if (stock.idx < pipasPorCombustible[comb].length) {
                            const nuevaPipa = pipasPorCombustible[comb][stock.idx];
                            precioNuevo = nuevaPipa.precio;
                            // Registrar el cambio de precio en la siguiente fila
                            resultado.push({
                                Fecha: fecha,
                                Turno: turnoObj.turno,
                                Combustible: comb,
                                LitrosVendidos: turnoObj[comb].litros,
                                PrecioAplicado: precioAplicado,
                                PrecioNuevo: precioNuevo,
                                Mensaje: `La pipa fecha ${pipa.fecha} se agotó, se usará pipa fecha ${nuevaPipa.fecha}`
                            });
                            stock.restante = nuevaPipa.litros;
                            litrosPendientes = 0; // Forzar salida del while
                        }else{
                            // No hay más pipas, salir
                            resultado.push({
                                Fecha: fecha,
                                Turno: turnoObj.turno,
                                Combustible: comb,
                                LitrosVendidos: turnoObj[comb].litros,
                                PrecioAplicado: precioAplicado,
                                PrecioNuevo: null,
                                Mensaje: `No hay más pipas disponibles para ${comb}`
                            });
                            litrosPendientes = 0; // Forzar salida del while
                        }
                    }else{
                        resultado.push({
                            Fecha: fecha,
                            Turno: turnoObj.turno,
                            Combustible: comb,
                            LitrosVendidos: turnoObj[comb]?.litros,
                            PrecioAplicado: precioAplicado,
                            PrecioNuevo: null,
                            Mensaje: `Usados ${litrosDeEstaPipa}L de pipa, quedan ${stock.restante}L`
                        });
                    }
                }
            });
        });
    });

    // Limpiar el stock virtual para futuras ejecuciones
    delete procesarTurnosParaExcel.stock;

    alert("Procesamiento de turnos para Excel completado.");

    return resultado;
}

function addNewRowTurno() {
    // Solicitar datos al usuario
    let fecha = document.getElementById('utilidad_turno_fecha').value;
    if (!fecha) return alert("Fecha es obligatoria.");
    const [anio, mes, dia] = fecha.split("-");
    fecha = `${dia}/${mes}/${anio}`; // Formato dd/mm/yyyy

    // Turnos posibles
    const turnos = [
        "12am-6am",
        "6am-2pm",
        "2pm-9pm",
        "9pm-12am"
    ];

    // Buscar si ya existe la fecha
    let registroFecha = listaDeRegistrosTurno.find(r => r.fecha === fecha);
    if (!registroFecha) {
        registroFecha = { fecha, turnos: [] };
        listaDeRegistrosTurno.push(registroFecha);
    }

    // Solicitar datos para cada turno
    turnos.forEach(turno => {
        let magna = Number(prompt(`Litros vendidos de Magna para el turno ${turno}:`) || 0);
        let premium = Number(prompt(`Litros vendidos de Premium para el turno ${turno}:`) || 0);
        let diesel = Number(prompt(`Litros vendidos de Diesel para el turno ${turno}:`) || 0);

        // Buscar si ya existe el turno
        let turnoObj = registroFecha.turnos.find(t => t.turno === turno);
        if (!turnoObj) {
            turnoObj = { turno };
            registroFecha.turnos.push(turnoObj);
        }
        turnoObj.Magna = { litros: magna };
        turnoObj.Premium = { litros: premium };
        turnoObj.Diesel = { litros: diesel };
    });

    alert("Turnos agregados/actualizados para la fecha " + fecha);
}

function editRowTurno(fecha, turno) {
    // Buscar el registro de la fecha y turno
    let registroFecha = listaDeRegistrosTurno.find(r => r.fecha === fecha);
    if (!registroFecha) return alert("No existe registro para esa fecha.");
    let turnoObj = registroFecha.turnos.find(t => t.turno === turno);
    if (!turnoObj) return alert("No existe ese turno para la fecha.");

    // Editar litros vendidos
    let magna = Number(prompt(`Nuevo valor para Magna en turno ${turno}:`, turnoObj.Magna?.litros || 0) || 0);
    let premium = Number(prompt(`Nuevo valor para Premium en turno ${turno}:`, turnoObj.Premium?.litros || 0) || 0);
    let diesel = Number(prompt(`Nuevo valor para Diesel en turno ${turno}:`, turnoObj.Diesel?.litros || 0) || 0);

    turnoObj.Magna = { litros: magna };
    turnoObj.Premium = { litros: premium };
    turnoObj.Diesel = { litros: diesel };

    alert("Turno actualizado.");
}

function renderTurnoTable() {
    const tbody = document.querySelector("#turnoTable tbody");
    tbody.innerHTML = "";

    let fecha = document.getElementById('utilidad_turno_fecha').value;
    if (!fecha) return; // Si no hay fecha seleccionada, no hacer nada
    const [anio, mes, dia] = fecha.split("-");
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    
    if (!listaDeRegistrosTurno || listaDeRegistrosTurno.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">Sin registros de turnos.</td>`;
        tbody.appendChild(tr);
        return;
    }

    // Filtrar registros para la fecha seleccionada
    const turnoSeleccionado = listaDeRegistrosTurno.filter(r => r.fecha === fechaFormateada);

    if (turnoSeleccionado.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">No hay datos para la fecha seleccionada.</td>`;
        tbody.appendChild(tr);
        return;
    }

    turnoSeleccionado.forEach(dia => {
        dia.turnos.forEach(turnoObj => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${turnoObj.turno}</td>
                <td>${turnoObj.Magna ? formatearNumero(turnoObj.Magna.litros) : '0.00'}</td>
                <td>${turnoObj.Premium ? formatearNumero(turnoObj.Premium.litros) : '0.00'}</td>
                <td>${turnoObj.Diesel ? formatearNumero(turnoObj.Diesel.litros) : '0.00'}</td>
                <td>
                    <button class="edit-btn" onclick="editRowTurno('${dia.fecha}', '${turnoObj.turno}')">✏️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}