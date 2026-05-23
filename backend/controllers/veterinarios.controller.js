const db = require('../db/conexion');

const validarVeterinario = ({ nombre, especialidad, telefono, email }) => {
  if (!nombre || !especialidad || !telefono || !email) {
    return 'Todos los campos son obligatorios';
  }
  if (!email.includes('@')) {
    return 'El email debe tener un formato valido';
  }
  return null;
};

exports.listarVeterinarios = async (req, res, next) => {
  try {
    const [veterinarios] = await db.query('SELECT * FROM veterinarios ORDER BY id_veterinario DESC');
    res.json(veterinarios);
  } catch (error) {
    next(error);
  }
};

exports.obtenerVeterinarioPorId = async (req, res, next) => {
  try {
    const [veterinarios] = await db.query('SELECT * FROM veterinarios WHERE id_veterinario = ?', [req.params.id]);
    if (veterinarios.length === 0) {
      return res.status(404).json({ mensaje: 'Veterinario no encontrado' });
    }
    res.json(veterinarios[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearVeterinario = async (req, res, next) => {
  try {
    const errorValidacion = validarVeterinario(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, especialidad, telefono, email } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO veterinarios (nombre, especialidad, telefono, email) VALUES (?, ?, ?, ?)',
      [nombre, especialidad, telefono, email]
    );

    res.status(201).json({
      mensaje: 'Veterinario registrado correctamente',
      id_veterinario: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarVeterinario = async (req, res, next) => {
  try {
    const errorValidacion = validarVeterinario(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, especialidad, telefono, email } = req.body;
    const [resultado] = await db.query(
      'UPDATE veterinarios SET nombre = ?, especialidad = ?, telefono = ?, email = ? WHERE id_veterinario = ?',
      [nombre, especialidad, telefono, email, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Veterinario no encontrado' });
    }
    res.json({ mensaje: 'Veterinario actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.eliminarVeterinario = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM veterinarios WHERE id_veterinario = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Veterinario no encontrado' });
    }
    res.json({ mensaje: 'Veterinario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
