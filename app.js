debugger;
let data = [];
let listaDeRegistros = [];

setearFecha();
document.getElementById('inputExcel').addEventListener('change', handleFile);
document.getElementById("utilidad_fecha").addEventListener("change", handleDate);

function setearFecha() {
    //debugger;
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    const fechaActual = `${yyyy}-${mm}-${dd}`;
    document.getElementById('utilidad_fecha').value = fechaActual;
}

function handleDate() {
    //debugger 
    let fechaSeleccionada = this.value; // formato: "2025-09-30"
    console.log("La fecha seleccionada es:", fechaSeleccionada);

    // Aquí puedes ejecutar cualquier lógica adicional

}

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
    // 🔧 Función auxiliar para parsear valores numéricos
    const toNum = (valor) => isNaN(parseFloat(valor)) ? 0 : parseFloat(valor).toFixed(2);

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
        };

        // Si ya se registró el Diesel, guardamos el grupo de la fecha completa
        if (combustible == "Diesel") {
            debugger;
            listaDeRegistros.push({ [fecha]: objetoTemporal[fecha] });
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

function renderResultado(registro) {
    debugger;
    const tbody = document.querySelector("tbody");
    let index = 0;
    tbody.innerHTML = "";

    for (const key in registro) {
        const tr = document.createElement("tr");
        const row = registro[key];
        
        tr.innerHTML = `
            <td>${row.precioPipaVDM}</td>
            <td>${row.litrosComprados}</td>
            <td>${row.precioCompraxLitro}</td>
            <td>${row.precioXLitro}</td>
            <td>${row.ventaPipa}</td>
            <td>${row.utilidad}</td>
            <td>${row.utilidadPorcentaje}</td>
            <td>${row.utilidadPipa}</td>
            <td class="negative">${0}</td>
            <td>
            <button class="edit-btn" onclick="editRow(${index})">✏️</button>
            <button class="delete-btn" onclick="deleteRow(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
        index++;
    };
}

function renderTable__() {
    debugger;
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    data.forEach((row, index) => {
    const tr = document.createElement("tr");
    const precioPipaVDM = parseFloat(row["PRECIO PIPA VDM"]) || 0;
    const litrosComprados = parseFloat(row["LITROS COMPRADOS"]) || 0;

    if(!precioPipaVDM || !litrosComprados) return;

    const precioCompraxLitro = litrosComprados > 0 ? precioPipaVDM / litrosComprados : 0;

    tr.innerHTML = `
        <td>${precioPipaVDM.toFixed(2)}</td>
        <td>${litrosComprados.toFixed(2)}</td>
        <td>${precioCompraxLitro.toFixed(2)}</td>
        <td>${parseFloat(row["PRECIO VENTA X LITRO"]).toFixed(2) || ""}</td>
        <td>${parseFloat(row["VENTA DE PIPA"]).toFixed(2) || ""}</td>
        <td>${parseFloat(row["UTILIDAD"]).toFixed(2) || ""}</td>
        <td>${parseFloat(row["% UTILIDAD"]).toFixed(2) || ""}</td>
        <td>${parseFloat(row["UTILIDAD POR PIPA"]).toFixed(2) || ""}</td>
        <td class="negative">${parseFloat(row["UTILIDAD X LITRO"]).toFixed(2) || ""}</td>
        <td>
        <button class="edit-btn" onclick="editRow(${index})">✏️</button>
        <button class="delete-btn" onclick="deleteRow(${index})">🗑️</button>
        </td>
    `;
    tbody.appendChild(tr);
    });
}

function editRow(index) {
    const row = data[index];
    const newVenta = prompt("Nuevo PRECIO VENTA X LITRO:", row["PRECIO VENTA X LITRO"]);
    if (newVenta !== null) {
    data[index]["PRECIO VENTA X LITRO"] = newVenta;
    renderTable();
    }
}

function deleteRow(index) {
    if (confirm("¿Eliminar este registro?")) {
    data.splice(index, 1);
    renderTable();
    }
}

function addNewRow() {
    const nuevo = {
    "PRECIO PIPA VDM": prompt("PRECIO PIPA VDM:") || "",
    "LITROS COMPRADOS": prompt("LITROS COMPRADOS:") || "",
    "PRECIO COMPRA X LITRO": prompt("PRECIO COMPRA X LITRO:") || "",
    "PRECIO VENTA X LITRO": prompt("PRECIO VENTA X LITRO:") || "",
    "VENTA DE PIPA": prompt("VENTA DE PIPA:") || "",
    "UTILIDAD": prompt("UTILIDAD:") || "",
    "% UTILIDAD": prompt("% UTILIDAD:") || "",
    "UTILIDAD POR PIPA": prompt("UTILIDAD POR PIPA:") || "",
    "UTILIDAD X LITRO": prompt("UTILIDAD X LITRO:") || ""
    };
    data.push(nuevo);
    renderTable();
}

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