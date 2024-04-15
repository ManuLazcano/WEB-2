// * Se podría realizar una versión con 'execute' en vez de 'query' para poder usar promesas y así simplificar el código
// * Hay código repetido
const express = require('express');
const mysql = require('mysql');

const PORT = 3000;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Datos
let idCurrentUser;
let isAdmin;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'uces',
    password: 'uces',
    database: 'express-3',
});

connection.connect((error) => {
    if(error) {
        console.error(`Error de conexión: ${error.stack}`);
        return;
    }
    limpiarTokensExpirados();
    console.log('Conexión exitosa a la base de datos!');
});


// Funciones de ayuda

const requireLogin = (req, res, next) => {
    const token = req.headers.authorization;

    // Verifica si el token existe y es válido en la base de datos
    connection.query('SELECT * FROM tokens WHERE token = ? AND expires > NOW()', [token], (err, result) => {
        if (err) {
            console.error('Error al verificar token:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (result.length > 0) {
            next(); // Token válido, permite continuar
        } else {
            return res.status(401).json({ error: 'No autorizado!' });
        }
    });
};


const generarToken = () => {
    const token = Math.floor(Math.random() * 1000 * Date.now()).toString(36); // string aleatorio
    const expires = new Date(Date.now() + (60 * 60 * 1000)); // Token válido por una hora (en milisegundos)

    connection.query('INSERT INTO tokens (token, expires) VALUES (?, ?)', [token, expires], (err, result) => {
        if (err) {
            console.error('Error al generar token:', err);
            return null;
        }
    });

    return token;
}

const limpiarTokensExpirados = () => {
    connection.query('DELETE FROM tokens WHERE expires < NOW()', (err, result) => {
        if (err) {
            console.error('Error al limpiar tokens expirados:', err);            
        }
    });
}

// Llamar a la función limpiarTokensExpirados cada hora (3600000 milisegundos)
setInterval(limpiarTokensExpirados, 3600000);

// API REST
app.post('/login', (req, res) => {
    const credentials = req.body;

    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [credentials.email, credentials.password], (err, rows) => {
        if(err) {
            console.error('Error: ', err);
            return res.sendStatus(500);
        }

        if(rows.length > 0) {
            const token = generarToken();
            res.status(201).json({ token: token });
            idCurrentUser = rows[0].id;
            isAdmin = rows[0].admin;
        } else {
            return res.status(401).json({ error: 'No autorizado!' });
        }
    });
});

app.get('/eventos', requireLogin, (req, res) => {
    connection.query('SELECT * FROM events', (err, rows) => {
        if(err) {
            throw err;
        }
        res.json(rows);
    });
});

app.get('/eventos/:id', requireLogin, (req, res) => {
    const { id } = req.params;

    connection.query('SELECT * FROM events WHERE id = ?', [id], (err, rows) => {
        if(err) {
            throw err;
        }
        if(rows.length == 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.json(rows[0]);
    });    
});

app.post('/eventos', requireLogin, (req, res) => {
    const { id_user, datetime, title, description, guests } = req.body;
    
    if (!id_user || !datetime || !title || !description || !guests) {
        return res.status(400).json({ error: 'Faltan datos del evento' });
    }

    const date = new Date(datetime);

    connection.query('INSERT INTO events (id_user, datetime, title, description) VALUES(?, ?, ?, ?)', [id_user, date, title, description],
        (err, rows) => {
            if(err) {
                console.error('Error al insertar evento: ', err);
                return res.sendStatus(500).send(err);
            }

            const eventId = rows.insertId;
            guests.forEach(guestId => {
                connection.query('INSERT INTO guests (event_id, user_id) VALUES (?, ?)', [eventId, guestId],
                (err, rows) => {
                    if(err) {                        
                        console.error('Error al insertar invitado: ', err);
                    }
                });
            });

            res.json({ id: rows.insertId});
        });
});

app.patch('/eventos/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { id_user, datetime, title, description, guests } = req.body;

    if (!id_user || !datetime || !title || !description || !guests) {
        return res.status(400).json({ error: 'Faltan datos del evento' });
    }

    connection.query('SELECT * FROM events WHERE id = ?', [id], (err, eventRow) => {
        if (err) {
            console.error('Error: ', err);
            return res.sendStatus(500);
        }
        if (eventRow.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        
        if(id_user !== idCurrentUser) { 
            if(!isAdmin) {                     
                return res.status(403).send('El usuario no es el dueño del evento');
            }
        }

        connection.query('DELETE FROM guests WHERE event_id = ?', [id], (err, rows) => {
            if (err) {
                console.error('Error: ', err);
                return res.sendStatus(500);
            }

            const date = new Date(datetime);
            connection.query('UPDATE events SET datetime = ?, title = ?, description = ? WHERE id = ?', [date, title, description, id], (err, rows) => {
                if (err) {
                    console.error('Error: ', err);
                    return res.sendStatus(500);
                }

                guests.forEach(idGuest => {
                    connection.query('INSERT INTO guests (event_id, user_id) VALUES(?, ?)', [id, idGuest], (err, insertRows) => {
                        if (err) {
                            console.error('Error: ', err);
                            return res.sendStatus(500);
                        }
                    });
                });

                res.json({ id: id });
            });
        });
    });
});

app.delete('/eventos/:id', requireLogin, (req, res) => {
    const { id } = req.params;

    connection.query('SELECT * FROM events WHERE id = ?', [id], (err, eventRow) => {
        if(err) {
            console.error('Error: ', err);
            return res.sendStatus(500);
        }
        if(eventRow.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
       
        if(eventRow[0].id_user !== idCurrentUser) {
            if(!isAdmin) {                     
                return res.status(403).send('El usuario no es el dueño del evento');
            }
        }
        
        connection.query('DELETE FROM guests WHERE event_id = ?', [id], (err, rows) => {
            if (err) {
                console.error('Error: ', err);
                return res.sendStatus(500);
            }

            connection.query('DELETE FROM events WHERE id = ?', [id], (err, rows) => {
                if (err) {
                    console.error('Error: ', err);
                    return res.sendStatus(500);
                }
                if(rows.affectedRows === 0) {
                    return res.sendStatus(500);
                }
                res.json({ id: id });
            });
        });
    });        
});

app.post('/eventos/:id/invitado/:idUsuario', requireLogin, (req, res) => {
    const { id, idUsuario } = req.params;

    connection.query('SELECT * FROM events WHERE id = ?', [id], (err, eventRow) => {
        if(err) {
            console.error('Error: ', err);
            return res.sendStatus(500);
        }
        if(eventRow.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        connection.query('SELECT * FROM users WHERE id = ?', [idUsuario], (err, rows) => {
            if(err) {
                console.error('Error: ', err);
                return res.sendStatus(500);
            }
            if(rows.length === 0) {
                return res.status(404).json({ message: 'Invitado no encontrado' });
            }
            
            if(eventRow[0].id_user !== idCurrentUser) {
                if(!isAdmin) {                     
                    return res.status(403).send('El usuario no es el dueño del evento');
                }
            }

            connection.query('SELECT * FROM guests WHERE event_id = ? AND user_id = ?', [id, idUsuario], (err, rows) => {
                if(err) {
                    console.error('Error: ', err);
                    return res.sendStatus(500);
                }
                if(rows.length !== 0) {
                    return res.status(400).json({ message: 'El usuario ya es un invitado en este evento'});
                } else {
                    connection.query('INSERT INTO guests (event_id, user_id) VALUES (?, ?)', [id, idUsuario], (err, rows) => {
                        if(err) {
                            console.error('Error: ', err);
                            return res.sendStatus(500);
                        }
                        return res.json({id: id}) 
                    });
                }
            });
        });
    });
});

app.delete('/eventos/:id/invitado/:idUsuario', requireLogin, (req, res) => {
    const { id, idUsuario } = req.params; 

    connection.query('SELECT * FROM events WHERE id = ?', [id], (err, eventRow) => {
        if(err) {
            console.error('Error: ', err);
            return res.sendStatus(500);
        }
        if(eventRow.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        connection.query('SELECT * FROM users WHERE id = ?', [idUsuario], (err, rows) => {
            if(err) {
                console.error('Error: ', err);
                return res.sendStatus(500);
            }
            if(rows.length === 0) {
                return res.status(404).json({ message: 'Invitado no encontrado' });
            }
            
            if(eventRow[0].id_user !== idCurrentUser) {
                if(!isAdmin) {                     
                    return res.status(403).send('El usuario no es el dueño del evento');
                }
            }

            connection.query('SELECT * FROM guests WHERE event_id = ? AND user_id = ?', [id, idUsuario], (err, rows) => {
                if(err) {
                    console.error('Error: ', err);
                    return res.sendStatus(500);
                }
                if(rows.length === 0) {
                    return res.status(404).json({ message: 'El usuario no es un invitado'});
                } else {
                    connection.query('DELETE FROM guests WHERE event_id = ? AND user_id = ?', [id, idUsuario], (err, rows) => {
                        if(err) {
                            console.error('Error: ', err);
                            return res.sendStatus(500);
                        }
                        res.json({ message: 'Eliminado con éxito' });
                    });
                }
            });
        });
    }); 
});

app.listen(PORT, () => {
    console.log(`Escuchando en el puerto http://localhost:${PORT}`);
});