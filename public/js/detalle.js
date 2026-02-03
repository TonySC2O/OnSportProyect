const layout_main ={
1:{
    imagen: "Images/Alajuela.jpg",
    insumos: "Sin insumos disponibles",
    titulo: "CODEA - Cancha de Fútbol",
    descripcion: "La cancha principal de fútbol del CODEA cuenta con las medidas internacionales FIFA para la práctica del fútbol, cuenta además con camerinos, 250 lux de iluminación, pista y campo de atletismo.",
    horario: "Lunes a Viernes: 06:00 - 20:00",
    precio: "₡7000 por hora",
    estado: "Disponible"
},
2:{
    imagen: "Images/SanJose.jpg",
    insumos: "Balones de fútbol, Balones de baquetbol, Balones de volleyball, Conos, Zapatos Tennis, Redes para aros, Red de volleyball, Guantes",
    titulo: "BN Arena",
    descripcion: "Este complejo deportivo multiusos que a albergado varios juegos centroamericanos y del caribe, cuenta con el espacio requerido para el fútbol, basquetbol, volleyball y atletismo.",
    horario: "Lunes a Viernes: 08:00 - 20:00",
    precio: "₡20,000 por hora",
    estado: "No disponible"
},
3:{
    imagen: "Images/Cartago.jpg",
    insumos: "Balones de fútbol, Balones de baquetbol, Balones de volleyball, Redes para aros, Red de volleyball",
    titulo: "Polideportivo de Catago",
    descripcion: "El polideportivo de Cartago cuenta con canchas para la práctica de baquetbol, volleyball, además de iluminación.",
    horario: "Domingo a Viernes: 06:00 - 22:00  Sábado: 06:00 - 16:00",
    precio: "₡16,000 por hora",
    estado: "Disponible"
},
4:{
    imagen: "Images/Pavas.jpg",
    insumos: "Sin insumos disponibles",
    titulo: "Estadio Ernesto Rohrmoser",
    descripcion: "Complejo deportivo utilizado en el fútbol de primera división, sede del equipo Sporting F.C., cuenta con camerinos, iluminación y medidas reglamentarias para la práctica del fútbol.",
    horario: "Lunes y Martes: 06:00 - 22:00  Domingo: 06:00 - 22:00",
    precio: "₡25,000 por hora",
    estado: "Disponible"
},
5:{
    imagen: "Images/Codea.jpg",
    insumos: "Balones de baquetbol, Balones de volleyball, Redes para aros, Red de volleyball",
    titulo: "CODEA - Multiuso",
    descripcion: "La cancha multiusos del CODEA permite la práctica de baquetbol y volleyball, cuenta con iluminación y camerinos.",
    horario: "Lunes a Viernes: 06:00 - 20:00",
    precio: "₡14,000 por hora",
    estado: "Disponible"
},
6:{
    imagen: "Images/Heredia.jpg",
    insumos: "Balones de fútbol, Balones de baquetbol, Balones de volleyball, Conos, Zapatos Tennis, Redes para aros, Red de volleyball, Guantes, marcador electrónico, mesa de puntuación",
    titulo: "Palacio de los deportes",
    descripcion: "El Palacio de los Deportes es un pabellón deportivo con capacidad para 7500 personas, la arena es escenario habitual de eventos locales, tales como partidos deportivos, conciertos y ferias comerciales. El equipo de baloncesto Ferretería Brenes Barva tiene su sede aquí. En 2004, el estadio fue sede del Campeonato de Futsal de la CONCACAF.",
    horario: "Lunes a Viernes: 05:00 - 21:00    Sábado a Domingo: 07:00 - 16:00",
    precio: "₡40,000 por hora",
    estado: "Disponible"
},
7:{
    imagen: "Images/Meza.jpg",
    insumos: "Sin insumos disponibles",
    titulo: "Estadio José Rafael 'Fello' Meza Ivancovich",
    descripcion: "Complejo deportivo utilizado en el fútbol de primera división, sede del equipo C.S.Cartagines, cuenta con camerinos, iluminación y cuenta con las medidas internacionales FIFA para la práctica del fútbol.",
    horario: "Lunes y Martes: 06:00 - 22:00  Domingo: 06:00 - 22:00",
    precio: "₡32,000 por hora",
    estado: "No disponible"
}

};


const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.getElementById("titulo").textContent = layout_main[id].titulo;
document.getElementById("descripcion").textContent = layout_main[id].descripcion;
document.getElementById("insumos").textContent = layout_main[id].insumos;
document.getElementById("imagen").src = layout_main[id].imagen;
document.getElementById("horario").textContent = layout_main[id].horario;
document.getElementById("precio").textContent = layout_main[id].precio;
document.getElementById("estado").textContent = layout_main[id].estado;