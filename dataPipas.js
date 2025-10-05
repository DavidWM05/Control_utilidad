function addNewRow() {
    //debugger;
    let fecha = document.getElementById('utilidad_fecha').value;
    if (!fecha) return alert("Fecha es obligatoria.");
    const [anio, mes, dia] = fecha.split("-");
    fecha = `${dia}/${mes}/${anio}`; // Formato dd/mm/yyyy

    if(listaDeRegistros.find(r => Object.keys(r)[0] == fecha)){
        if(!confirm("Ya existe un registro para esta fecha. ¿Deseas agregar otro combustible?")){
            return;
        }
    }

    let combustible = prompt("Tipo de Combustible:").toLowerCase();
    if (!combustible) return alert("Tipo de Combustible es obligatorio.");

    combustible = combustible.charAt(0).toUpperCase() + combustible.slice(1); // Capitaliza la primera letra
    if(!['Magna','Premium','Diesel'].includes(combustible)) return alert("Tipo de Combustible inválido. Debe ser Magna, Premium o Diesel.");

    let nuevo = solicitudDatos();
    if (!nuevo) return; // Si el usuario canceló o hubo error

    // Obtener acumulados de la fecha anterior solo para Magna
    let ventaXDiaYAcumulado = 0;
    let utilidadXDiaYAcumulado = 0;
    let ventaXDiaYAcumuladoRetroactivo = 0;
    let utilidadXDiaYAcumuladoRetroactivo = 0;

    if (combustible === 'Magna') {
        const acumuladoAnterior = obtenerAcumuladoAnterior(fecha);
        ventaXDiaYAcumuladoRetroactivo = acumuladoAnterior.ventaXDiaYAcumulado;
        utilidadXDiaYAcumuladoRetroactivo = acumuladoAnterior.utilidadXDiaYAcumulado;
        ventaXDiaYAcumulado += ventaXDiaYAcumuladoRetroactivo;
        utilidadXDiaYAcumulado += utilidadXDiaYAcumuladoRetroactivo;
    }

    if(nuevo.ventaLitrosXDiaYPro){ ventaXDiaYAcumulado += Number(nuevo.ventaLitrosXDiaYPro); }
    if(nuevo.utilidadXProducto){ utilidadXDiaYAcumulado += Number(nuevo.utilidadXProducto); }

    // Crear nuevo objeto y agregar a data
    let existeFecha = listaDeRegistros.find(r => Object.keys(r)[0] == fecha);
    if (existeFecha) {
        existeFecha[fecha][combustible] = nuevo;
        existeFecha[fecha].ventaXDiaYAcumulado += ventaXDiaYAcumulado;
        existeFecha[fecha].utilidadXDiaYAcumulado += utilidadXDiaYAcumulado;
    } else {
        listaDeRegistros.push({ [fecha]: { 
            [combustible]: nuevo,
            ventaXDiaYAcumulado,
            utilidadXDiaYAcumulado
         }});
    }

    debugger;
    let registro = listaDeRegistros.find(r => Object.keys(r)[0] == fecha);
    
    if(combustible === 'Magna' && ventaXDiaYAcumuladoRetroactivo != 0 && utilidadXDiaYAcumuladoRetroactivo != 0){
        registro[fecha][combustible].ventaXDiaYAcumulado = ventaXDiaYAcumuladoRetroactivo;
        registro[fecha][combustible].utilidadXDiaYAcumulado = utilidadXDiaYAcumuladoRetroactivo;
    }

    if(combustible === 'Diesel'){
        registro[fecha][combustible].ventaXDiaYAcumulado = registro[fecha].ventaXDiaYAcumulado - registro[fecha]['Magna']?.ventaXDiaYAcumulado || 0;
        registro[fecha][combustible].utilidadXDiaYAcumulado = registro[fecha].utilidadXDiaYAcumulado - registro[fecha]['Magna']?.utilidadXDiaYAcumulado || 0;
    }

    renderResultado(registro[fecha]);
         
    
    //renderResultado(listaDeRegistros.find(r => Object.keys(r)[0] == fecha)[fecha]);
}

function editRow(combustibleKey) {
    let fecha = document.getElementById('utilidad_fecha').value;
    if (!fecha) return alert("Fecha es obligatoria.");
    const [anio, mes, dia] = fecha.split("-");
    fecha = `${dia}/${mes}/${anio}`; // Formato dd/mm/yyyy

    const combustible = combustibleKey;
    const registro = listaDeRegistros.find(r => Object.keys(r)[0] === fecha);

    if (!registro) {
        console.error("Registro no encontrado para la fecha:", fecha);
        return;
    }

    const entry = registro[fecha][combustible];
    const resumen = registro[fecha];

    // Función auxiliar para actualizar acumulados
    const actualizarAcumulados = (nuevo, anterior) => {
        debugger;
        if (resumen.ventaXDiaYAcumulado) 
            resumen.ventaXDiaYAcumulado = Number(resumen.ventaXDiaYAcumulado) - Number(anterior.ventaLitrosXDiaYPro);
        if (resumen.utilidadXDiaYAcumulado)
            resumen.utilidadXDiaYAcumulado = Number(resumen.utilidadXDiaYAcumulado) - Number(anterior.utilidadXProducto);

        resumen.ventaXDiaYAcumulado += Number(nuevo.ventaLitrosXDiaYPro);
        resumen.utilidadXDiaYAcumulado += Number(nuevo.utilidadXProducto);
    };

    // --- Opción 1: Editar solo venta litros por día y producto ---
    if (confirm("¿Editar venta litros x día y producto?")) {
        const nuevoValor = Number(promptNumero("Nuevo valor para VTA.LTS.X.DIA.Y PRO:"));
        if (!isNaN(nuevoValor)) {
            const nuevo = {
                ...entry,
                ventaLitrosXDiaYPro: nuevoValor,
                utilidadXProducto: nuevoValor * (entry.utilidadXLitro * -1)
            };

            actualizarAcumulados(nuevo, entry);
            renderResultado(resumen);
        }
        return;
    }

    // --- Opción 2: Editar todo el registro ---
    if (confirm("¿Editar todo el registro?")) {
        const nuevo = solicitudDatos();
        if (!nuevo) return;

        actualizarAcumulados(nuevo, entry);

        // Actualiza el registro completo
        registro[fecha][combustible] = nuevo;
        renderResultado(resumen);
    }
}

function deleteRow(combustibleKey) {
    if (confirm("¿Eliminar este registro?")) {
        let fecha = document.getElementById('utilidad_fecha').value;
        if (!fecha) return alert("Fecha es obligatoria.");
        const [anio, mes, dia] = fecha.split("-");
        fecha = `${dia}/${mes}/${anio}`; // Formato dd/mm/yyyy

        let combustible = combustibleKey;
        let registro = listaDeRegistros.find(r => Object.keys(r)[0] == fecha);
        if (registro) {
            if (registro[fecha].ventaXDiaYAcumulado != 0) {
                registro[fecha].ventaXDiaYAcumulado -= registro[fecha][combustible].ventaLitrosXDiaYPro;
            }
            if (registro[fecha].utilidadXDiaYAcumulado != 0) {
                registro[fecha].utilidadXDiaYAcumulado -= registro[fecha][combustible].utilidadXProducto;
            }
            delete registro[fecha][combustible];

            // Si ya no quedan combustibles para esa fecha, eliminar todo el registro
            if (Object.keys(registro[fecha]).length === 2) { // Solo quedan los acumulados
                listaDeRegistros = listaDeRegistros.filter(r => Object.keys(r)[0] !== fecha);
            }
        }
        renderResultado(registro ? registro[fecha] : {});
    }
}

function calcularAcumuladosBoton() {
    let fechaSeleccionada = document.getElementById('utilidad_fecha').value; // formato: "2025-09-30"
    fechaSeleccionada = fechaSeleccionada.split("-").reverse().join("/"); // formato: "30/09/2025"
    console.log("La fecha seleccionada es:", fechaSeleccionada);
    const registroEncontrado = listaDeRegistros.find(r => Object.keys(r)[0] == fechaSeleccionada);
    if(registroEncontrado){ 
        calcularAcumulados(registroEncontrado[fechaSeleccionada]); 
    } else {
        alert("No hay datos para la fecha seleccionada.");
        document.getElementById('totalVentaAcumulado').innerText = "0";
        document.getElementById('totalUtilidadAcumulado').innerText = "0";
    }
}

function convertirListaDeRegistrosAData() {
    const resultado = [];
    listaDeRegistros.forEach(registroFecha => {
        const fecha = Object.keys(registroFecha)[0];
        const registro = registroFecha[fecha];
        // Recorre cada combustible (Magna, Premium, Diesel)
        for (const combustible in registro) {
            if (combustible === "ventaXDiaYAcumulado" || combustible === "utilidadXDiaYAcumulado") continue;
            const row = registro[combustible];
            resultado.push({
                "Fecha": fecha,
                "Combustible": combustible,
                "PRECIO PIPA VDM": row.precioPipaVDM,
                "LITROS COMPRADOS": row.litrosComprados,
                "PRECIO COMPRA X LITRO": row.precioCompraxLitro,
                "PRECIO VENTA X LITRO": row.precioXLitro,
                "VENTA DE PIPA": row.ventaPipa,
                "UTILIDAD": row.utilidad,
                "% UTILIDAD": row.utilidadPorcentaje,
                "UTILIDAD POR PIPA": row.utilidadPipa,
                "UTILIDAD X LITRO": row.utilidadXLitro,
                "VTA.LTS.X.DIA.Y PRO": row.ventaLitrosXDiaYPro,
                "VTA. X DIA Y ACUMUL": row.ventaXDiaYAcumulado,
                "UTILIDAD $ ..X PRODUCTO": row.utilidadXProducto,
                "UT.. X DIA Y ACUMUL": row.utilidadXDiaYAcumulado,
                "TOTAL VTA. X DIA Y ACUMUL": registro.ventaXDiaYAcumulado,
                "TOTAL UT. X DIA Y ACUMUL": registro.utilidadXDiaYAcumulado
            });
        }
    });
    return resultado;
}

function obtenerAcumuladoAnterior(fechaActual) {
    debugger;

    // Convierte la fecha actual a objeto Date
    const [dia, mes, anio] = fechaActual.split('/');
    const fechaObj = new Date(`${anio}-${mes}-${dia}`);

    // Busca la fecha anterior más cercana en listaDeRegistros
    let fechaAnterior = null;
    let minDiff = Infinity;

    for (const registro of listaDeRegistros) {
        const key = Object.keys(registro)[0];
        const [d, m, a] = key.split('/');
        const fechaReg = new Date(`${a}-${m}-${d}`);
        const diff = fechaObj - fechaReg;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            fechaAnterior = registro[key];
        }
    }

    if (fechaAnterior) {
        return {
            ventaXDiaYAcumulado: Number(fechaAnterior.ventaXDiaYAcumulado) || 0,
            utilidadXDiaYAcumulado: Number(fechaAnterior.utilidadXDiaYAcumulado) || 0
        };
    }
    return { ventaXDiaYAcumulado: 0, utilidadXDiaYAcumulado: 0 };
}

function renderResultado(registro) {
    //debugger;
    const tbody = document.querySelector("#dataTable tbody");
    let index = 0;
    tbody.innerHTML = "";

    for (const key in registro) {
        const tr = document.createElement("tr");

        if(key === "ventaXDiaYAcumulado" || key === "utilidadXDiaYAcumulado") continue; // Saltar acumulados
        
        const row = registro[key];
        
        tr.innerHTML = `
            <td>${key}</td>
            <td>${formatearNumero(row.precioPipaVDM)}</td>
            <td>${formatearNumero(row.litrosComprados)}</td>
            <td>${formatearNumero(row.precioCompraxLitro)}</td>
            <td>${formatearNumero(row.precioXLitro)}</td>
            <td>${formatearNumero(row.ventaPipa)}</td>
            <td>${formatearNumero(row.utilidad)}</td>
            <td>${formatearNumero(row.utilidadPorcentaje)}</td>
            <td>${formatearNumero(row.utilidadPipa)}</td>
            <td>${formatearNumero(row.utilidadXLitro)}</td>
            <td>${formatearNumero(row.ventaLitrosXDiaYPro)}</td>
            <td>${formatearNumero(row.ventaXDiaYAcumulado)}</td>
            <td>${formatearNumero(row.utilidadXProducto)}</td>
            <td>${formatearNumero(row.utilidadXDiaYAcumulado)}</td>
            <td>
                <button class="edit-btn" onclick="editRow('${key}')">✏️</button>
                <button class="delete-btn" onclick="deleteRow('${key}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
        index++;
    };

    calcularAcumulados(registro);

    renderTurnoTable();
}

function calcularAcumulados(registro) {
    debugger;
    document.getElementById('totalVentaAcumulado').innerText = formatearNumero(registro.ventaXDiaYAcumulado || 0);
    document.getElementById('totalUtilidadAcumulado').innerText = formatearNumero(registro.utilidadXDiaYAcumulado || 0);
}

function handleSelectDate() {
    debugger 
    let fechaSeleccionada = this.value; // formato: "2025-09-30"
    fechaSeleccionada = fechaSeleccionada.split("-").reverse().join("/"); // formato: "30/09/2025"
    console.log("La fecha seleccionada es:", fechaSeleccionada);
    
    // Buscar el registro correspondiente a la fecha seleccionada
    const registroEncontrado = listaDeRegistros.find(r => Object.keys(r)[0] == fechaSeleccionada);
    if(registroEncontrado){ 
        renderResultado(registroEncontrado[fechaSeleccionada]); 
    } else {
        alert("No hay datos para la fecha seleccionada.");
        const tbody = document.querySelector("#dataTable tbody");
        tbody.innerHTML = "";
        document.getElementById('totalVentaAcumulado').innerText = "0";
        document.getElementById('totalUtilidadAcumulado').innerText = "0";
    }
}

function solicitudDatos() {
    //debugger;
          
    let precioPipaVDM = Number(promptNumero("PRECIO PIPA VDM:"));
    if (!precioPipaVDM) return alert("PRECIO PIPA VDM es obligatorio.");
    precioPipaVDM = toNum(precioPipaVDM);

    let litrosComprados = Number(promptNumero("LITROS COMPRADOS:"));
    if (!litrosComprados) return alert("LITROS COMPRADOS es obligatorio.");
    litrosComprados = toNum(litrosComprados);

    if (litrosComprados == 0) return alert("LITROS COMPRADOS no puede ser cero.");

    let precioCompraxLitro = (precioPipaVDM / litrosComprados);
    alert(`PRECIO COMPRA X LITRO calculado: ${precioCompraxLitro}`);

    let precioVentaXLitro = Number(promptNumero("PRECIO VENTA X LITRO:"));
    if (!precioVentaXLitro) return alert("PRECIO VENTA X LITRO es obligatorio.");
    precioVentaXLitro = toNum(precioVentaXLitro);

    let ventaPipa = (precioVentaXLitro * litrosComprados);
    let utilidad = (ventaPipa - precioPipaVDM);
    let utilidadPorcentaje = ((utilidad / precioPipaVDM) * 100);
    let utilidadPipa = (precioPipaVDM*(utilidadPorcentaje/100));
    let utilidadXLitro = (precioCompraxLitro-precioVentaXLitro);

    // Variables opcionales
    debugger;
    let ventaLitrosXDiaYPro = Number(promptNumero("VTA.LTS.X.DIA.Y PRO (opcional):") || 0);
    ventaLitrosXDiaYPro = toNum(ventaLitrosXDiaYPro);

    let utilidadXProducto = ventaLitrosXDiaYPro != 0 ? toNum(ventaLitrosXDiaYPro * (utilidadXLitro * -1)) : 0;

    return {
        precioPipaVDM,
        litrosComprados,
        precioCompraxLitro,
        precioXLitro: precioVentaXLitro,
        ventaPipa,
        utilidad,
        utilidadPorcentaje,
        utilidadPipa,
        utilidadXLitro,
        ventaLitrosXDiaYPro,
        ventaXDiaYAcumulado: 0,
        utilidadXProducto,
        utilidadXDiaYAcumulado: 0
    };
}