//Funcion para el inicio de sesion

document.getElementById('logInButton').addEventListener('click', async function(event) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(!username || !password){
        alert('Por favor, complete todos los campos.');
        return;
    }
    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data= await respuesta.json(); 
        if(!respuesta.ok){
            alert(data.message ||'Error en el inicio de sesión');
            return;
        }

        localStorage.setItem('role', data.role)({
            username:data.username,
            role:data.role
        });

        window.location.href='home.html';
        
        return respuesta.status(200).json({
            message:'Inicio de sesión exitoso',
            role:data.role,
            username:data.username
        })

    } catch (error) {
        console.error('Error:', error);
        alert('Error en el inicio de sesión');
    }
});