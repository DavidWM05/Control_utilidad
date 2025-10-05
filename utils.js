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
    //
};

function formatearNumero(numero) {
    //debugger;
    numero = Number(numero);

    let resultado = numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return resultado;
}

function setearFecha() {
    //debugger;
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    const fechaActual = `${yyyy}-${mm}-${dd}`;
    document.getElementById('utilidad_fecha').value = fechaActual;
    document.getElementById('utilidad_turno_fecha').value = fechaActual;
}