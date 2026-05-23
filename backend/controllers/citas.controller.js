const db = require('../db/conexion');

const estadosPermitidos = ['pendiente', 'atendida', 'cancelada'];

const validarCita = ({ fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario }) => {
  if (!fecha || !hora || !motivo || !estado || !id_cliente || !id_mascota || !id_veterinario) {
    return 'Todos los campos son obligatorios';
  }
  if (!estadosPermitidos.includes(estado)) {
    return 'El estado debe ser pendiente, atendida o cancelada';
  }
  return null;
};

exports.listarCitas = async (req, res, next) => {
  try {
    const [citas] = await db.query(`
      SELECT ci.*, c.nombre AS nombre_cliente, m.nombre AS nombre_mascota, v.nombre AS nombre_veterinario
      FROM citas ci
      INNER JOIN clientes c ON ci.id_cliente = c.id_cliente
      INNER JOIN mascotas m ON ci.id_mascota = m.id_mascota
      INNER JOIN veterinarios v ON ci.id_veterinario = v.id_veterinario
      ORDER BY ci.fecha DESC, ci.hora DESC
    `);
    res.json(citas);
  } catch (error) {
    next(error);
  }
};

exports.obtenerCitaPorId = async (req, res, next) => {
  try {
    const [citas] = await db.query(`
      SELECT ci.*, c.nombre AS nombre_cliente, m.nombre AS nombre_mascota, v.nombre AS nombre_veterinario
      FROM citas ci
      INNER JOIN clientes c ON ci.id_cliente = c.id_cliente
      INNER JOIN mascotas m ON ci.id_mascota = m.id_mascota
      INNER JOIN veterinarios v ON ci.id_veterinario = v.id_veterinario
      WHERE ci.id_cita = ?
    `, [req.params.id]);

    if (citas.length === 0) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
    res.json(citas[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearCita = async (req, res, next) => {
  try {
    const errorValidacion = validarCita(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario } = req.body;
    const [resultado] = await db.query(
      `INSERT INTO citas (fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario]
    );

    res.status(201).json({
      mensaje: 'Cita agendada correctamente',
      id_cita: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'Cliente, mascota o veterinario no existe' });
    }
    next(error);
  }
};

exports.actualizarCita = async (req, res, next) => {
  try {
    const errorValidacion = validarCita(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario } = req.body;
    const [resultado] = await db.query(
      `UPDATE citas
       SET fecha = ?, hora = ?, motivo = ?, estado = ?, id_cliente = ?, id_mascota = ?, id_veterinario = ?
       WHERE id_cita = ?`,
      [fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
    res.json({ mensaje: 'Cita actualizada correctamente' });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'Cliente, mascota o veterinario no existe' });
    }
    next(error);
  }
};

exports.eliminarCita = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM citas WHERE id_cita = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
    res.json({ mensaje: 'Cita eliminada o cancelada correctamente' });
  } catch (error) {
    next(error);
  }
};
