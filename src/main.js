var fichero = document.getElementById('matriz')
var matriz_fichero = []
var vecinos_seleccionados = []
var predicciones_global = []

fichero.addEventListener('change', function(e) {
let reader = new FileReader();
reader.onload = function () {
    let lines = reader.result.toString()
    let filas = lines.split("\r\n")

    filas.forEach((fila) => {
    let calificaciones = fila.split(" ")
    matriz_fichero.push(calificaciones);
    })
    
    console.log(matriz_to_formato(matriz_fichero))
    document.getElementById("matriz_entrada").innerHTML = matriz_to_formato(matriz_fichero)
    document.getElementById("titulo1").innerHTML = `<br>`+ "Matriz de entrada:"
}
reader.readAsText(fichero.files[0]);

    
}, false)

var matriz_ex = [
    ["5","3","4","4","-"],
    ["3","1","2","3","3"],
    ["4","3","4","3","5"],
    ["3","3","1","5","4"],
    ["1","5","5","2","1"],
]

function generar() {
    var datos = get_datos();
    var metrica = datos.metrica;
    var n_vecinos = datos.n_vecinos;
    var tipo_pred = datos.tipo_pred;
    var fichero = matriz_fichero;

    var medias = todas_medias(fichero)
    var similaridades = todas_similitudes(fichero,medias,metrica)
    console.log(`Similaridades:\n\n`,similaridades)

    var matriz_cambiada = recomendador(fichero,metrica,n_vecinos,tipo_pred)
    console.log(`Matriz resultante:\n\n`,matriz_cambiada)
    var matriz_salida = matriz_to_formato(matriz_cambiada)

    var datos_salida = {
        matriz: matriz_salida,
        similaridades: similaridades,
        vecinos: vecinos_seleccionados,

    }
    var imp = imprimir(datos_salida)
    
}
  
// --------------------------------------------------------- \\



// --------------------------------------------------------- \\
// Datos
// --------------------------------------------------------- \\

function get_datos (){  

    var metrica = document.getElementById("select").value;
    var n_vecinos = parseInt(document.getElementById("nVecinos").value);
    var tipo_pred = document.getElementById("tipo_pred").value;
          
    var datos = {
        metrica: metrica,
        n_vecinos: n_vecinos,
        tipo_pred: tipo_pred
    };

    return datos;
}

// --------------------------------------------------------- \\
// Imprimir
// --------------------------------------------------------- \\

function imprimir(datos) {
    //clean buffer
    document.getElementById("matriz_salida").innerHTML = ""
    document.getElementById("similaridades_salida").innerHTML = ""
    document.getElementById("vecinos_salida").innerHTML = ""

    var matriz_html = datos.matriz
    document.getElementById("matriz_salida").innerHTML = matriz_html

    var similaridades_html= ""
    var similaridades = []

    for (var i = 0; i < datos.similaridades.length;i++){
        similaridades.push(datos.similaridades[i])
    }

    
    for (var i = 0; i < similaridades.length;i++){
        for (var j = 0; j < similaridades[i].length;j++){
            aux = `Usuarios ` + i + ` y ` + similaridades[i][j].usuario + ` : ` + Math.round(similaridades[i][j].sim * 100) / 100 + `<br>`
            similaridades_html += aux
        }
    }

    document.getElementById("similaridades_salida").innerHTML = similaridades_html


    var vecinos_html= ""
    aux = ""

    for (var i = 0; i < vecinos_seleccionados.length;i++){
        aux += `Prediccion` + i + ` (`+ predicciones_global[i] + `) `+ `:<br>`
        aux += `Vecinos:`
        for (var j = 0; j < vecinos_seleccionados[i].length;j++){
            aux += vecinos_seleccionados[i][j].usuario + `,`
        }
        aux += `<br><br>`
    }
    vecinos_html += aux

    document.getElementById("vecinos_salida").innerHTML = vecinos_html


    // Show / Hide
    var mostrar = document.getElementById("salida");
    if (mostrar.style.display === "none") {
      mostrar.style.display = "block";
    } else {
      mostrar.style.display = "none";
    }
}

function matriz_to_formato(matriz) {
    var txt = ""
    for (var i = 0; i < matriz.length; i++) {
        if (i > 0){
            txt += `<br>`
        }
        for (var j = 0; j < matriz[i].length; j++) {
            if (j > 0){
                txt += `   `
            }
            if (matriz[i][j]!="-") {
                var numero = parseInt(matriz[i][j]);
                txt += numero
            } else {
                txt += "-"
            }
        }
    }
    return txt
}
// --------------------------------------------------------- \\
// Recomendador
// --------------------------------------------------------- \\

function recomendador(matriz, metrica, n_vecinos, tipo_predic) {
    var result = [];
    var valores = [];
    var medias = todas_medias(matriz)

    for (var i = 0; i < matriz.length; i++) {
      for (var j = 0; j < matriz[i].length; j++) {
        if (matriz[i][j] == "-") {
            var aux = {
                pos_i: i,
                pos_j: j,
                valor: 0
            }
            switch (metrica) {
                case "pearson":
                    var pred = prediccion(matriz,medias,"pearson",n_vecinos,tipo_predic,i,j)
                    aux.valor = pred.toString()
                break;
                case "coseno":
                    var pred = prediccion(matriz,medias,"coseno",n_vecinos,tipo_predic,i,j)
                    aux.valor = pred.toString()
                break;
                case "euclidea":
                    var pred = prediccion(matriz,medias,"euclidea",n_vecinos,tipo_predic,i,j)
                    aux.valor = pred.toString()
                break;
                case "default":
                    console.error("ERROR: Métrica incorrecta")
                break;
            }

            valores.push(aux)
        } 
      }
    }

    result = completar_matriz(matriz,valores)
    return result
}

function completar_matriz(matriz,recomendaciones){
    var result = matriz
    
    for (var i = 0; i < recomendaciones.length; i++) {
        var pos_i = recomendaciones[i].pos_i
        var pos_j = recomendaciones[i].pos_j

        result[pos_i][pos_j] = recomendaciones[i].valor 
    }

    return result
}

// --------------------------------------------------------- \\
// Media
// --------------------------------------------------------- \\

function posiciones(matriz,usuario) {
    var result = []
    for (var i = 0; i < matriz[usuario].length; i++) {
        if (matriz[usuario][i]!= "-") {
        result.push(i)
        }
    }
    return result
}

function media(matriz,usuario,posiciones){
    var result = 0
    var suma = 0
   for (var i = 0; i < posiciones.length; i++) {
        suma += parseInt(matriz[usuario][posiciones[i]])
    }
    result = suma/posiciones.length

    return result
}

function todas_medias(matriz) {
    var result = [];
    for (var i = 0; i < matriz.length; i++) {
        var pos = posiciones(matriz,i)
        var med = media(matriz,i,pos)
        result.push(med)
    }
    return result
}

// --------------------------------------------------------- \\
// Funciones de similitud
// --------------------------------------------------------- \\

function pearson(matriz,medias_inciales,u,v) {
    var result = 0

    var posiciones = []

   for (var i = 0; i < matriz[u].length; i++) {
        if (matriz[u][i]!= "-" && matriz[v][i]!= "-") {
        posiciones.push(i)
        }
    }

    var medias = medias_inciales

    var media_u = medias[u]
    var media_v = medias[v]

    var numerador = 0
    var denominador = 0

    var parte_u = 0
    var parte_v = 0

   for (var i = 0; i < posiciones.length; i++) {
        numerador += ((parseInt(matriz[u][posiciones[i]]) - media_u) * (parseInt(matriz[v][posiciones[i]]) - media_v))
        parte_u += Math.pow(parseInt(matriz[u][posiciones[i]]) - media_u, 2)
        parte_v += Math.pow(parseInt(matriz[v][posiciones[i]]) - media_v, 2)
    }

    parte_u = Math.sqrt(parte_u)
    parte_v = Math.sqrt(parte_v)
    denominador = parte_u * parte_v

    result = numerador / denominador

    return result
}

function distancia_coseno(matriz,u,v){
    var result = 0

    var posiciones = []

   for (var i = 0; i < matriz[u].length; i++) {
        if (matriz[u][i]!= "-" && matriz[v][i]!= "-") {
        posiciones.push(i)
        }
    }

    var numerador = 0
    var denominador = 0

    var parte_u = 0
    var parte_v = 0

   for (var i = 0; i < posiciones.length; i++) {
        numerador += ((parseInt(matriz[u][posiciones[i]])) * (parseInt(matriz[v][posiciones[i]])))
        parte_u += Math.pow(parseInt(matriz[u][posiciones[i]]), 2)
        parte_v += Math.pow(parseInt(matriz[v][posiciones[i]]), 2)
    }

    parte_u = Math.sqrt(parte_u)
    parte_v = Math.sqrt(parte_v)
    denominador = parte_u * parte_v

    result = numerador / denominador

    return result
}

function distancia_euclidea(matriz,u,v){
    var result = 0

    var posiciones = []

   for (var i = 0; i < matriz[u].length; i++) {
        if (matriz[u][i]!= "-" && matriz[v][i]!= "-") {
        posiciones.push(i)
        }
    }

    var parte_u = 0
    var parte_v = 0

   for (var i = 0; i < posiciones.length; i++) {
        parte_u = parseInt(matriz[u][posiciones[i]])
        parte_v = parseInt(matriz[v][posiciones[i]])
        result += Math.pow((parte_u - parte_v),2)
    }

    result = Math.sqrt(result)

    return result
}
// --------------------------------------------------------- \\
// Todas las similitudes
// --------------------------------------------------------- \\

function similitudes(matriz,medias,persona,metrica) {
    var result = [];
    
    for (var i = 0; i < matriz.length; i++) {
        if (i != persona){
            var aux = {
                usuario: i,
                sim: 0
            }
            switch (metrica) {
                case "pearson":
                    aux.sim = pearson(matriz,medias,persona,i)
                break;
                case "coseno":
                    aux.sim = distancia_coseno(matriz,persona,i)
                break;
                case "euclidea":
                    aux.sim = distancia_euclidea(matriz,persona,i)
                break;
                case "default":
                    console.error("ERROR: Métrica incorrecta")
                break;
            }
            result.push(aux);
        }
    }
    return result;
}

function todas_similitudes(matriz,medias,metrica){
    var result = [];

    for (var i = 0; i < matriz.length; i++) {
        var aux = similitudes(matriz,medias,i,metrica);
        result.push(aux);
    }
    
    return result;
}

// --------------------------------------------------------- \\
// Funciones auxiliares
// --------------------------------------------------------- \\

function n_mas_cercanos(array, n, metrica) {
    var result = [];
    if (metrica == "euclidea"){
        array.sort(function (a, b) {
            if (a.sim > b.sim) {
              return 1;
            }
            if (a.sim < b.sim) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
    } else {
        array.sort(function (a, b) {
            if (a.sim < b.sim) {
              return 1;
            }
            if (a.sim > b.sim) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
    }    
      
    result = array.slice(0,n)
    return result;
}

// --------------------------------------------------------- \\
// Predicciones
// --------------------------------------------------------- \\

function prediccion(matriz,medias_inciales,metrica,n_vecinos,tipo,u,col_guion) {
    var result = 0
    var k_vecinos = []
    var medias = medias_inciales

    console.log("hola",medias)
    var aux = todas_similitudes(matriz,medias,metrica)
    aux = aux[u]

    for (var i = 0; i < aux.length; i++) {
        k_vecinos.push(aux[i])
    }
    k_vecinos = n_mas_cercanos(aux,n_vecinos,metrica)

    var numerador = 0
    var denominador = 0

    for (var k = 0; k < k_vecinos.length; k++) {
        var v = k_vecinos[k]

        var usuario = v.usuario
        var sim = v.sim
        var calificacion = 0
        var media_u = medias[u]
        var media_v = medias[usuario]

        if (matriz[usuario][col_guion]!="-"){
            calificacion = matriz[usuario][col_guion]
        }
        
        if (tipo == "simple"){
            var producto = sim * calificacion

            numerador += producto
            denominador += Math.abs(sim)

            result = numerador/denominador

        } else if (tipo == "difMedia"){
            var producto = sim * (calificacion-media_v)

            numerador += producto
            denominador += Math.abs(sim)

            result = media_u + (numerador/denominador)

        }
        
    }
    
    predicciones_global.push(result)
    result = Math.round(result)

    vecinos_seleccionados.push(k_vecinos)

    return result
}