// Variables globales
let fechaSeleccionada = new Date();
let mesActual = new Date();
let polideportivo = '';
let espacio = '';
let reservasDelDia = [];
let diasConReservas = {}; // Para guardar qué días tienen reservas

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    cargarDatos();
    await cargarReservasDelMes();
    generarCalendario();
    asignarEventos();
    mostrarReservasDelDia(new Date());
});

// Cargar datos del localStorage
function cargarDatos() {
    const polideportivo_element = document.getElementById('polideportivo');
    const espacio_element = document.getElementById('espacio');
    
    // Cargar desde localStorage
    const polideportivoNombre = localStorage.getItem('polideportivo') || localStorage.getItem('polideportivoNombre') || '';
    const espacioNombre = localStorage.getItem('espacio') || localStorage.getItem('espacioNombre') || '';
    
    if (polideportivoNombre) {
        polideportivo = polideportivoNombre;
        polideportivo_element.value = polideportivoNombre;
    }
    
    if (espacioNombre) {
        espacio = espacioNombre;
        espacio_element.value = espacioNombre;
    }
}

// Cargar reservas del mes actual
async function cargarReservasDelMes() {
    try {
        const response = await fetch('/api/reservas');
        if (!response.ok) {
            throw new Error('Error al obtener reservas');
        }
        
        const data = await response.json();
        const reservas = data.reservas || [];
        const año = mesActual.getFullYear();
        const mes = String(mesActual.getMonth() + 1).padStart(2, '0');
        
        // Limpiar días con reservas previos
        diasConReservas = {};
        
        // Llenar los días que tienen reservas
        reservas.forEach(reserva => {
            if (reserva.fechaReserva.startsWith(`${año}-${mes}`)) {
                const dia = reserva.fechaReserva.split('-')[2];
                diasConReservas[dia] = true;
            }
        });
    } catch (error) {
        console.error('Error cargando reservas del mes:', error);
    }
}

// Generar calendario
function generarCalendario() {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    
    // Actualizar título
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = `${meses[mes]} - ${año}`;
    
    // Recargar reservas del mes
    cargarReservasDelMes();
    
    // Limpiar calendario anterior
    const calendario = document.getElementById('calendario');
    calendario.innerHTML = '';
    
    // Agregar días de la semana
    const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'Sa'];
    diasSemana.forEach(dia => {
        const divDia = document.createElement('div');
        divDia.className = 'diaSemana';
        divDia.textContent = dia;
        calendario.appendChild(divDia);
    });
    
    // Obtener primer día y cantidad de días del mes
    const primerDia = new Date(año, mes, 1).getDay();
    const diasMes = new Date(año, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    
    // Días del mes anterior
    for (let i = primerDia - 1; i >= 0; i--) {
        const divDia = document.createElement('div');
        divDia.className = 'dia otroMes';
        divDia.textContent = diasMesAnterior - i;
        calendario.appendChild(divDia);
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= diasMes; dia++) {
        const divDia = document.createElement('div');
        divDia.className = 'dia';
        divDia.textContent = dia;
        
        const diaFormato = String(dia).padStart(2, '0');
        
        // Marcar días con reservas
        if (diasConReservas[diaFormato]) {
            divDia.classList.add('conReserva');
        }
        
        const fechaDia = new Date(año, mes, dia);

        // Marcar día actual
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaDia.getTime() === hoy.getTime()) {
            divDia.classList.add('hoy');
        }

        // Marcar día seleccionado
        if (fechaDia.toDateString() === fechaSeleccionada.toDateString()) {
            divDia.classList.add('seleccionado');
        }
        
        // Evitar seleccionar fechas pasadas
        if (fechaDia < new Date(new Date().setHours(0, 0, 0, 0))) {
            divDia.classList.add('otroMes');
            divDia.style.cursor = 'not-allowed';
        } else {
            divDia.addEventListener('click', () => seleccionarDia(fechaDia));
        }
        
        calendario.appendChild(divDia);
    }
    
    // Días del próximo mes
    const totalCeldas = calendario.children.length - 7; // -7 por los días de semana
    const celdasFaltantes = 42 - totalCeldas;
    for (let dia = 1; dia <= celdasFaltantes; dia++) {
        const divDia = document.createElement('div');
        divDia.className = 'dia otroMes';
        divDia.textContent = dia;
        calendario.appendChild(divDia);
    }
}

// Seleccionar un día
function seleccionarDia(fecha) {
    fechaSeleccionada = fecha;
    generarCalendario();
    mostrarReservasDelDia(fecha);
}

// Mostrar reservas del día seleccionado
function mostrarReservasDelDia(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaFormato = `${año}-${mes}-${dia}`;
    
    // Actualizar título
    const fechaNombre = fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('fechaSeleccionada').textContent = `Reservas ${fechaNombre}`;
    document.getElementById('infoPanel').textContent = `Fecha: ${fechaNombre}`;
    
    // Obtener reservas del API
    obtenerReservasDelDia(fechaFormato);
}

// Obtener reservas del día desde el servidor
async function obtenerReservasDelDia(fecha) {
    try {
        const response = await fetch(`/api/modificarReserva/reservas?fecha=${fecha}`);
        
        if (!response.ok) {
            throw new Error('Error al obtener las reservas');
        }
        
        const reservas = await response.json();
        mostrarReservasEnPantalla(reservas);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('listaReservas').innerHTML = '<div class="sinReservas">Error al cargar las reservas</div>';
    }
}

// Mostrar reservas en pantalla
function mostrarReservasEnPantalla(reservas) {
    const listaReservas = document.getElementById('listaReservas');
    
    if (!reservas || reservas.length === 0) {
        listaReservas.innerHTML = '<div class="sinReservas">Sin reservas previstas</div>';
        return;
    }
    
    let html = '';
    reservas.forEach(reserva => {
        html += `
            <div class="reservaItem">
                <strong>${reserva.horaInicio} a ${reserva.horaFin}</strong><br>
                Espacio: ${reserva.espacio}<br>
                Usuario: ${reserva.nombre}
            </div>
        `;
    });
    
    listaReservas.innerHTML = html;
}

// Asignar eventos a botones
function asignarEventos() {
    // Navegación del calendario
    document.getElementById('mesAnterior').addEventListener('click', () => {
        mesActual.setMonth(mesActual.getMonth() - 1);
        generarCalendario();
    });
    
    document.getElementById('mesSiguiente').addEventListener('click', () => {
        mesActual.setMonth(mesActual.getMonth() + 1);
        generarCalendario();
    });
    
    // Botones de la reserva
    document.getElementById('btnCancelar').addEventListener('click', () => {
        if (confirm('¿Desea cancelar la reserva?')) {
            limpiarFormulario();
            window.location.href = 'home.html';
        }
    });
    
    document.getElementById('btnReservar').addEventListener('click', realizarReserva);
    
    // Botón de perfil
    document.getElementById('verPerfil').addEventListener('click', () => {
        alert('Ir a perfil de usuario');
    });
    
    // Botón de cerrar sesión
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'home.html';
    });
    
    // Mostrar logout si hay sesión
    const rol = localStorage.getItem('role');
    if (rol) {
        document.getElementById('logout').style.display = 'inline-block';
        document.getElementById('verPerfil').style.display = 'inline-block';
    }
}

// Realizar reserva
async function realizarReserva() {
    const usuario = localStorage.getItem('username');
    const motivo = document.getElementById('motivo').value.trim();
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    
    // Validaciones
    if (!usuario) {
        alert('Debes iniciar sesión para realizar una reserva');
        window.location.href = 'login.html';
        return;
    }
    
    const polideportivoVal = document.getElementById('polideportivo').value;
    const espacioVal = document.getElementById('espacio').value;
    
    if (!polideportivoVal || !espacioVal) {
        alert('Debes seleccionar un polideportivo y un espacio');
        return;
    }
    
    if (!motivo) {
        alert('Por favor, describe el motivo de la reserva');
        return;
    }
    
    if (!horaInicio || !horaFin) {
        alert('Por favor, selecciona las horas de inicio y fin');
        return;
    }
    
    if (horaInicio >= horaFin) {
        alert('La hora de inicio debe ser menor que la hora de fin');
        return;
    }
    
    const año = fechaSeleccionada.getFullYear();
    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaFormato = `${año}-${mes}-${dia}`;
    
    // Guardar datos en localStorage para pagoConfirmacion.html
    localStorage.setItem('fechaReserva', fechaFormato);
    localStorage.setItem('horaInicio', horaInicio);
    localStorage.setItem('horaFin', horaFin);
    localStorage.setItem('motivo', motivo);
    
    // Redirigir a pagoConfirmacion
    window.location.href = 'pagoConfirmacion.html';
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('motivo').value = '';
    document.getElementById('horaInicio').value = '';
    document.getElementById('horaFin').value = '';
}
