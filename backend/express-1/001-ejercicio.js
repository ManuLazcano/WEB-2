const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const PORT = process.env.PORT ?? 3000;

const usuarios = [
    { id: 1, nombre: 'Emiliano', apellido: 'Martínez', edad: 30 },
    { id: 2, nombre: 'Nicolás', apellido: 'Tagliafico', edad: 30 },
    { id: 3, nombre: 'Gonzalo', apellido: 'Montiel', edad: 26 },
    { id: 4, nombre: 'Angel', apellido: 'Di María', edad: 35 }
];
  

app.get('/', (req, res) => {
    res.send("Página de inicio");
});

app.get('/usuarios', (req, res) => {
    let response = usuarios.map(usuario => {
        return { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido}
    });
    res.json(response);
});

app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const usuario = usuarios.find(usuario => usuario.id === parseInt(id));

    if(usuario) {
        return res.json(usuario);
    }
    res.status(404).send("Usuario no encontrado");
});

app.post('/usuarios', (req, res) => {
    const { nombre, apellido, edad } = req.body;
    const id = Math.max(...usuarios.map(usuario => usuario.id)) + 1;
    const nuevoUsuario = { id, nombre, apellido, edad };
    usuarios.push(nuevoUsuario);

    res.status(201).json(nuevoUsuario.id);
});

app.patch('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, edad } = req.body;
    const usuarioIndex = usuarios.findIndex(usuario => usuario.id === parseInt(id));

    if(usuarioIndex === -1) {
        return res.status(404).send('Usuario no encontrado');
    }
    
    usuarios[usuarioIndex].nombre = nombre;
    usuarios[usuarioIndex].apellido = apellido;
    usuarios[usuarioIndex].edad = edad;

    res.json(usuarios[usuarioIndex].id);
});

app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const usuarioIndex = usuarios.findIndex(usuario => usuario.id === parseInt(id));
    
    if(usuarioIndex === -1) {
        return res.status(404).send('Usuario no encontrado');
    }

    const usuarioEliminado = usuarios.splice(usuarioIndex, 1);
    res.json('Ok');
});

app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
    console.log(`Escuchando en el puerto http://localhost:${PORT}`);
});