const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  storage: 'db_ejercicio.db',
  dialect: 'sqlite',
  define: {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  },
});

const Alumno = sequelize.define('Alumno', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'El campo "nombre" no pude ser nulo' },
            notEmpty: { msg: 'El campo "nombre" no puede estar vacío' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'El campo "nombre" no pude ser nulo' },
            notEmpty: { msg: 'El campo "nombre" no puede estar vacío' },
            isEmail: { msg: 'No es un email valido' }
        },
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: 'El campo "nombre" no pude ser nulo' },
            notEmpty: { msg: 'El campo "nombre" no puede estar vacío' },
            isDate: { msg: 'No es una fecha valida' }
        }
    }
});

const Cursada = sequelize.define('Cursada', {
    materia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'El campo "materia" no pude ser nulo' },
            notEmpty: { msg: 'El campo "materia" no puede estar vacío' }
        }
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'El campo "anio" no pude ser nulo' },
            notEmpty: { msg: 'El campo "anio" no puede estar vacío' },            
            max: 2100,
            min: 1950
        },
    },
    cuatrimestre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'El campo "cuatrimestre" no pude ser nulo' },
            notEmpty: { msg: 'El campo "cuatrimestre" no puede estar vacío' },
            isIn: {
                args: [[1, 2]],
                msg: 'El campo "cuatrimestre" debe ser una de las siguientes opciones: 1 o 2'
              }
        }
    },
    aprobada: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        validate: {            
            notEmpty: { msg: 'El campo "aprobada" no puede estar vacío' },
            isIn: {
                args: [[0, 1, false, true]],
                msg: 'El campo "aprobada" debe ser una de las siguientes opciones: 1 / true (=verdadero) ó 0 / false (=falso)'
              }
        }
    }
});

Alumno.belongsToMany(Cursada, { through: 'alumnoCursada', as: 'cursadas' });
Cursada.belongsToMany(Alumno, { through: 'alumnoCursada', as: 'alumnos'});

app.use(bodyParser.json());

sequelize.sync()
  .then(() => {
    app.listen(port, () => {
        popular();
      console.log('El servidor está corriendo en el puerto ' + port);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

app.get('/alumnos', async (req, res) => {
    try {
        const data = await Alumno.findAll();
        res.json(data);
    } catch(err) {
        console.error('Error: ', err);
        res.status(500).json({ error: 'Error al ejecutar la consulta.' });
    }
});

app.get('/alumnos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const unAlumno = await Alumno.findByPk(id, {            
            include: [
                {
                  model: Cursada,
                  as: 'cursadas',
                  through: {
                    attributes: []
                  },
                  attributes: ['id', 'materia', 'aprobada']
                }
              ]
        });
        if(unAlumno === null) {
            return res.status(404).json({ error: `No se econtró el alumno con ID ${id}` });
        }
        res.json(unAlumno);
    } catch(err) {
        console.error('Error: ', err);
        res.status(500).json({ error: 'Error al ejecutar la consulta.' });
    }
});

app.post('/alumnos', async (req, res) => {
    try {
        const unAlumno = await Alumno.build(req.body);
        await unAlumno.validate();
        const unAlumnoValido = await Alumno.create(req.body);

        res.json({ id: unAlumnoValido.id });
    } catch(err) {
        console.error(err);
        res.status(409).json({ errores: err.errors.map((e) => e.message) });
    }
});

app.patch('/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    const unAlumno = req.body;

    try {
        const [, affectedRows] = await Alumno.update(
            unAlumno, 
            { where: { id }}
        );

        if(affectedRows === 0) {
            return res.status(404).json({ error: `No se encontró el músico con ID ${id}.` });
        }
        res.json({ id: id });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
    }
});

app.delete('/alumnos/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const unAlumno = await Alumno.findOne({ where: { id } });

      if(!unAlumno) {
        return res.status(404).json({ error: 'Alumno no encontrado' });
      }
      await unAlumno.destroy();
      res.json({ message: 'Borrado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// recibe un objeto "Cursada" sin el campo "aprobada" que va en null por defecto.
app.post('/alumnos/:id/cursada', async (req, res) => {
    const { id } = req.params;
    const cursadaData  = req.body;
    
    try {
        const unAlumno = await Alumno.findByPk(id);
        if(!unAlumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const cursada = await unAlumno.createCursada({
            ...cursadaData,
            aprobada: null
        });
        res.json({ id: cursada.id });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// recibe un objeto vacío y actualiza el campo "aprobada" a true de la cursada cuyo id se recibe `por url.
app.patch('/cursada/:id/aprobar', async (req, res) => {
    const { id } = req.params;

    try {
        const unaCursada = await Cursada.findByPk(id);
        if(!unaCursada) {
            return res.status(404).json({ error: 'Cursada no encontrada' });
        }

        await unaCursada.update({ aprobada: true });
        res.json({ id: id });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// recibe un objeto vacío y actualiza el campo "aprobada" a false de la cursada cuyo id se recibe `por url.
app.patch('/cursada/:id/reprobar', async (req, res) => {
    const { id } = req.params;

    try {
        const unaCursada = await Cursada.findByPk(id);
        if(!unaCursada) {
            return res.status(404).json({ error: 'Cursada no encontrada' });
        }

        await unaCursada.update({ aprobada: false });
        res.json({ id: id });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/cursada/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const unaCursada = await Cursada.findOne({ where: { id } });

      if(!unaCursada) {
        return res.status(404).json({ error: 'Cursada no encontrada' });
      }
      await unaCursada.destroy();
      res.json({ message: 'Borrado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

async function popular() {
    const cantAlumnos = await Alumno.count();
    const cantCursadas = await Cursada.count();

    if(cantAlumnos==0 && cantCursadas==0) {
        const alumnos = [
            { nombre: 'Jimi Hendrix', email: 'Jimi@gmail.com', fecha_nacimiento: Date.now() },
            { nombre: 'Diego Sanchez', email: 'Jimi@gmail.com', fecha_nacimiento: Date.now() },
            { nombre: 'Alejandra Espinola', email: 'Jimi@gmail.com', fecha_nacimiento: Date.now() },
            { nombre: 'Cinthia Amaya', email: 'Jimi@gmail.com', fecha_nacimiento: Date.now() }
        ];
    
        const cursadas = [
            { materia: 'Programacion 1', anio: 2024, cuatrimestre: 1, aprobada: true },
            { materia: 'Programacion WEB', anio: 2024, cuatrimestre: 1, aprobada: true },
            { materia: 'Programacion POO', anio: 2024, cuatrimestre: 1, aprobada: true },
            { materia: 'Programacion 2', anio: 2024, cuatrimestre: 1, aprobada: false },
        ];
        
        let alumnosObj = await Alumno.bulkCreate(alumnos, { validate: true });
        let cursadasObj = await Cursada.bulkCreate(cursadas, { validate: true });
        cursadasObj.forEach((c) => {
            c.addAlumnos(alumnosObj);
        });
    }
}
