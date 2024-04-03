const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());
let usuarios = [ {usuario: 'pepe', clave: 'abc123'} ];
let tokens = [];

// Middleware de autenticación que verifica si el usuario tiene un token de autorización
const requireLogin = (req, res, next) => {
  if (req.headers.authorization && tokens.indexOf(req.headers.authorization)>=0) {
    next();
  } else {
    return res.status(401).json({ error: 'No autorizado!' });
  }
};

// Ruta sin autenticación
app.get('/', (req, res) => {
  res.send('Ruta no protegida');
});

// Ruta de ejemplo protegida por el middleware de autenticación
app.get('/privado', requireLogin, (req, res) => {
  res.send('Bienvenido usuario autenticado');
});
  
app.post('/login', (req, res) => {
  const credenciales = req.body;
  if (usuarios.find(cred => cred.usuario==credenciales.usuario && cred.clave==credenciales.clave)) {
    let token = generarToken();
    res.status(201).json({token: token});
  } else {
    return res.status(401).json({ error: 'No autorizado!' });
  }
});

// Generación de token de autenticación
const generarToken = () => {
  let token = Math.floor(Math.random() * 1000 * Date.now()).toString(36); // string aleatorio
  tokens.push(token);
  return token;
}
  
// Iniciar el servidor
app.listen(port, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
  