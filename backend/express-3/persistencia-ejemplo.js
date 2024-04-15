const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'uces',
  password: 'uces',
  database: 'uces',
});

const validacion = (req, res, next) => {
  const { nombre, en_actividad, instrumento } = req.body

  if(!nombre || nombre == '') {
    res.status(409).send('Debe incluirse un nombre')
    return;
  }
  if(!instrumento || instrumento == '') {
    res.status(409).send('Debe incluirse un instrumento')
    return;
  }

  const actividades = [0, 1, true, false];
  if(actividades.indexOf(en_actividad) == -1) {
    res.status(409).send('Debe incluirse un valor valido en en_actividad')
    return;
  }
  next();
}

connection.connect((error) => {
  if (error) {
    console.error(`Error de conexión: ${error.stack}`);
    return;
  }
  console.log('Conexión exitosa a la base de datos!');
});


app.get('/musicos', (req, res) => {
  connection.query('SELECT * FROM musicos', (err, rows, fields) => {
    if (err) throw err
    res.json(rows);
  })
});

app.get('/musicos/:id', (req, res) => {
  const { id } = req.params;

  connection.query('SELECT * FROM musicos WHERE id=' + id, (err, rows, fields) => {
    if (err) throw err;
    if (rows.length == 0) {
      res.status(404).send('No encotrado');
      return;
    } else {
      res.json(rows[0]);
    }
  })
});

app.post('/musicos', validacion, (req, res) => {
  const { nombre, en_actividad, instrumento } = req.body;

  connection.query(`INSERT INTO musicos (nombre, en_actividad, instrumento) VALUES (?, ?, ?)`, [nombre, en_actividad, instrumento], (err, rows, fields) => {
    if (err) {
      res.sendStatus(500).send(err);
      return;
    }
    res.json({
      id: rows.insertId
    })
  })
});

app.patch('/musicos/:id', validacion, (req, res) => {
  const { id } = req.params;
  const { nombre, en_actividad, instrumento } = req.body;

  connection.query(`UPDATE musicos SET nombre=?, en_actividad=?, instrumento=? WHERE id=?`, [nombre, en_actividad, instrumento, id], (err, rows, fields) => {
    if (err) {
      res.sendStatus(500).send(err);
    }
    if (rows.affectedRows == 0) {
      res.sendStatus(404);
    }
    res.json({
      id: id
    })
  })
});

app.delete('/musicos/:id', (req, res) => {
  const { id } = req.params;

  connection.query(`DELETE FROM musicos WHERE id=${id}`, (err, rows, fields) => {
    if (err) throw err
    
    if (rows.affectedRows == 0) {
      res.sendStatus(404);
    } else {
      res.json('ok')
    }
  })
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
