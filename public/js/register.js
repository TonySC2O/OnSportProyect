//Funcion para registrar usuarios (conecta al front-end)


document.getElementById('registrarseBtn').addEventListener('click', () => {
    console.log("Botón presionado");
    fetch('/api/register',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
            nombre:document.getElementById('nombre').value,
            username:document.getElementById('userName').value,
            email:document.getElementById('email').value,
            telefono:document.getElementById('telefono').value,
            password:document.getElementById('password').value,
            role:'user'
        })
    })
    .then(res=>res.json())
    .then(data=>{
        alert(data.message)
        document.querySelectorAll('input').forEach(input => input.value = "")
    ;})
    window.location.href='home.html';//Redirigir a Home despues de registrarse
});