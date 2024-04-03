const express = require('express');
const PORT = process.env.PORT ?? 3000;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Datos
let idCurrentUser;
const tokens = [];

const users = [
    { id: 1, name: "German Sanchez", email: "german@gmail.com", password: "1234"},
    { id: 2, name: "Isaac Amaya", email: "isaac@gmail.com", password: "1234"},
    { id: 3, name: "Aenea Lamia", email: "aenea@gmail.com", password: "1234"},
    { id: 4, name: "Martin Silenus", email: "martin@gmail.com", password: "1234"},    
];

const currentDate = new Date();
const eventDateOne = new Date(currentDate);
eventDateOne.setDate(currentDate.getDate() + 4);

const events = [
    { id: 1, id_user: 3, datetime: eventDateOne, title: "Evento 1", description: "Evento de programación", guests: [1, 4]},
    { id: 2, id_user: 3, datetime: eventDateOne, title: "Evento 2", description: "Evento de video juegos", guests: [1, 4]},
    { id: 3, id_user: 1, datetime: eventDateOne, title: "Evento 3", description: "Evento deportivo", guests: [1, 4]},
];

const opcions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Para usar formato de 24 horas
};

// Funciones de ayuda
const requireLogin = (req, res, next) => {
    const token = req.headers.authorization;

    // Verifica si el token existe y es válido
    const tokenData = tokens.find(t => t.token === token);

    if(tokenData && tokenData.expires > Date.now()) {
        next(); // Token válido, permite continuar
    } else {
        return res.status(401).json({ error: 'No autorizado!' });
    }
};

const generarToken = () => {
    const token = Math.floor(Math.random() * 1000 * Date.now()).toString(36); // string aleatorio
    const expires = Date.now() + (60 * 60 * 1000); // Token válido por una hora (en milisegundos)

    tokens.push({ token, expires });
    return token;
}

// API REST
app.get('/eventos', requireLogin, (req, res) => {
    let response = events.map(event => {
        return { id: event.id, datetime: event.datetime.toLocaleDateString('es-Es', opcions), title: event.title, numberOfGuests: event.guests.length }        
    });
    res.json(response);
});

app.get('/eventos/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const event = events.find(event => event.id === parseInt(id));

    if(!event) {
        return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const response = { id: event.id, id_user: event.id_user, datetime: event.datetime.toLocaleDateString('es-Es', opcions), title: event.title, guests: event.guests }                                                                                                                                                                                                                            
    res.json(response);
});

app.post('/login', (req, res) => {
    const credentials = req.body;
    const authenticatedUser = users.find(user => user.email == credentials.email && user.password == credentials.password);

    if(authenticatedUser) {
        const token = generarToken();
        res.status(201).json({token: token});
        idCurrentUser = authenticatedUser.id;         
    } else {
        return res.status(401).json({ error: 'No autorizado!' });
    }
});

app.post('/eventos', requireLogin, (req, res) => {
    const { id_user, datetime, title, description, guests } = req.body;
    
    if (!id_user || !datetime || !title || !description || !guests) {
        return res.status(400).json({ error: 'Faltan datos del evento' });
    }
    const date = new Date(datetime);
    const newEvent = {
        id: events.length + 1,
        id_user,
        datetime: date,
        title,
        description,
        guests
    };

    events.push(newEvent);

    res.status(201).json(newEvent.id);
});

app.patch('/eventos/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { id_user, datetime, title, description, guests } = req.body;
    
    if (!id_user || !datetime || !title || !description || !guests) {
        return res.status(400).json({ error: 'Faltan datos del evento' });
    }
    
    const eventIndex = events.findIndex(event => event.id === parseInt(id));
    if(eventIndex === -1) {
        return res.status(404).send('Evento no encontrado');
    }

    if(id_user !== events[eventIndex].id_user) {
        return res.status(403).send('El usuario no es el dueño del evento')
    }

    const date = new Date(datetime);

    events[eventIndex].datetime = date;
    events[eventIndex].title = title;
    events[eventIndex].description = description;
    events[eventIndex].guests = guests;

    res.json(events[eventIndex].id);

});

app.delete('/eventos/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const eventIndex = events.findIndex(event => event.id === parseInt(id));
    
    if(eventIndex === -1) {
        return res.status(404).send('Evento no encontrado');
    }
    
    if(events[eventIndex].id_user !== idCurrentUser) {
        return res.status(403).send('El usuario no es el dueño del evento');
    }
    
    events.splice(eventIndex, 1);
    res.json('Ok');
});

app.post('/eventos/:id/invitado/:idUsuario', requireLogin, (req, res) => {
    const { id, idUsuario } = req.params;
    const eventIndex = events.findIndex(event => event.id === parseInt(id));
    const guestsIndex = users.findIndex(user => user.id === parseInt(idUsuario));
    
    if(eventIndex === -1) {
        return res.status(404).send('Evento no encontrado');
    }

    if(guestsIndex === -1) {
        return res.status(404).send('Invitado no encontrado');
    }
    
    if(events[eventIndex].id_user !== idCurrentUser) {
        return res.status(403).send('El usuario no es el dueño del evento');
    }

    const isGuest = events[eventIndex].guests.includes(users[guestsIndex].id);
    if(isGuest) {
        return res.status(400).send('El usuario ya es un invitado en este evento');
    }

    events[eventIndex].guests.push(users[guestsIndex].id);
    res.json(events[eventIndex].id);
});

app.delete('/eventos/:id/invitado/:idUsuario', requireLogin, (req, res) => {
    const { id, idUsuario } = req.params; 
    const eventIndex = events.findIndex(event => event.id === parseInt(id));
    const userIndex = users.findIndex(user => user.id === parseInt(idUsuario));
    
    if(eventIndex === -1) {
        return res.status(404).send('Evento no encontrado');
    }

    if(events[eventIndex].id_user !== idCurrentUser) {
        return res.status(403).send('El usuario no es el dueño del evento');
    }
    
    if(userIndex === -1) {
        return res.status(404).send('El usuario no existe');
    }

    if(!events[eventIndex].guests.includes(parseInt(idUsuario))) {
        return res.status(404).send('El usuario no es un invitado');
    }

    const guestIndex = events[eventIndex].guests.findIndex(idGuest => idGuest === parseInt(idUsuario));
    events[eventIndex].guests.splice(guestIndex, 1);
    res.json({ message: 'Eliminado con éxito' });
    
});

app.listen(PORT, () => {
    console.log(`Escuchando en el puerto http://localhost:${PORT}`);
});
