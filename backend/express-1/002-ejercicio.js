const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const PORT = process.env.PORT ?? 3000;

const usuarios = [
    { id: 1, nombre: 'Emiliano', apellido: 'Martínez', edad: 30, seguidores: [], seguidos: [] },
    { id: 2, nombre: 'Nicolás', apellido: 'Tagliafico', edad: 30, seguidores: [], seguidos: [] },
    { id: 3, nombre: 'Gonzalo', apellido: 'Montiel', edad: 26, seguidores: [], seguidos: [] },
    { id: 4, nombre: 'Angel', apellido: 'Di María', edad: 35, seguidores: [], seguidos: [] }
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

    /**
     * Se seleccionan solo las propiedades 'id' y 'nombre' de los objetos 'seguidores' y 'seguidos' antes de incluirlos en la respuesta JSON. 
     * Esto evita las referencias circulares y permite enviar la respuesta correctamente.
     */
    if(usuario) {
        let response = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            edad: usuario.edad,
            seguidores: usuario.seguidores.map(seguidor => ({ id: seguidor.id, nombre: seguidor.nombre })),
            seguidos: usuario.seguidos.map(seguido => ({ id: seguido.id, nombre: seguido.nombre }))
        };
        return res.json(response);
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


app.post('/seguimiento/:idSeguidor/:idSeguido', (req, res) => {
    const { idSeguidor, idSeguido } = req.params;

    const seguidorIndex = usuarios.findIndex(usuario => usuario.id === parseInt(idSeguidor));
    const seguidoIndex = usuarios.findIndex(usuario => usuario.id === parseInt(idSeguido));

    if(seguidorIndex === -1 || seguidoIndex === -1) {
        return res.status(404).send('Not Found');
    }

    usuarios[seguidorIndex].seguidos.push(usuarios[seguidoIndex]);
    usuarios[seguidoIndex].seguidores.push(usuarios[seguidorIndex]);

    res.status(200).send('Usuario seguido');
});

app.delete('/seguimiento/:idSeguidor/:idSeguido', (req, res) => {
    const { idSeguidor, idSeguido } = req.params;

    const seguidorIndex = usuarios.findIndex(usuario => usuario.id === parseInt(idSeguidor));
    const seguidoIndex = usuarios.findIndex(usuario => usuario.id === parseInt(idSeguido));

    if(seguidorIndex === -1 || seguidoIndex === -1) {
        return res.status(404).send('Not Found');
    }

    usuarios[seguidorIndex].seguidos = usuarios[seguidorIndex].seguidos.filter(seguido => seguido.id !== parseInt(idSeguido));
    usuarios[seguidoIndex].seguidores = usuarios[seguidoIndex].seguidores.filter(seguidor => seguidor.id !== parseInt(idSeguidor));
    
    res.status(200).send('Seguidor y seguidos eliminados');
});


app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
    console.log(`Escuchando en el puerto http://localhost:${PORT}`);
});