// ===== FUNCIONES DE CONVERSIÓN HORA <-> SEGUNDOS =====
function horaASegundos(horaStr) {
    const [hh, mm] = horaStr.split(':').map(x => parseInt(x, 10));
    return hh * 3600 + (mm || 0) * 60;
}

// Convierte segundos a HH:MM
function segundosAHora(segundos) {
    segundos = parseInt(segundos);
    const hh = Math.floor(segundos / 3600);
    const mm = Math.floor((segundos % 3600) / 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

async function obtenerPrecioPolideportivo(nombrePoli) {
    try {
        const resp = await fetch('/api/polideportivos');
        const data = await resp.json();

        const poli = data.polideportivos.find(
            p => p.titulo === nombrePoli
        );

        return poli ? poli.precio : 0;
    } catch (error) {
        console.error('Error obteniendo polideportivos:', error);
        return 0;
    }
}

// Cargar datos desde localStorage si están disponibles
async function cargarDatos() {
    const pol = localStorage.getItem('polideportivo') || '';
    const fecha = localStorage.getItem('fechaReserva') || '';
    const inicioSeg = localStorage.getItem('horaInicio') || '';
    const finSeg = localStorage.getItem('horaFin') || '';
    const motivo = localStorage.getItem('motivo') || '';

    // Convertir segundos a HH:MM para mostrar
    const horaInicio = inicioSeg ? segundosAHora(inicioSeg) : '';
    const horaFin = finSeg ? segundosAHora(finSeg) : '';

    document.getElementById('polideportivoText').textContent = pol || '-';
    document.getElementById('motivoText').textContent = motivo || '-';
    document.getElementById('fechaText').textContent = fecha || '-';
    document.getElementById('horaText').textContent = (horaInicio && horaFin) ? `${horaInicio} a ${horaFin}` : '-';

    let pago = 0;
    if (inicioSeg && finSeg) {
        const inicio = parseInt(inicioSeg);
        const fin = parseInt(finSeg);
        const horas = Math.max(1, Math.ceil((fin - inicio) / 3600));
        
        // Obtener el precio del polideportivo desde data.json
        try {
            const precioBase = await obtenerPrecioPolideportivo(pol);
            pago = precioBase * horas;
        } catch (error) {
            console.error('Error al obtener precio:', error);
            pago = 0;
        }
    }
    document.getElementById('pagoText').textContent = pago;
}

function mostrarFactura(factura) {
    document.getElementById('facCodigo').textContent = factura.codigoReserva;
    document.getElementById('facPersona').textContent = factura.persona;
    document.getElementById('facPoli').textContent = factura.polideportivo;
    document.getElementById('facMotivo').textContent = factura.motivo;
    document.getElementById('facFecha').textContent = factura.fechaReserva;
    // Factura viene con segundos del servidor, convertir a HH:MM
    const horaInicio = segundosAHora(factura.horaInicio);
    const horaFin = segundosAHora(factura.horaFin);
    document.getElementById('facHora').textContent = `${horaInicio} a ${horaFin}`;
    document.getElementById('facPago').textContent = factura.pagoReserva;
    document.getElementById('modalFactura').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();

    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.location.href = 'realizarReserva.html';
    });

    document.getElementById('btnOk').addEventListener('click', () => {
        // Cerrar factura y volver al inicio
        localStorage.removeItem('polideportivo');
        localStorage.removeItem('fechaReserva');
        localStorage.removeItem('horaInicio');
        localStorage.removeItem('horaFin');
        localStorage.removeItem('motivo');
        window.location.href = 'home.html';
    });

    document.getElementById('btnRealizar').addEventListener('click', async () => {
        const usuario = localStorage.getItem('username');
        if (!usuario) {
            alert('Debe iniciar sesión para realizar la reserva');
            window.location.href = 'login.html';
            return;
        }

        // Usar datos de localStorage (están en segundos)
        const pol = localStorage.getItem('polideportivo');
        const fecha = localStorage.getItem('fechaReserva');
        const horaInicio = localStorage.getItem('horaInicio');
        const horaFin = localStorage.getItem('horaFin');
        const motivo = localStorage.getItem('motivo');

        if (!pol || !fecha || !horaInicio || !horaFin) {
            alert('Faltan datos de la reserva. Vuelva a la pantalla de reservar y complete la información.');
            window.location.href = 'realizarReserva.html';
            return;
        }

        // Validar que sean números (segundos)
        const inicioNum = parseInt(horaInicio);
        const finNum = parseInt(horaFin);
        if (isNaN(inicioNum) || isNaN(finNum)) {
            alert('Formato de horas inválido');
            return;
        }

        if (inicioNum >= finNum) {
            alert('La hora de inicio debe ser menor que la hora de fin');
            return;
        }

        const metodo = document.querySelector('input[name="metodoPago"]:checked').value;

        // Calcular costo en base a segundos y precio del polideportivo
        const horas = Math.max(1, Math.ceil((finNum - inicioNum) / 3600));
        const precioBase = await obtenerPrecioPolideportivo(pol);
        const costo = String(precioBase * horas);

        const reservaData = {
            persona: usuario,
            motivo: motivo,
            polideportivo: pol,
            fechaReserva: fecha,
            horaInicio: inicioNum,  // Enviar en segundos
            horaFin: finNum,         // Enviar en segundos
            metodoPago: metodo,
            costo: costo
        };

        console.log('Enviando reserva:', reservaData);

        try {
            const resp = await fetch('/api/crearReserva', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaData)
            });

            const data = await resp.json();
            console.log('Respuesta del servidor:', data);

            if (resp.status === 201) {
                const factura = {
                    codigoReserva: data.comprobante,
                    persona: usuario,
                    polideportivo: pol,
                    motivo: motivo,
                    fechaReserva: fecha,
                    horaInicio: inicioNum,
                    horaFin: finNum,
                    pagoReserva: costo
                };
                mostrarFactura(factura);
                // limpiar datos temporales de localStorage
                localStorage.removeItem('fechaReserva');
                localStorage.removeItem('horaInicio');
                localStorage.removeItem('horaFin');
                localStorage.removeItem('motivo');
            } else {
                // Mostrar mensaje detallado del servidor
                const errorMsg = data.message || 'No se pudo crear la reserva';
                alert('Error al crear la reserva:\n\n' + errorMsg);
                console.error('Error completo:', data);
            }
        } catch (error) {
            console.error('Error en fetch:', error);
            alert('Error al comunicarse con el servidor:\n\n' + error.message);
        }
    });
});