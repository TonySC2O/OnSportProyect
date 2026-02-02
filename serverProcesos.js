//Lugar en donde se contienen las rutas para cada proceso de la app
const e = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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
    const fechaReserva = req.body.fechaReserva;
    const horaInicio = req.body.horaInicio;
    const horaFin = req.body.horaFin;
    const motivo = req.body.motivo;

    const ruta = path.join(__dirname, './data/data.json');
    const data = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

    const reserva = data.reservas.find(r => r.comprobante === comprobante);
    if (!reserva) {
        return res.status(404).json({ message: "Reserva no encontrada"});
    }
    //editar
    if(tipoUso === "modificar"){

        const inicio = parseInt(horaInicio.split(':')[0], 10);
        const fin = parseInt(horaFin.split(':')[0], 10);

        if(inicio >= fin){
            return res.status(400).json({message: "Hora de inicio no puede ser mayor o igual que hora de fin"})
        }

        const reservasEspacioFecha = data.reservas.filter( //Obtener reservas del espacio en la fecha dada
            r => r.polideportivo === polideportivo &&
                r.fechaReserva === fechaReserva &&
                r.comprobante !== comprobante //Evitar reserva a cambiar
        );

        const choqueHorario = reservasEspacioFecha.some( //Si hay una reserva con choque de horario, return True
            r => { //Funcion para transformar de string a int las horas, debido a errores en validaciones de
                

                const inicioReserva = parseInt(r.horaInicio.split(':')[0], 10);
                const finReserva = parseInt(r.horaFin.split(':')[0], 10);

                return inicio < finReserva && fin > inicioReserva
        });

        if(choqueHorario){ 
            return res.status(409).json({message:"Horario no disponible"})
        }

        reserva.polideportivo = polideportivo;
        reserva.fechaReserva = fechaReserva;
        reserva.horaInicio = horaInicio;
        reserva.horaFin = horaFin;
        reserva.motivo = motivo;
    }
    //eliminar
    else if(tipoUso === "eliminar"){
        data.reservas.splice(reserva, 1);
    }

    //Guardar cambios
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
    res.status(200).json({ message: "Reserva modificada correctamente" });
});

//Ruta para enviar solicitud de cambio de usuario o polideportivo
router.post('/gestionAdmin', (req, res) => {
    const persona = req.body.persona;
    const opcion = req.body.opcion;
    const descripcion = req.body.descripcion;
    const fecha = req.body.fecha;

    const ruta = path.join(__dirname, './data/data.json');
    const data = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

    if(!persona || !opcion || !descripcion){
        return res.status(400).json({
            message:'Datos Incompletos.'
        });
    }

    data.solicitudesAdmin.push({
        persona,
        opcion,
        descripcion,
        fecha
    });

    fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
    return res.status(200).json({message: 'Solicitud guardada correctamente.'});

})

// Ruta para crear una nueva reserva (pago/confirmación)
router.post('/crearReserva', (req, res) => {
        const { persona, motivo, polideportivo, espacio, fechaReserva, horaInicio, horaFin, metodoPago, costo } = req.body;
        const ruta = path.join(__dirname, './data/data.json');
        const data = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

        // Validaciones básicas
        if (!persona || !polideportivo || !espacio || !fechaReserva || !horaInicio || !horaFin) {
            return res.status(400).json({ message: 'Faltan datos requeridos para crear la reserva' });
        }

        // Comprobar conflicto de horario
        const reservasEspacioFecha = data.reservas.filter(
            r => r.polideportivo === polideportivo && r.espacio === espacio && r.fechaReserva === fechaReserva
        );

        const inicio = parseInt(horaInicio.split(':')[0], 10);
        const fin = parseInt(horaFin.split(':')[0], 10);

        const choque = reservasEspacioFecha.some(r => {
            const inicioR = parseInt(r.horaInicio.split(':')[0], 10);
            const finR = parseInt(r.horaFin.split(':')[0], 10);
            return inicio < finR && fin > inicioR;
        });

        if (choque) {
            return res.status(409).json({ message: 'Horario no disponible para la reserva' });
        }

        // Generar comprobante / código de reserva
        const comprobante = 'RE' + Date.now();

        // Calcular costo si no viene (ejemplo: 2000 por hora)
        let costoFinal = costo;
        if (!costoFinal) {
            const horas = Math.max(1, fin - inicio);
            costoFinal = String(2000 * horas);
        }

        const nuevaReserva = {
            persona,
            motivo: motivo || 'Sin especificar',
            costo: String(costoFinal),
            metodoPago: metodoPago || 'Pendiente',
            polideportivo,
            espacio,
            fechaReserva,
            horaInicio,
            horaFin,
            comprobante
        };

        data.reservas.push(nuevaReserva);
        fs.writeFileSync(ruta, JSON.stringify(data, null, 2));

        // Buscar datos de la persona para la factura
        const infoUser = data.users.find(u => u.username === persona) || data.admins.find(a => a.username === persona) || { nombre: persona };

        const factura = {
            codigoReserva: comprobante,
            persona: infoUser.nombre || persona,
            polideportivo: polideportivo,
            espacio: espacio,
            motivo: nuevaReserva.motivo,
            fechaReserva: fechaReserva,
            horaInicio: horaInicio,
            horaFin: horaFin,
            pagoReserva: nuevaReserva.costo,
            pagoTotal: nuevaReserva.costo,
            metodoPago: nuevaReserva.metodoPago,
            estadoReserva: 'Sin Pagar'
        };

        res.status(201).json({ message: 'Reserva creada', reserva: nuevaReserva, factura });
    });

module.exports = router;