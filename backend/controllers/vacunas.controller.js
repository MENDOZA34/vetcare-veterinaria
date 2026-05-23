const db = require('../db/conexion');

const estadosPermitidos = ['Disponible', 'Inactiva'];

const validarVacuna = ({ nombre, precio, estado = 'Disponible' }) => {
  if (!nombre || precio === undefined) {
    return 'Nombre y precio son obligatorios';
  }
  if (!estadosPermitidos.includes(estado)) {
    return 'Estado no permitido';
  }
  if (Number(precio) < 0) {
    return 'El precio no puede ser negativo';
  }
  return null;
};

exports.listarVacunas = async (req, res, next) => {
  try {
    const [vacunas] = await db.query('SELECT * FROM vacunas ORDER BY id_vacuna DESC');
    res.json(vacunas);
  } catch (error) {
    next(error);
  }
};

exports.obtenerVacunaPorId = async (req, res, next) => {
  try {
    const [vacunas] = await db.query('SELECT * FROM vacunas WHERE id_vacuna = ?', [req.params.id]);
    if (vacunas.length === 0) {
      return res.status(404).json({ mensaje: 'Vacuna no encontrada' });
    }
    res.json(vacunas[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearVacuna = async (req, res, next) => {
  try {
    const errorValidacion = validarVacuna(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const {
      nombre,
      descripcion = '',
      dosis = '',
      frecuencia = '',
      precio,
      estado = 'Disponible'
    } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO vacunas (nombre, descripcion, dosis, frecuencia, precio, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, dosis, frecuencia, precio, estado]
    );

    res.status(201).json({
      mensaje: 'Vacuna registrada correctamente',
      id_vacuna: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarVacuna = async (req, res, next) => {
  try {
    const errorValidacion = validarVacuna(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const {
      nombre,
      descripcion = '',
      dosis = '',
      frecuencia = '',
      precio,
      estado = 'Disponible'
    } = req.body;

    const [resultado] = await db.query(
      `UPDATE vacunas
       SET nombre = ?, descripcion = ?, dosis = ?, frecuencia = ?, precio = ?, estado = ?
       WHERE id_vacuna = ?`,
      [nombre, descripcion, dosis, frecuencia, precio, estado, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Vacuna no encontrada' });
    }

    res.json({ mensaje: 'Vacuna actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.eliminarVacuna = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM vacunas WHERE id_vacuna = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Vacuna no encontrada' });
    }
    res.json({ mensaje: 'Vacuna eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
