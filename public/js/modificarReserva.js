// ===== FUNCIONES DE CONVERSIÓN HORA <-> SEGUNDOS =====
function horaASegundos(horaStr) {
    const [hh, mm] = horaStr.split(':').map(x => parseInt(x, 10));
    return hh * 3600 + (mm || 0) * 60;
}

function segundosAHora(segundos) {
    segundos = parseInt(segundos);
    const hh = Math.floor(segundos / 3600);
    const mm = Math.floor((segundos % 3600) / 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// ========================================================

const adminUsername = localStorage.getItem('username');

if(adminUsername){
    document.getElementById('nombreAdmin').textContent = adminUsername;
}

let reservaSeleccionada = null; // Variable global para guardar la reserva seleccionada

function seleccionarReserva(reserva){
    reservaSeleccionada = reserva; // Guardar la reserva seleccionada
    
    document.getElementById("nombre").value = reserva.nombre;
    document.getElementById("email").value = reserva.email;
    document.getElementById("telefono").value = reserva.telefono;
    document.getElementById("motivo").value = reserva.motivo;
    document.getElementById("coste").value = reserva.costo;
    document.getElementById("metodoPago").value = reserva.metodoPago;

    // Cambiar automáticamente al polideportivo de la reserva
    document.getElementById("polideportivo").value = reserva.polideportivo;
    document.getElementById("fecha").value = reserva.fechaReserva;
    
    // Convertir segundos a HH:MM para los selects (sin padStart para coincidir con opciones)
    const horaInicioStr = segundosAHora(reserva.horaInicio);
    const horaFinStr = segundosAHora(reserva.horaFin);
    
    // Remover el padding del 0 inicial si existe (ej: "06:00" -> "6:00")
    const horaInicio = horaInicioStr.replace(/^0(\d:)/, '$1');
    const horaFin = horaFinStr.replace(/^0(\d:)/, '$1');
    
    document.getElementById("horaDesde").value = horaInicio;
    document.getElementById("horaHasta").value = horaFin;
    
    document.getElementById("comprobante").value = reserva.comprobante
}

//Funcion para obtener las reservas de una fecha dada y agregarlas en vista
function obtenerReservas(fecha) {
    console.log(fecha)
    document.getElementById("fechaHeader").textContent = fecha
    fetch(`/api/modificarReserva/reservas?fecha=${fecha}`) 
    .then(res => res.json())
    .then(data => { //En data estan las reservas de dicho dia

        const lista = document.getElementById('listaReservas'); //Se van a agregar en el div de listaReservas
        lista.innerHTML = ''; //Se limpia el contenedor

        if( !Array.isArray(data)||data.length === 0){ //Valida en caso de no haber reservas ese dia
            lista.textContent = 'No hay reservas para este dia';
            return;
        }
        
        data.forEach(reserva => {
            const item = document.createElement('div');
            item.classList.add('reserva'); //Clase de CSS para ver la reserva en div

            // Convertir segundos a HH:MM para mostrar en la lista
            const horaInicio = segundosAHora(reserva.horaInicio);
            const horaFin = segundosAHora(reserva.horaFin);
            
            item.textContent = `${reserva.comprobante}  | ${horaInicio} a ${horaFin}`;
            item.addEventListener('click', () => {
                seleccionarReserva(reserva);
            })

            lista.appendChild(item);
        });
    });
}

async function enviarAccion(tipoAccion) {
    let mensaje;  //Mensaje de confirmacion para realizar accion

    if(tipoAccion === "eliminar"){
        mensaje = "¿Esta seguro de eliminar esta reserva?"
    }
    else if(tipoAccion ==="modificar"){
        mensaje = "¿Esta seguro de modificar esta reserva?"
    }

    if (!confirm(mensaje)) return;

    // Obtener valores del formulario
    const horaDesdeHHMM = document.getElementById("horaDesde").value;
    const horaHastaHHMM = document.getElementById("horaHasta").value;
    const fechaReserva = document.getElementById("fecha").value;
    const polideportivoVal = document.getElementById("polideportivo").value;
    const motivo = document.getElementById("motivo").value;

    // Validaciones básicas
    if (!horaDesdeHHMM || !horaHastaHHMM) {
        alert('Por favor selecciona las horas de inicio y fin');
        return;
    }

    if (!fechaReserva) {
        alert('Por favor selecciona una fecha');
        return;
    }

    if (!polideportivoVal) {
        alert('Por favor selecciona un polideportivo');
        return;
    }

    if (!motivo.trim()) {
        alert('Por favor describe el motivo');
        return;
    }

    // Convertir horas a segundos
    const horaInicio = horaASegundos(horaDesdeHHMM);
    const horaFin = horaASegundos(horaHastaHHMM);

    if (horaInicio >= horaFin) {
        alert('La hora de inicio debe ser menor que la hora de fin');
        return;
    }

    // ===== VALIDACIONES DE HORARIO =====
    try {
        if (tipoAccion === "modificar") {
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
            
            // Obtener día de la semana
            const fecha = new Date(fechaReserva + 'T00:00:00');
            const diaDelaSemana = fecha.getDay();
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
            if (horaInicio < aperturaDia) {
                alert(`La hora de inicio no puede ser anterior a ${segundosAHora(aperturaDia)} (hora de apertura)`);
                return;
            }
            
            // VALIDACIÓN 2: La hora de fin NO debe ser mayor al cierre
            if (horaFin > cierreDia) {
                alert(`La hora de fin no puede ser posterior a ${segundosAHora(cierreDia)} (hora de cierre)`);
                return;
            }
            
            // VALIDACIÓN 4: Verificar conflictos con reservas existentes (SOLO SI SE MODIFICÓ ALGO)
            // Comparar si cambió la fecha, hora o polideportivo
            const fechaCambió = reservaSeleccionada.fechaReserva !== fechaReserva;
            const polideportivoCambió = reservaSeleccionada.polideportivo !== polideportivoVal;
            const horarioCambió = reservaSeleccionada.horaInicio !== horaInicio || reservaSeleccionada.horaFin !== horaFin;

            if (fechaCambió || polideportivoCambió || horarioCambió) {
                const reservasResponse = await fetch(`/api/modificarReserva/reservas?fecha=${fechaReserva}`);
                if (!reservasResponse.ok) {
                    throw new Error('Error al obtener reservas');
                }
                const reservas = await reservasResponse.json();
                
                // Filtrar reservas del mismo polideportivo, excluyendo la reserva actual
                const reservasPolideportivo = reservas.filter(r => 
                    r.polideportivo === polideportivoVal && 
                    r.comprobante !== reservaSeleccionada.comprobante
                );
                
                // Verificar conflictos: la nueva reserva NO debe estar dentro del rango de una existente
                for (let reserva of reservasPolideportivo) {
                    const inicioExistente = reserva.horaInicio;
                    const finExistente = reserva.horaFin;
                    
                    // Verificar solapamiento: inicioNuevo < finExistente && finNuevo > inicioExistente
                    // PERO permitir si inicioNuevo === finExistente
                    const solapamiento = horaInicio < finExistente && horaFin > inicioExistente;
                    const esAdyacente = horaInicio === finExistente;
                    
                    if (solapamiento && !esAdyacente) {
                        alert(`Hay una reserva existente de ${segundosAHora(inicioExistente)} a ${segundosAHora(finExistente)}. Tu reserva se solapa con ésta.`);
                        return;
                    }
                }
            }
        }

        // Si todas las validaciones pasaron, enviar la acción
        const data = {
            tipoUso: tipoAccion,
            comprobante: document.getElementById("comprobante").value,
            polideportivo: polideportivoVal,
            fechaReserva: fechaReserva,
            horaInicio: horaInicio,
            horaFin: horaFin,
            motivo: motivo
        };

        const res = await fetch("/api/modificarReserva/modificar", { 
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(!res.ok){
            alert(result.message)
        }
        else{
            alert(result.message)
            window.location.reload();
        }

    } catch (error) {
        console.error('Error en validación:', error);
        alert('Error al validar la reserva: ' + error.message);
    }
}

var picker = new Pikaday({
//el calendario siempre se va a mostrar
field: document.getElementById('calendario'), 
bound: false, 
container: document.getElementById('calendario'),

firstDay: 7, 
format: 'YYYY-MM-DD',
showDaysInNextAndPreviousMonths: true,

onSelect: function(date) {
    const fecha = picker.toString();

    obtenerReservas(fecha);
}
});

const fechaActual = new Date().toISOString().split('T')[0]; //Obtiene fecha de hoy y hace formato yyyy-mm-dd
obtenerReservas(fechaActual);

document.getElementById("modificarBtn").addEventListener("click", () => enviarAccion("modificar"));
document.getElementById("eliminarBtn").addEventListener("click", () => enviarAccion("eliminar"));


const rol=localStorage.getItem('role');
if(rol){//Si hay rol en localstorage, solo se muestra el cerrar sesion
    document.getElementById('iniciarSesion').style.display='none';
    document.getElementById('registro').style.display='none';
    document.getElementById('logout').style.display='inline-block';
}
//Limpia el local.storage y devuelve a home
document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href='home.html';
});
