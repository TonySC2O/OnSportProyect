const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

//Se importan las rutas del serverProcesos
const rutas=require('./serverProcesos');
app.use('/api', rutas);

//Recibir la ubicación del user
app.post('/location', (req, res) => {
    const { latitude, longitude } = req.body;
    console.log(`Ubicación recibida: Latitud ${latitude}, Longitud ${longitude}`);
    res.json({
        message: 'Ubicación recibida correctamente',
        latitude,
        longitude
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
}); 