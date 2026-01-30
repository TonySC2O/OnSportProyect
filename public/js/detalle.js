const layout_main ={
1:{
    imagen: "Images/basketball.png",
    insumos: "Balones de baloncesto, Redes de baloncesto, Zapatos Tennis, Conos de entrenamiento",
    titulo: "Polideportivo",
    descripcion: "Marte es el cuarto planeta del sistema solar. Tiene una atmósfera delgada y es conocido como el planeta rojo...",
    horario: "Lunes a Viernes: 6:00 AM - 10:00 PM",
    precio: "₡5,000 por hora",
    estado: "Disponible"
},
2:{
    imagen: "Images/basketball2.png",
    insumos: "Sin insumos disponibles",
    titulo: "Polideportivo",
    descripcion: "Jupiter es el quinto planeta del sistema solar. Tiene una atmósfera delgada y es conocido como el planeta más grande...",
    horario: "Lunes a Viernes: 8:00 AM - 8:00 PM",
    precio: "₡2,000 por hora",
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