//Lugar en donde se contienen las rutas para cada proceso de la app
const e = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

module.exports = router;

//Ruta para registrar usuarios
const datapath=path.join(__dirname,'./data/data.json');
router.post('/register', (req, res) => {
    const {nombre,username,email,telefono,password}=req.body;
    const data= JSON.parse(fs.readFileSync(datapath,'utf8'));
    const esiste=data.users.find(u=>u.username===username);
    if(esiste){
        return res.status(400).json({message:'El nombre de usuario ya existe'});
    }
    data.users.push({nombre,username,email,telefono,password});
    fs.writeFileSync(datapath,JSON.stringify(data,null,2));
    res.status(201).json({message:'Usuario registrado exitosamente'});
});

//Ruta para iniciar sesion
router.post('/login',(req,res) =>{
    const {username,password}=req.body;
    const data= JSON.parse(fs.readFileSync(datapath,'utf8'));

    const admin=data.admins.find(//Ciclo para buscar admins en el json
        a=>a.username===username && a.password===password);
    if(admin){
        console.log(admin);
        return res.status(200).json({
            message:'Inicio de sesión exitoso',
            role:'admin'
        });
    }

    const user=data.users.find(//Ciclo para buscar users en el json
        u=>u.username===username && u.password===password
    );

    if(user){
        console.log(user);
        return res.status(200).json({
            message:'Inicio de sesión exitoso',
            role:'user'
        });
    }
    res.status(401).json({message:'El usuario ingredado no existe o la contraseña es incorrecta'});
});

//Ruta para el admin vea todas las reservas
router.get('/reservas',(req,res)=>{
    const data=JSON.parse(fs.readFileSync(datapath,'utf8'));
    res.status(200).json({reservas:data.reservas});
});

//Ruta busca reserva del user que logged in
router.get('/reservas/:username',(req,res)=>{
    const {username}=req.params;
    const data= JSON.parse(fs.readFileSync(datapath,'utf8'));
    
    const reservasUser=data.reservas.filter(
        r=>r.persona===username//Reviar si es gaurdado por nombre o username
    );
    res.status(200).json({reservas:reservasUser});
});

//Ruta para obtener las reservas existentes de una fecha
router.get('/modificarReserva/reservas', (req, res) => {
    const fecha = req.query.fecha // Obtiene la fceha

    const ruta = path.join(__dirname, './data/data.json'); 
    const data = JSON.parse(fs.readFileSync(ruta, 'utf8')); //Lee el Json

    //Cambiar metodo de busqueda al la seccion de datos del json correcta
    const reservasFecha = data.reservas.filter(r =>   //Filtra reservas por la fecha seleccionada
        r.fechaReserva === fecha)
        .map(reserva => {       //Modifica los elementos de reserva manteniendo los anteriores
            const infoUser = 
                data.users.find(u => u.username === reserva.persona) ||
                data.admins.find(a => a.username === reserva.persona);

            return {
                username: reserva.persona,
                nombre: infoUser.nombre,
                email: infoUser.email,
                telefono: infoUser.telefono,
                motivo: reserva.motivo,
                costo: reserva.costo,
                metodoPago: reserva.metodoPago,
                polideportivo: reserva.polideportivo,
                espacio: reserva.espacio,
                fechaReserva: reserva.fechaReserva,
                horaInicio: reserva.horaInicio,
                horaFin: reserva.horaFin,
                comprobante: reserva.comprobante
            };
        });

    res.json(reservasFecha || []); 
});
//ruta para modificar los datos de una reserva
router.post("/modificarReserva/modificar", (req, res) => {
    const tipoUso = req.body.tipoUso;
    const comprobante = req.body.comprobante;
    const polideportivo = req.body.polideportivo;
    const espacio = req.body.espacio;
    const fechaReserva = req.body.fechaReserva;
    const horaInicio = req.body.horaInicio;
    const horaFin = req.body.horaFin;

    const ruta = path.join(__dirname, './data/data.json');
    const data = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

    const reserva = data.reservas.find(r => r.comprobante === comprobante);
    if (!reserva) {
        return res.status(404).send("Reserva no encontrada");
    }
    //editar
    if(tipoUso === "modificar"){
        reserva.polideportivo = polideportivo;
        reserva.espacio = espacio;
        reserva.fechaReserva = fechaReserva;
        reserva.horaInicio = horaInicio;
        reserva.horaFin = horaFin;
    }
    //eliminar
    else if(tipoUso === "eliminar"){
        data.reservas.splice(reserva, 1);
    }

    //Guardar cambios
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
    res.redirect("/modificarReserva.html") //cambiar

})