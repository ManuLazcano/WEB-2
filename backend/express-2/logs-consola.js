// Por consola
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.send('Ruta no protegida');
  });
  

app.listen(port, () => {
    console.log('Servidor iniciado en el puerto 3000');
  });