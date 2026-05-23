const db = require('../db/conexion');

const validarMascota = ({ nombre, especie, raza, edad, sexo, id_cliente }) => {
  if (!nombre || !especie || !raza || edad === undefined || !sexo || !id_cliente) {
    return 'Todos los campos son obligatorios';
  }
  if (Number(edad) < 0) {
    return 'La edad no puede ser negativa';
  }
  return null;
};

exports.listarMascotas = async (req, res, next) => {
  try {
    const [mascotas] = await db.query(`
      SELECT m.*, c.nombre AS nombre_cliente
      FROM mascotas m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      ORDER BY m.id_mascota DESC
    `);
    res.json(mascotas);
  } catch (error) {
    next(error);
  }
};

exports.obtenerMascotaPorId = async (req, res, next) => {
  try {
    const [mascotas] = await db.query(`
      SELECT m.*, c.nombre AS nombre_cliente
      FROM mascotas m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      WHERE m.id_mascota = ?
    `, [req.params.id]);

    if (mascotas.length === 0) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }
    res.json(mascotas[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearMascota = async (req, res, next) => {
  try {
    const errorValidacion = validarMascota(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, especie, raza, edad, sexo, id_cliente } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO mascotas (nombre, especie, raza, edad, sexo, id_cliente) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, especie, raza, edad, sexo, id_cliente]
    );

    res.status(201).json({
      mensaje: 'Mascota registrada correctamente',
      id_mascota: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'El cliente indicado no existe' });
    }
    next(error);
  }
};

exports.actualizarMascota = async (req, res, next) => {
  try {
    const errorValidacion = validarMascota(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, especie, raza, edad, sexo, id_cliente } = req.body;
    const [resultado] = await db.query(
      'UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, sexo = ?, id_cliente = ? WHERE id_mascota = ?',
      [nombre, especie, raza, edad, sexo, id_cliente, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }
    res.json({ mensaje: 'Mascota actualizada correctamente' });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'El cliente indicado no existe' });
    }
    next(error);
  }
};

exports.eliminarMascota = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM mascotas WHERE id_mascota = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }
    res.json({ mensaje: 'Mascota eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
