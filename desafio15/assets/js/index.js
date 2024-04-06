const inputPesos = document.querySelector(".input-pesos");
const selectMonena = document.querySelector(".select-css");
const mensajeError = document.querySelector('.alerta');
const botonBuscar = document.querySelector(".boton-buscar");
const contenedor = document.querySelector(".contenedor");
const resultados = document.querySelector(".resultados");
let chart;
let montoPesos = 0;

botonBuscar.addEventListener("click", () => {
    montoPesos = inputPesos.value;
    const tipoMoneda = selectMonena.value;
    //expresión regular para permitir solo numeros enteros y decimal
    const patronNumero = /^\d*\.?\d+$/; 
    //valida que se haya ingresado algún valor
    if (montoPesos == '') {
        mostrarError("Debe ingresar la cantidade CLP")
        return;
    }
    //valida que se número entero o decimal
    if (!patronNumero.test(montoPesos)) {
        mostrarError("Debe ingresar un valor numérico entero o decimal")
        return;
    }
    getFechaValorMonedas(tipoMoneda);
});

//Le pega al endpoint de miindicador con el tipo de moneda
function getFechaValorMonedas(tipoMoneda) {
    const url = `https://mindicador.cl/api/${tipoMoneda}`
    fetch(url)
        .then(respuesta => {
            return respuesta.json();
        })
        .then(datos => {
            mostrarResultados(datos, tipoMoneda)
        })
        .catch(error => {
            alert("Ocurrio un error, Mensaje: " + error.message);
            mostrarError("Ocurrio un error, intente nuevamente");
        });
}

// muestra la conversión segun el tipo de moneda y la gráfica
function mostrarResultados(fechaYValor, tipoMoneda) {
    const arrayFechasValores = fechaYValor.serie.map(objeto => ({
        fecha: objeto.fecha.slice(0, 10),
        valor: objeto.valor
    }));
    const valorMonedaHoy = arrayFechasValores[0].valor;
    const result = montoPesos / valorMonedaHoy;
    const moneda = (tipoMoneda == "dolar") ? "$" : "Є";
    const resultHtml = `<p>Resulatado: ${moneda}${result.toFixed(2)}</p>`;
    resultados.innerHTML = resultHtml;
    const valoresMoneda = arrayFechasValores.map(objeto => objeto.fecha);
    const valoresFechas = arrayFechasValores.map(objeto => objeto.valor);
    const primerasDiezFechas = valoresFechas.slice(0, 10);
    const primerosDiezValores = valoresMoneda.slice(0, 10);
    const config = prepararConfiguracionParaLaGrafica(primerasDiezFechas, primerosDiezValores);
    renderGrafica(config);
}

//configuración de la gráfica
function prepararConfiguracionParaLaGrafica(primerasDiezFechas, primerosDiezValores) {
    const tipoDeGrafica = "line";
    const titulo = "Historial últimos 10 días";
    const colorDeLinea = "red";
    const config = {
        type: tipoDeGrafica, data: {
            labels: primerosDiezValores,
            datasets: [
                {
                    label: titulo,
                    backgroundColor: colorDeLinea,
                    data: primerasDiezFechas
                }]
        }
    };
    return config;
}

async function renderGrafica(config) {
    const chartDOM = document.getElementById("myChart");
    //cuando se cambia de tipo de moneda, si existe la grafica la elimina y crea una nueva
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(chartDOM, config);
}

// muestra los mensajes de error
function mostrarError(mensaje) {
    const alerta = document.createElement('div');
    alerta.innerHTML = `
            <strong class="font-bold">Error!!</strong>
            <span class="block sm:inline">${mensaje}</span>
        `;
    mensajeError.appendChild(alerta);
    setTimeout(() => {
        inputPesos.value = '';
        alerta.remove();
    }, 3000);
}
