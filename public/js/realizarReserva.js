// Variables globales
let fechaSeleccionada = new Date();
let mesActual = new Date();
let polideportivo = '';
let reservasDelDia = [];
let diasConReservas = {}; // Para guardar qué días tienen reservas

// ===== FUNCIONES DE CONVERSIÓN HORA <-> SEGUNDOS =====
// Convierte HH:MM a segundos (ej: "06:30" -> 23400)
function horaASegundos(horaStr) {
    const [hh, mm] = horaStr.split(':').map(x => parseInt(x, 10));
    return hh * 3600 + (mm || 0) * 60;
}

// Convierte segundos a HH:MM (ej: 23400 -> "06:30")
function segundosAHora(segundos) {
    const hh = Math.floor(segundos / 3600);
    const mm = Math.floor((segundos % 3600) / 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

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
    
    // Cargar desde localStorage
    const polideportivoNombre = localStorage.getItem('polideportivo') || localStorage.getItem('polideportivoNombre') || '';
    
    if (polideportivoNombre) {
        polideportivo = polideportivoNombre;
        polideportivo_element.value = polideportivoNombre;
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
        const fechaDia = new Date(año, mes, dia);

        // Marcar día actual (primero, para que tenga prioridad visual)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaDia.getTime() === hoy.getTime()) {
            divDia.classList.add('hoy');
        }
        
        // Marcar días con reservas (después, si no es hoy)
        if (diasConReservas[diaFormato] && !divDia.classList.contains('hoy')) {
            divDia.classList.add('conReserva');
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
        // Convertir segundos a HH:MM para mostrar
        const horaInicio = segundosAHora(reserva.horaInicio);
        const horaFin = segundosAHora(reserva.horaFin);
        
        html += `
            <div class="reservaItem">
                <strong>${horaInicio} a ${horaFin}</strong><br>
                Polideportivo: ${reserva.polideportivo || ''}<br>
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
    
    // Validaciones básicas
    if (!usuario) {
        alert('Debes iniciar sesión para realizar una reserva');
        window.location.href = 'login.html';
        return;
    }
    
    // Obtener polideportivo
    const polideportivoVal = document.getElementById('polideportivo').value;

    if (!polideportivoVal) {
        alert('Debes seleccionar un polideportivo');
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
    
    // Convertir horas a segundos
    const inicioEnSegundos = horaASegundos(horaInicio);
    const finEnSegundos = horaASegundos(horaFin);
    
    if (inicioEnSegundos >= finEnSegundos) {
        alert('La hora de inicio debe ser menor que la hora de fin');
        return;
    }
    
    const año = fechaSeleccionada.getFullYear();
    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaFormato = `${año}-${mes}-${dia}`;
    
    // ===== VALIDACIONES DE HORARIO =====
    try {
        // Obtener datos del polideportivo
        const polideportivosResponse = await fetch('/api/polideportivos');
        if (!polideportivosResponse.ok) {
            throw new Error('Error al obtener información del polideportivo');
        }
        const polideportivosData = await polideportivosResponse.json();
        const polideportivo = polideportivosData.polideportivos.find(p => p.titulo === polideportivoVal);
        
        if (!polideportivo) {
            alert('Polideportivo no encontrado');
            return;
        }
        
        // Obtener día de la semana (0=domingo, 1=lunes, etc)
        const diaDelaSemana = fechaSeleccionada.getDay();
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const nombreDia = diasSemana[diaDelaSemana];
        
        // VALIDACIÓN 3: Verificar que el día tenga horario válido (no sea null)
        const horarioDia = polideportivo.horario[nombreDia];
        if (horarioDia === null) {
            alert(`El polideportivo no está disponible el ${nombreDia}`);
            return;
        }
        
        const aperturaDia = horarioDia.inicio;
        const cierreDia = horarioDia.fin;
        
        // VALIDACIÓN 1: La hora de inicio NO debe ser menor a la apertura
        if (inicioEnSegundos < aperturaDia) {
            alert(`La hora de inicio no puede ser anterior a ${segundosAHora(aperturaDia)} (hora de apertura)`);
            return;
        }
        
        // VALIDACIÓN 2: La hora de fin NO debe ser mayor al cierre
        if (finEnSegundos > cierreDia) {
            alert(`La hora de fin no puede ser posterior a ${segundosAHora(cierreDia)} (hora de cierre)`);
            return;
        }
        
        // VALIDACIÓN 4: Verificar conflictos con reservas existentes
        const reservasResponse = await fetch(`/api/modificarReserva/reservas?fecha=${fechaFormato}`);
        if (!reservasResponse.ok) {
            throw new Error('Error al obtener reservas');
        }
        const reservas = await reservasResponse.json();
        
        // Filtrar reservas del mismo polideportivo
        const reservasPolideportivo = reservas.filter(r => r.polideportivo === polideportivoVal);
        
        // Verificar conflictos: la nueva reserva NO debe estar dentro del rango de una existente
        // EXCEPCIÓN: Si la hora de inicio coincide con la hora final de una reserva existente, está permitido
        for (let reserva of reservasPolideportivo) {
            const inicioExistente = reserva.horaInicio;
            const finExistente = reserva.horaFin;
            
            // Verificar solapamiento: inicioNuevo < finExistente && finNuevo > inicioExistente
            // PERO permitir si inicioNuevo === finExistente
            const solapamiento = inicioEnSegundos < finExistente && finEnSegundos > inicioExistente;
            const esAdyacente = inicioEnSegundos === finExistente;
            
            if (solapamiento && !esAdyacente) {
                alert(`Hay una reserva existente de ${segundosAHora(inicioExistente)} a ${segundosAHora(finExistente)}. Tu reserva se solapa con ésta.`);
                return;
            }
        }
        
        // Si todas las validaciones pasaron, guardar datos en localStorage
        localStorage.setItem('fechaReserva', fechaFormato);
        localStorage.setItem('horaInicio', inicioEnSegundos);
        localStorage.setItem('horaFin', finEnSegundos);
        localStorage.setItem('motivo', motivo);
        localStorage.setItem('polideportivo', polideportivoVal);

        // Redirigir a pagoConfirmacion
        window.location.href = 'pagoConfirmacion.html';
        
    } catch (error) {
        console.error('Error en validación:', error);
        alert('Error al validar la reserva: ' + error.message);
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('motivo').value = '';
    document.getElementById('horaInicio').value = '';
    document.getElementById('horaFin').value = '';
}
