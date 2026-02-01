// Cargar datos desde localStorage si están disponibles
function cargarDatos() {
    const pol = localStorage.getItem('polideportivo') || '';
    const esp = localStorage.getItem('espacio') || '';
    const fecha = localStorage.getItem('fechaReserva') || '';
    const horaInicio = localStorage.getItem('horaInicio') || '';
    const horaFin = localStorage.getItem('horaFin') || '';
    const motivo = localStorage.getItem('motivo') || '';

    document.getElementById('polideportivoText').textContent = pol || '-';
    document.getElementById('espacioText').textContent = esp || '-';
    document.getElementById('motivoText').textContent = motivo || '-';
    document.getElementById('fechaText').textContent = fecha || '-';
    document.getElementById('horaText').textContent = (horaInicio && horaFin) ? `${horaInicio} a ${horaFin}` : '-';

    // Calcular pago estimado: 2000 por hora
    let pago = 0;
    if (horaInicio && horaFin) {
        const inicio = parseInt(horaInicio.split(':')[0], 10);
        const fin = parseInt(horaFin.split(':')[0], 10);
        const horas = Math.max(1, fin - inicio);
        pago = 2000 * horas;
    }
    document.getElementById('pagoText').textContent = pago;
}

function mostrarFactura(factura) {
    document.getElementById('facCodigo').textContent = factura.codigoReserva;
    document.getElementById('facPersona').textContent = factura.persona;
    document.getElementById('facPoli').textContent = factura.polideportivo;
    document.getElementById('facEspacio').textContent = factura.espacio;
    document.getElementById('facMotivo').textContent = factura.motivo;
    document.getElementById('facFecha').textContent = factura.fechaReserva;
    document.getElementById('facHora').textContent = `${factura.horaInicio} a ${factura.horaFin}`;
    document.getElementById('facPago').textContent = factura.pagoReserva;
    document.getElementById('modalFactura').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();

    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.location.href = 'realizarReserva.html';
    });

    document.getElementById('btnOk').addEventListener('click', () => {
        // Cerrar factura y volver al inicio
        localStorage.removeItem('polideportivo');
        localStorage.removeItem('espacio');
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

        // Usar solo datos de localStorage (fueron guardados en realizarReserva.html)
        const pol = localStorage.getItem('polideportivo');
        const esp = localStorage.getItem('espacio');
        const fecha = localStorage.getItem('fechaReserva');
        const horaInicio = localStorage.getItem('horaInicio');
        const horaFin = localStorage.getItem('horaFin');
        const motivo = localStorage.getItem('motivo');

        if (!pol || !esp || !fecha || !horaInicio || !horaFin) {
            alert('Faltan datos de la reserva. Vuelva a la pantalla de reservar y complete la información.');
            window.location.href = 'realizarReserva.html';
            return;
        }

        // Validar formato de horas
        if (!horaInicio.match(/^\d{1,2}:\d{2}$/) || !horaFin.match(/^\d{1,2}:\d{2}$/)) {
            alert('Formato de horas inválido');
            return;
        }

        if (horaInicio >= horaFin) {
            alert('La hora de inicio debe ser menor que la hora de fin');
            return;
        }

        const metodo = document.querySelector('input[name="metodoPago"]:checked').value;

        // Calcular costo igual que en cliente
        const inicio = parseInt(horaInicio.split(':')[0], 10);
        const fin = parseInt(horaFin.split(':')[0], 10);
        const horas = Math.max(1, fin - inicio);
        const costo = String(2000 * horas);

        const reservaData = {
            persona: usuario,
            motivo: motivo,
            polideportivo: pol,
            espacio: esp,
            fechaReserva: fecha,
            horaInicio: horaInicio,
            horaFin: horaFin,
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
                mostrarFactura(data.factura);
                // limpiar datos temporales de localStorage que correspondan
                localStorage.removeItem('fechaReserva');
                localStorage.removeItem('horaInicio');
                localStorage.removeItem('horaFin');
                localStorage.removeItem('motivo');
            } else {
                alert('Error: ' + (data.message || 'No se pudo crear la reserva'));
            }
        } catch (error) {
            console.error('Error en fetch:', error);
            alert('Error al comunicarse con el servidor: ' + error.message);
        }
    });
});