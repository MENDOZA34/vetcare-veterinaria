const db = require('../db/conexion');

const validarTratamiento = ({ nombre, descripcion, costo, id_mascota }) => {
  if (!nombre || !descripcion || costo === undefined || !id_mascota) {
    return 'Todos los campos son obligatorios';
  }
  if (Number(costo) < 0) {
    return 'El costo no puede ser negativo';
  }
  return null;
};

exports.listarTratamientos = async (req, res, next) => {
  try {
    const [tratamientos] = await db.query(`
      SELECT t.*, m.nombre AS nombre_mascota
      FROM tratamientos t
      INNER JOIN mascotas m ON t.id_mascota = m.id_mascota
      ORDER BY t.id_tratamiento DESC
    `);
    res.json(tratamientos);
  } catch (error) {
    next(error);
  }
};

exports.obtenerTratamientoPorId = async (req, res, next) => {
  try {
    const [tratamientos] = await db.query(`
      SELECT t.*, m.nombre AS nombre_mascota
      FROM tratamientos t
      INNER JOIN mascotas m ON t.id_mascota = m.id_mascota
      WHERE t.id_tratamiento = ?
    `, [req.params.id]);

    if (tratamientos.length === 0) {
      return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });
    }
    res.json(tratamientos[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearTratamiento = async (req, res, next) => {
  try {
    const errorValidacion = validarTratamiento(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, descripcion, costo, id_mascota } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO tratamientos (nombre, descripcion, costo, id_mascota) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, costo, id_mascota]
    );

    res.status(201).json({
      mensaje: 'Tratamiento registrado correctamente',
      id_tratamiento: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'La mascota indicada no existe' });
    }
    next(error);
  }
};

exports.actualizarTratamiento = async (req, res, next) => {
  try {
    const errorValidacion = validarTratamiento(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, descripcion, costo, id_mascota } = req.body;
    const [resultado] = await db.query(
      'UPDATE tratamientos SET nombre = ?, descripcion = ?, costo = ?, id_mascota = ? WHERE id_tratamiento = ?',
      [nombre, descripcion, costo, id_mascota, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });
    }
    res.json({ mensaje: 'Tratamiento actualizado correctamente' });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'La mascota indicada no existe' });
    }
    next(error);
  }
};

exports.eliminarTratamiento = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM tratamientos WHERE id_tratamiento = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });
    }
    res.json({ mensaje: 'Tratamiento eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
