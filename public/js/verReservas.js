//Funcionalidad para ver las reservas realizadas por el usuario logged in

document.addEventListener('DOMContentLoaded', async () => {
    console.log('verReservas.js cargado');

    const username = localStorage.getItem('username');
    const role= localStorage.getItem('role');
    //console.log('username:', username);

    if (!username || !role) {
        window.location.href = 'logIn.html';
        return;
    }

    let ruta='';
    if(role==='admin'){
        ruta='/api/reservas';
    }else{
        ruta=`/api/reservas/${username}`;
    }

    try {
        const respuesta = await fetch(ruta);
        console.log('respuesta:', respuesta);

        const data = await respuesta.json();
        console.log('data:', data);

        const reservas = data.reservas;
        const reservasDiv = document.querySelector('.reservasDelUser');

        if (!reservasDiv) {
            console.error('No existe .reservasDelUser en el HTML');
            return;
        }

        if (reservas.length === 0) {
            reservasDiv.innerHTML = '<p>No se encontraron reservas registradas</p>';
            return;
        }

        reservas.forEach(r => {
            const div = document.createElement('div');
            div.style.marginBottom = '20px';
            div.style.padding = '15px';
            div.style.borderRadius = '12px';
            div.style.backgroundColor = '#eaf4fb';
            div.style.border = '2px solid #052e6b';

            div.innerHTML = `
                <p><b>Polideportivo:</b> ${r.polideportivo}</p>
                <p><b>Espacio:</b> ${r.espacio}</p>
                <p><b>Fecha:</b> ${r.fechaReserva}</p>
                <p><b>Horario:</b> ${r.horaInicio} - ${r.horaFin}</p>
                <p><b>Motivo:</b> ${r.motivo}</p>
                <p><b>Costo:</b> ₡${r.costo}</p>
                <p><b>Método de pago:</b> ${r.metodoPago}</p>
            `;

            reservasDiv.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        alert('Error al cargar reservas');
    }
});


