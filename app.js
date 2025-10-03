debugger;
let data = [];
let listaDeRegistros = [];

setearFecha();
document.getElementById('inputExcel').addEventListener('change', handleFile);
document.getElementById("utilidad_fecha").addEventListener("change", handleSelectDate);

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
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        document.getElementById('totalVentaAcumulado').innerText = "0";
        document.getElementById('totalUtilidadAcumulado').innerText = "0";
    }
}

function renderResultado(registro) {
    //debugger;
    const tbody = document.querySelector("tbody");
    let index = 0;
    tbody.innerHTML = "";

    for (const key in registro) {
        const tr = document.createElement("tr");

        if(key === "ventaXDiaYAcumulado" || key === "utilidadXDiaYAcumulado") continue; // Saltar acumulados
        
        const row = registro[key];
        
        tr.innerHTML = `
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
                <button class="edit-btn" onclick="editRow(${index})">✏️</button>
                <button class="delete-btn" onclick="deleteRow(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
        index++;
    };

    calcularAcumulados(registro);
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

    alert(`Cálculos automáticos:
        Precio Pipa VDM: ${precioPipaVDM}
        LITROS COMPRADOS: ${litrosComprados}
        PRECIO COMPRA X LITRO: ${precioCompraxLitro}
        PRECIO VENTA X LITRO: ${precioVentaXLitro}
        VENTA DE PIPA: ${ventaPipa}
        UTILIDAD: ${utilidad}
        % UTILIDAD: ${utilidadPorcentaje}
        UTILIDAD POR PIPA: ${utilidadPipa}
        UTILIDAD X LITRO: ${utilidadXLitro}
        VTA.LTS.X.DIA.Y PRO: ${ventaLitrosXDiaYPro}
        UTILIDAD $ ..X PRODUCTO: ${utilidadXProducto}
    `);

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

// Funciones para editar y eliminar filas
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

    // Agregar a data para exportar
    data.push({
        "Fecha": fecha,
        "Combustible": combustible,
        "PRECIO PIPA VDM": nuevo.precioPipaVDM,
        "LITROS COMPRADOS": nuevo.litrosComprados,
        "PRECIO COMPRA X LITRO": nuevo.precioCompraxLitro,
        "PRECIO VENTA X LITRO": nuevo.precioXLitro,
        "VENTA DE PIPA": nuevo.ventaPipa,
        "UTILIDAD": nuevo.utilidad,
        "% UTILIDAD": nuevo.utilidadPorcentaje,
        "UTILIDAD POR PIPA": nuevo.utilidadPipa,
        "UTILIDAD X LITRO": nuevo.utilidadXLitro,
        "VTA.LTS.X.DIA.Y PRO": nuevo.ventaLitrosXDiaYPro,
        "VTA. X DIA Y ACUMUL": combustible == 'Magna' ? ventaXDiaYAcumuladoRetroactivo : (combustible == 'Diesel' ? registro[fecha][combustible].ventaXDiaYAcumulado : ''),
        "UTILIDAD $ ..X PRODUCTO": nuevo.utilidadXProducto,
        "UT.. X DIA Y ACUMUL":  combustible == 'Magna' ? utilidadXDiaYAcumuladoRetroactivo : (combustible == 'Diesel' ? registro[fecha][combustible].utilidadXDiaYAcumulado : ''),
        "TOTAL VENTA X DIA": registro[fecha].ventaXDiaYAcumulado,
        "TOTAL UTILIDAD X DIA": registro[fecha].utilidadXDiaYAcumulado
    });

    renderResultado(registro[fecha]);
         
    
    //renderResultado(listaDeRegistros.find(r => Object.keys(r)[0] == fecha)[fecha]);
}

function editRow(index) {
    const row = data[index];
    const fecha = row.Fecha;
    const combustible = row.Combustible;
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

            // Actualizar datos en memoria
            Object.assign(entry, nuevo);
            Object.assign(row, {
                "VTA.LTS.X.DIA.Y PRO": nuevo.ventaLitrosXDiaYPro,
                "UTILIDAD $ ..X PRODUCTO": nuevo.utilidadXProducto,
                "VTA. X DIA Y ACUMUL": combustible == 'Diesel' ? resumen.ventaXDiaYAcumulado : '',
                "UT.. X DIA Y ACUMUL": combustible == 'Diesel' ? resumen.utilidadXDiaYAcumulado : '',
                "TOTAL VENTA X DIA": resumen.ventaXDiaYAcumulado,
                "TOTAL UTILIDAD X DIA": resumen.utilidadXDiaYAcumulado
            });
            data[index] = row;

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

        Object.assign(row, {
            "PRECIO PIPA VDM": nuevo.precioPipaVDM,
            "LITROS COMPRADOS": nuevo.litrosComprados,
            "PRECIO COMPRA X LITRO": nuevo.precioCompraxLitro,
            "PRECIO VENTA X LITRO": nuevo.precioXLitro,
            "VENTA DE PIPA": nuevo.ventaPipa,
            "UTILIDAD": nuevo.utilidad,
            "% UTILIDAD": nuevo.utilidadPorcentaje,
            "UTILIDAD POR PIPA": nuevo.utilidadPipa,
            "UTILIDAD X LITRO": nuevo.utilidadXLitro,
            "VTA.LTS.X.DIA.Y PRO": nuevo.ventaLitrosXDiaYPro,
            "UTILIDAD $ ..X PRODUCTO": nuevo.utilidadXProducto,
            "VTA. X DIA Y ACUMUL": combustible == 'Diesel' ? resumen.ventaXDiaYAcumulado : '',
            "UT.. X DIA Y ACUMUL": combustible == 'Diesel' ? resumen.utilidadXDiaYAcumulado : '',
            "TOTAL VENTA X DIA": registro[fecha].ventaXDiaYAcumulado,
            "TOTAL UTILIDAD X DIA": registro[fecha].utilidadXDiaYAcumulado
        });
        data[index] = row;

        renderResultado(resumen);
    }
}

function deleteRow(index) {
    if (confirm("¿Eliminar este registro?")) {
        let row = data[index];
        let fecha = row.Fecha;
        let combustible = row.Combustible;
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
        data.splice(index, 1);
        renderResultado(registro ? registro[fecha] : {});
    }
}

// Manejo de archivo Excel
function handleFile(e) {
    //debugger
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
    const dataBinary = event.target.result;
    const workbook = XLSX.read(dataBinary, { type: 'binary' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(sheet);
    renderTable();
    };

    reader.readAsBinaryString(file);
}

function renderTable() {
    debugger;
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    
    let objetoTemporal = {}; 
    let fecha = "";

    data.forEach(row => {
        //debugger;
        fecha = row.Fecha || fecha; // mantiene la última fecha válida
        const combustible = row.Combustible;

        if (!combustible) return; // evita filas vacías
        if (fecha && !objetoTemporal[fecha]) objetoTemporal[fecha] = {};
        
        objetoTemporal[fecha][combustible] = {
            precioPipaVDM: toNum(row["PRECIO PIPA VDM"]),
            litrosComprados: toNum(row["LITROS COMPRADOS"]),
            precioCompraxLitro: toNum(row["PRECIO COMPRA X LITRO"]),
            precioXLitro: toNum(row["PRECIO VENTA X LITRO"]),
            ventaPipa: toNum(row["VENTA DE PIPA"]),
            utilidad: toNum(row["UTILIDAD"]),
            utilidadPorcentaje: toNum(row["% UTILIDAD"]),
            utilidadPipa: toNum(row["UTILIDAD POR PIPA"]),
            utilidadXLitro: toNum(row["UTILIDAD X LITRO"]),
            ventaLitrosXDiaYPro: toNum(row["VTA.LTS.X.DIA.Y PRO"]),
            ventaXDiaYAcumulado: toNum(row["VTA. X DIA Y ACUMUL"]),
            utilidadXProducto: toNum(row["UTILIDAD $ ..X PRODUCTO"]),
            utilidadXDiaYAcumulado: toNum(row["UT.. X DIA Y ACUMUL"]),

        };

        // Si ya se registró el Diesel, guardamos el grupo de la fecha completa
        if (combustible == "Diesel") {
            debugger;
            //listaDeRegistros.push({ [fecha]: objetoTemporal[fecha] });
            listaDeRegistros.push({ 
                [fecha]: { 
                    ...objetoTemporal[fecha], 
                    ventaXDiaYAcumulado: Number(objetoTemporal[fecha][combustible].ventaXDiaYAcumulado), 
                    utilidadXDiaYAcumulado: Number(objetoTemporal[fecha][combustible].utilidadXDiaYAcumulado)   
                } 
            });
            objetoTemporal = {}; // limpia para evitar duplicados
        }
    })

    debugger
    // * Si existe un registro para la fecha actual, mostrarlo
    const fechaSeleccionada = document.getElementById('utilidad_fecha').value;
    const [anio, mes, dia] = fechaSeleccionada.split("-");
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    const registroEncontrado = listaDeRegistros.find(r => Object.keys(r)[0] == fechaFormateada);

    if(registroEncontrado){
        renderResultado(registroEncontrado[fechaFormateada]);
    }

    console.log(listaDeRegistros);
}

// 🔧 Funciones utilitarias
function exportToExcel() {
    if (data.length === 0) {
    alert("No hay datos para exportar.");
    return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    XLSX.writeFile(wb, "reporte_actualizado.xlsx");
}

const toNum = (valor) => {
    if (typeof valor == "string") {
        // Si contiene punto y coma, asume formato europeo: 478.223,87
        if (valor.includes('.') && valor.includes(',')) {
            valor = valor.replace(/\./g, ''); // Elimina todos los puntos (separador de miles)
            valor = valor.replace(',', '.');  // Reemplaza la coma por punto (decimal)
        }else if(valor.includes(',')){
            valor = valor.replace(',', '.');  // Reemplaza la coma por punto (decimal)
        }
    }
    return isNaN(parseFloat(valor)) ? 0 : parseFloat(valor).toFixed(2);
};

function promptNumero(mensaje) {
    let valor;
    do {
        valor = prompt(mensaje);
        if (valor === null) return null; // Si cancela, salir
        if (!isNaN(valor) && valor.trim() !== "") return parseFloat(valor);
        alert("Por favor, ingresa un número válido.");
    } while (true);
};

function formatearNumero(numero) {
    //debugger;
    numero = Number(numero);

    let resultado = numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function calcularAcumulados(registro) {
    debugger;
    document.getElementById('totalVentaAcumulado').innerText = formatearNumero(registro.ventaXDiaYAcumulado || 0);
    document.getElementById('totalUtilidadAcumulado').innerText = formatearNumero(registro.utilidadXDiaYAcumulado || 0);
}

function setearFecha() {
    //debugger;
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    const fechaActual = `${yyyy}-${mm}-${dd}`;
    document.getElementById('utilidad_fecha').value = fechaActual;
}