

debugger;
let data = [];
let turnosData = [];
let listaDeRegistros = [];
let listaDeRegistrosTurno = [];
let stockCombustible = {};

setearFecha();
document.getElementById('inputExcel').addEventListener('change', handleFile);
document.getElementById("utilidad_fecha").addEventListener("change", handleSelectDate);
document.getElementById("utilidad_turno_fecha").addEventListener("change", renderTurnoTable);

