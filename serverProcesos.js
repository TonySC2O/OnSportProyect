//Lugar en donde se contienen las rutas para cada proceso de la app
const e = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// ===== FUNCIONES DE CONVERSIÓN HORA <-> SEGUNDOS =====
// Convierte HH:MM a segundos (ej: "06:30" -> 23400)
const horaASegundos = (horaStr) => {
    const [hh, mm] = horaStr.split(':').map(x => parseInt(x, 10));
    return hh * 3600 + (mm || 0) * 60;
};

// Convierte segundos a HH:MM (ej: 23400 -> "06:30")
const segundosAHora = (segundos) => {
    const hh = Math.floor(segundos / 3600);
    const mm = Math.floor((segundos % 3600) / 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

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

//Ruta para obtener todos los polideportivos
router.get('/polideportivos',(req,res)=>{
    const data=JSON.parse(fs.readFileSync(datapath,'utf8'));
    res.status(200).json({polideportivos:data.polideportivos});
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

    // Editar reserva
    if(tipoUso === "modificar"){
        // Convertir horas a números enteros (segundos)
        const inicioSeg = parseInt(horaInicio);
        const finSeg = parseInt(horaFin);

        if (isNaN(inicioSeg) || isNaN(finSeg)) {
            return res.status(400).json({ message: 'Horas deben ser números válidos (en segundos)' });
        }

        // Validación 1: Inicio < Fin
        if(inicioSeg >= finSeg){
            return res.status(400).json({message: "Hora de inicio debe ser menor que hora de fin"})
        }

        // Validación 2: Polideportivo existe
        const polidep = data.polideportivos.find(p => p.titulo === polideportivo);
        if (!polidep) {
            return res.status(400).json({ message: 'Polideportivo no encontrado' });
        }

        // Validación 3: Día disponible
        const d = new Date(fechaReserva + 'T00:00:00');
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const diaSemana = diasSemana[d.getDay()];
        const horarioDia = polidep.horario[diaSemana];

        if (horarioDia === null) {
            return res.status(400).json({ message: 'El polideportivo no está disponible ese día' });
        }

        // Validación 4: Horas dentro del horario
        if (inicioSeg < horarioDia.inicio || finSeg > horarioDia.fin) {
            const horaApe = segundosAHora(horarioDia.inicio);
            const horaCie = segundosAHora(horarioDia.fin);
            return res.status(400).json({ message: `Las horas deben estar entre ${horaApe} y ${horaCie}` });
        }

        // Validación 5: Sin conflictos con otras reservas
        const tieneConflicto = data.reservas.some(r => {
            if (r.comprobante === comprobante) return false; // No comparar consigo misma
            if (r.polideportivo !== polideportivo || r.fechaReserva !== fechaReserva) return false;
            
            const inicioExistente = parseInt(r.horaInicio);
            const finExistente = parseInt(r.horaFin);
            
            // Solapamiento
            return inicioSeg < finExistente && finSeg > inicioExistente;
        });

        if(tieneConflicto){ 
            return res.status(409).json({message: "Horario no disponible - hay otra reserva en ese horario"})
        }

        // Actualizar reserva
        reserva.polideportivo = polideportivo;
        reserva.fechaReserva = fechaReserva;
        reserva.horaInicio = inicioSeg;
        reserva.horaFin = finSeg;
        reserva.motivo = motivo;
    }
    // Eliminar
    else if(tipoUso === "eliminar"){
        data.reservas.splice(data.reservas.indexOf(reserva), 1);
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
        const { persona, motivo, polideportivo, fechaReserva, horaInicio, horaFin, metodoPago, costo } = req.body;
        const ruta = path.join(__dirname, './data/data.json');
        const data = JSON.parse(fs.readFileSync(ruta, 'utf-8'));

        // Validaciones básicas
        if (!persona || !polideportivo || !fechaReserva || horaInicio === undefined || horaFin === undefined) {
            return res.status(400).json({ message: 'Faltan datos requeridos para crear la reserva' });
        }

        // Convertir horas (en segundos) a números enteros
        const inicioSeg = parseInt(horaInicio);
        const finSeg = parseInt(horaFin);

        if (isNaN(inicioSeg) || isNaN(finSeg)) {
            return res.status(400).json({ message: 'Horas deben ser números válidos (en segundos)' });
        }

        // Validación 1: Inicio < Fin
        if (inicioSeg >= finSeg) {
            return res.status(400).json({ message: 'Hora de inicio debe ser menor que hora de fin' });
        }

        // Validación 2: Polideportivo existe
        const polidep = data.polideportivos.find(p => p.titulo === polideportivo);
        if (!polidep) {
            return res.status(400).json({ message: 'Polideportivo no existe' });
        }

        // Validación 3: Día disponible
        const d = new Date(fechaReserva + 'T00:00:00');
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const diaSemana = diasSemana[d.getDay()];
        const horarioDia = polidep.horario[diaSemana];
        
        if (horarioDia === null) {
            return res.status(400).json({ message: 'El polideportivo no está disponible ese día' });
        }

        // Validación 4: Horas dentro del horario del polideportivo
        if (inicioSeg < horarioDia.inicio || finSeg > horarioDia.fin) {
            const horaApe = segundosAHora(horarioDia.inicio);
            const horaCie = segundosAHora(horarioDia.fin);
            return res.status(400).json({ message: `Las horas deben estar entre ${horaApe} y ${horaCie}` });
        }

        // Validación 5: Sin conflictos con otras reservas
        const tieneConflicto = data.reservas.some(r => {
            if (r.polideportivo !== polideportivo || r.fechaReserva !== fechaReserva) return false;
            const inicioExistente = parseInt(r.horaInicio);
            const finExistente = parseInt(r.horaFin);
            // Solapamiento: nuevo_inicio < existente_fin AND nuevo_fin > existente_inicio
            return inicioSeg < finExistente && finSeg > inicioExistente;
        });

        if (tieneConflicto) {
            return res.status(409).json({ message: 'Horario no disponible - hay otra reserva en ese horario' });
        }

        // Generar comprobante
        let maxComprobante = 0;
        data.reservas.forEach((r) => {
            const num = parseInt(r.comprobante.split("-")[1], 10);
            if (num > maxComprobante) maxComprobante = num;
        });
        const nuevoComprobante = "RES-" + (maxComprobante + 1);

        // Calcular costo si no viene
        let costoFinal = costo;
        if (!costoFinal) {
            const horas = Math.max(1, Math.ceil((finSeg - inicioSeg) / 3600));
            costoFinal = String(2000 * horas);
        }

        const nuevaReserva = {
            persona,
            motivo: motivo || 'Sin especificar',
            costo: String(costoFinal),
            metodoPago: metodoPago || 'Pendiente',
            polideportivo,
            fechaReserva,
            horaInicio: inicioSeg,
            horaFin: finSeg,
            comprobante: nuevoComprobante
        };

        data.reservas.push(nuevaReserva);
        fs.writeFileSync(ruta, JSON.stringify(data, null, 2));

        res.status(201).json({
            message: 'Reserva creada correctamente',
            comprobante: nuevoComprobante,
            costo: costoFinal
        });
    });

module.exports = router;