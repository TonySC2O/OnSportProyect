/*Data contiene las listas de los usuarios en toda la app(Admis y users)
Se agregaron 4 Adms a mano y algunos users para la prueba de la app*/

const admins = [//Default admins
    { nombre:'Victoria Molina',username: 'vicAdm',email:'vic@hotmail.com',telefono:'62157890', password: 'soyAdmin' },
    { nombre:'Josue Meza',username: 'josueAdm',email:'josue@hotmail.com',telefono:'85693274', password: 'soyAdmin2' },
    { nombre:'Tony Solano',username: 'tonyAdm',email:'tony@hotmail.com',telefono:'78256938', password: 'soyAdmin3' },
    { nombre:'Andres Blanco',username: 'AndresAdm',email:'andres@hotmail.com',telefono:'32564895', password: 'soyAdmin4' }
];
const users = [];//Se registran users aqui

class User {constructor(nombre,username,email,telefono,password) {
        this.nombre = nombre;
        this.username = username;
        this.email= email;
        this.telefono= telefono;
        this.password = password;
        
    }
}
/*console.log(users);
console.log(admins);*/
module.exports = { admins, users };