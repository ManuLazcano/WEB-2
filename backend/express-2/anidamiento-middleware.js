const express = require('express');
const port = 3000;
const app = express();

// Middleware para verificar la autenticación
const autenticacionMdlwr = (req, res, next) => {
  const estaAutenticado = true; // Llamar a la función correspondiente
  if (estaAutenticado) {
    console.log('Usuario autenticado');
    next();
  } else {
    res.status(401).send('No autorizado');
  }
};

// Middleware para verificar los permisos
const permisosMdlwr = (req, res, next) => {
  const hasPermissions = true; // Llamar a la función correspondiente
  if (hasPermissions) {
    console.log('Usuario con permisos');
    next();
  } else {
    res.status(403).send('No tiene los permisos necesarios');
  }
};

app.get('/ruta-protegida',
    autenticacionMdlwr,
    permisosMdlwr,
    (req, res) => {
    console.log('Procesando datos');
    res.send('Datos procesados correctamente');
});


app.listen(port, () => {
console.log('Servidor iniciado en el puerto 3000');
});