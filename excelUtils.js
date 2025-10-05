function handleFile(e) {
    //debugger
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const dataBinary = event.target.result;
        const workbook = XLSX.read(dataBinary, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet);

        const sheetTurno = workbook.Sheets["Turno"];
        if (sheetTurno) {
            turnosData = XLSX.utils.sheet_to_json(sheetTurno);

            // Agrupar por fecha y turnos
            let agrupado = {};
            turnosData.forEach(row => {
                debugger;
                const fecha = row.Fecha;
                const turno = row.Turno;
                if (!agrupado[fecha]) agrupado[fecha] = {};
                if (!agrupado[fecha][turno]) agrupado[fecha][turno] = { turno };
                if (row.Magna) {
                    agrupado[fecha][turno]['Magna'] = { litros: Number(row.Magna) };
                }
                if (row.Premium) {
                    agrupado[fecha][turno]['Premium'] = { litros: Number(row.Premium) };
                }
                if (row.Diesel) {
                    agrupado[fecha][turno]['Diesel'] = { litros: Number(row.Diesel) };
                }
            });
            // Convertir a listaDeRegistrosTurno
            listaDeRegistrosTurno = Object.entries(agrupado).map(([fecha, turnosObj]) => ({
                fecha,
                turnos: Object.values(turnosObj)
            }));
        }

        renderTable();
    };

    reader.readAsBinaryString(file);
}

function exportToExcel() {
    // Hoja principal
    data = convertirListaDeRegistrosAData();

    if (data.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Hoja de cambio de precio
    const turnosData = procesarTurnosParaExcel(false);

    // Crear libro y hojas
    const wb = XLSX.utils.book_new();

    // Hoja principal
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    // Hoja Turno (datos crudos de listaDeRegistrosTurno)
    if (listaDeRegistrosTurno && listaDeRegistrosTurno.length > 0) {
        // Convertir a formato plano para Excel
        let hojaTurno = [];
        listaDeRegistrosTurno.forEach(dia => {
            dia.turnos.forEach(turnoObj => {
                hojaTurno.push({
                    Fecha: dia.fecha,
                    Turno: turnoObj.turno,
                    Magna: turnoObj.Magna?.litros || 0,
                    Premium: turnoObj.Premium?.litros || 0,
                    Diesel: turnoObj.Diesel?.litros || 0
                });
            });
        });
        const wsTurnoRaw = XLSX.utils.json_to_sheet(hojaTurno, { header: ["Fecha", "Turno", "Magna", "Premium", "Diesel"] });
        XLSX.utils.book_append_sheet(wb, wsTurnoRaw, "Turno");
    }

    // Hoja de cambio de precio
    if (turnosData && turnosData.length > 0) {
        const wsTurnos = XLSX.utils.json_to_sheet(turnosData, { header: ["Fecha", "Turno", "Combustible", "LitrosVendidos", "PrecioAplicado", "PrecioNuevo", "Mensaje"] });
        XLSX.utils.book_append_sheet(wb, wsTurnos, "Cambio de Precio");
    }

    XLSX.writeFile(wb, "reporte_actualizado.xlsx");
}

function renderTable() {
    debugger;
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";
    
    let objetoTemporal = {}; 
    let fecha = "";

    // Tabla principal de listaDeRegistros
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
                    ventaXDiaYAcumulado: toNum(row["TOTAL VTA. X DIA Y ACUMUL"]),
                    utilidadXDiaYAcumulado: toNum(row["TOTAL UT.. X DIA Y ACUMUL"]) 
                    //ventaXDiaYAcumulado: Number(objetoTemporal[fecha][combustible].ventaXDiaYAcumulado), 
                    //utilidadXDiaYAcumulado: Number(objetoTemporal[fecha][combustible].utilidadXDiaYAcumulado)   
                } 
            });
            objetoTemporal = {}; // limpia para evitar duplicados
        }
    })

    // Tabla Turnos

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