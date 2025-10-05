
/* 
    Control de Utilidad - Gestión de Pipas y Turnos
    Autor: Luvid
    Fecha: 2024-10-01
    Descripción: Aplicación web para gestionar el control de utilidad de pipas y turnos, con funcionalidades de importación y exportación de datos en Excel.
    Tecnologías: HTML, CSS, JavaScript, XLSX.js
    Estructura del Proyecto:
    - index.html: Estructura y diseño de la interfaz de usuario.
    - styles.css: Estilos y diseño visual.
    - app.js: Lógica principal de la aplicación y manejo de eventos.
    - dataPipas.js: Funciones específicas para la gestión de datos de pipas.
    - dataTurnos.js: Funciones específicas para la gestión de datos de turnos.
    - excelUtils.js: Funciones para la importación y exportación de datos en Excel.
    - utils.js: Funciones utilitarias comunes.
    Instrucciones de Uso:
    1. Abrir index.html en un navegador web.
    2. Utilizar los formularios para agregar, editar o eliminar registros de pipas y turnos.
    3. Importar datos desde un archivo Excel utilizando el botón de carga.
    4. Exportar los datos actuales a un archivo Excel utilizando el botón de exportación.
    5. Filtrar y visualizar los datos según la fecha seleccionada.
    Notas:
    - Asegurarse de que el archivo Excel importado tenga el formato correcto.
    - Los datos se almacenan temporalmente en memoria; no hay persistencia en una base de datos.
    - Esta aplicación es una demostración y puede ser extendida con funcionalidades adicionales según las necesidades.
*/

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

