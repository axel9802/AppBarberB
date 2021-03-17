let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp();
});

function iniciarApp(){
    mostrarServicios();

    //Resalta el div actual segun el tab al que se presiona
    mostrarSeccion();
    //Oculta o muestra una seccion segun el tab al que se presiona
    cambiarSeccion();

    //Paginacion siguiente y anterior
    paginaSiguiente();
    paginaAnterior();

    //Comprueba la pagina actual para ocultar o mostrar la paginacion
    botonesPaginador();

    //Muestra el resumen de la cita o mensaje de error en caso de no pasar la validacion
    mostrarResumen();

    //Almacena el nombre de la cita en el objeto
    nombreCita();

    //Almacena la fecha de la cita en el objeto
    fechaCita();

    //Deshabilita dias pasados
    deshabilitarFechaAnterior();

    //Almacena la hora de la cita en el objeto
    horaCita();

}

function mostrarSeccion(){

    //Eliminar mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar-seccion');
    }

    //Agregar clase mostrar-seccion a la seccion actual donde me encuentro
    const seccionActual = document.querySelector(`#paso-${pagina}`)
    seccionActual.classList.add('mostrar-seccion');

    //Eliminar la clase actual en el tab anterior
    const tabAnterior = document.querySelector('.actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }
    
    //Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion(){
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach((enlace)=> {
        enlace.addEventListener('click', (e) => {

            //Cogiendo valor del id al que le doy click para ponerlo como valor de pagina
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);

            //Llamar funcion de mostrar seccion para que cambie con los tabs
            mostrarSeccion();
            //Para que aparezcan los botones 'Anterior y Siguiente' tambien cuando cambie por los tabs
            botonesPaginador();
        });
    })
}



async function mostrarServicios(){
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();
        
        /* Aplicando Destructuring:
        const {servicios} = db   --->   las llaves hacen que jale ese valor despues de db*/
        const servicios = db.servicios;

        //Generar HTML
        servicios.forEach( servicio => {
            /* Aplicando Destructuring:
            Esto es igual a : servicios.id, servicios.nombre, servicios.precio*/
            const{ id, nombre, precio } = servicio;


            //DOM Scripting
            //Generar nombre de servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');


            //Generar el precio de servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //Generar div contenedor de Servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            //Para coger el id
            servicioDiv.dataset.idServicio = id;

            //Selecciona un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;

            //Inyectar nombre y precio al div de servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //Inyectarlo en el HTML
            document.querySelector('#servicios').appendChild(servicioDiv);

            
        })
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e){

    let elemento;
    //Forzar que el elemento al cual le damos click sea el div
    if(e.target.tagName === 'P'){
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }

    if(elemento.classList.contains('seleccionado')){
        elemento.classList.remove('seleccionado');

        //Para resumen
        const id = parseInt(elemento.dataset.idServicio);
        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        //Para resumen
        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent
        }

        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id){
    const {servicios} = cita;
    cita.servicios = servicios.filter(servicio => servicio.id != id);

    console.log(cita);
}

function agregarServicio(servicioObj){
    const {servicios} = cita;
    //...servicios copia lo que ya esta en el objeto y le agrega servicioObj a ese arreglo
    cita.servicios = [...servicios, servicioObj];
    console.log(cita);
}

function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;

        botonesPaginador();
    });
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;

        botonesPaginador();
    });
}

function botonesPaginador(){
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');
    if (pagina === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if (pagina === 3){
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        //Esto se pone porque esta en DOMContentLoaded(pagina cuando ya esta cargada) y debe volver a leer(actualizar) la funcion mostrar para que se muestren los cambios
        mostrarResumen(); //Estamos en la pagina 3, carga el resumen de la cita cuando y hayan valores seleccionados 
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion(); //Cambia la seccion que se muestra por la de la pagina en donde estoy
}

function mostrarResumen(){
    // Destructuring
    const {nombre, fecha, hora, servicios} = cita;

    //Seleccionar Resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //Limpiar HTML previo
       /* //Forma mas facil
        resumenDiv.innerHTML = '';*/
    //Forma eficiente - Mientras .contenido-resumen tenga HTMl o contenido dentro se ejecuta el while
    while (resumenDiv.firstChild) {
            resumenDiv.removeChild(resumenDiv.firstChild);
    }

    //Validacion de objetos
    if(Object.values(cita).includes('')){
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicios, hora, fecha o nombre';

        noServicios.classList.add('invalidar-cita');

        //Agregar a resumenDiv
        resumenDiv.appendChild(noServicios);

        //Despues de ejecutar el if ya no se ejecute el siguiente codigo
        return;
    } 

    const headingDatos = document.createElement('H3');
    headingDatos.textContent = 'Datos Usuario';

    //Mostrar el resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;
    

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Detalles Servicios';
    serviciosCita.appendChild(headingServicios);

    let cantidadTotal = 0;

    //Iterar sobre el arreglo de servicios
    servicios.forEach(servicio => {

        const {nombre, precio} = servicio;

        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const nombreServicio = document.createElement('P');
        nombreServicio.textContent = nombre;
    
        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');
        cantidadTotal += parseInt(totalServicio[1].trim());

        //Colocar texto y precio en el div
        contenedorServicio.appendChild(nombreServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    });

    resumenDiv.appendChild(headingDatos);

    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a Pagar: </span> $ ${cantidadTotal}`;
    resumenDiv.appendChild(cantidadPagar);

}

function nombreCita(){
    const nombreInput = document.querySelector('#nombre');
    nombreInput.addEventListener('input', (e) => {
        const nombreTexto = e.target.value.trim();
        
        //Validacion de que nombreTexto debe tener algo escrito
        if(nombreTexto === '' || nombreTexto.length < 3){
            mostrarAlerta('Nombre no valido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if (alerta) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
    });
}

function mostrarAlerta(mensaje, tipo){

    //Si hay una alerta previa, entonces no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if (alertaPrevia) {
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error'){
        alerta.classList.add('error');
    }

    //Insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild(alerta);

    //Eliminar la alerta despues de 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function fechaCita(){
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', (e) => {
        //UTCDay me devuelve el numero de dia siendo 0 domingo y 6 sabado
        const dia = new Date(e.target.value).getUTCDay();
        //No se puede reservar ni domingo ni sabado
        if ([0,6].includes(dia)) {
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de semana no son permitidos', 'error');
        } else {
            cita.fecha = fechaInput.value;
            console.log(cita);
        }   
    });
}

function deshabilitarFechaAnterior(){
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;
    const dia = fechaAhora.getDate();

    //Deshabilitar fechas antiguas
    //Formato deseado: YYYY-MM-DD - Se convierte los dias y meses en dos digitos para que se puedan deshabilitar todos los meses pasados al actual
    const fechaDeshabilitar = `${year}-${mes < 10 ?  `0${mes}`: mes }-${dia <10 ? `0${dia}`:dia}`;

    inputFecha.min = fechaDeshabilitar;
}

function horaCita(){
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {
        const horaCita = e.target.value;
        const hora = horaCita.split(':'); //Te divide la hora en un arreglo de 2 objetos. El primero la hora, el segundo los minutos

        if (hora[0] < 10 || hora[0] > 18) {
            mostrarAlerta('Hora no valida', 'error');
            setTimeout(() => {
                inputHora.value = '';
            }, 3000);
        } else {
            cita.hora = horaCita;
        }
    });
}