// En archivo access.log
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/', (req, res) => {
    res.send('Ruta no protegida');
  });
  

app.listen(port, () => {
    console.log('Servidor iniciado en el puerto 3000');
  });