/*Funcion para iniciar sesion*/
let admins=[];
let users=[];

fetch("data.json")
.then(response => response.json())
.then(data => {
    admins = data.admins;
    users = data.users;
    console.log("Datos cargados:", admins, users);
})
.catch(error => console.error('Error al cargar el archivo JSON:', error));

