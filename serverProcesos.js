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
