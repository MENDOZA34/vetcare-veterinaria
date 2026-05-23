const db = require('../db/conexion');

const validarHistorial = ({ fecha, diagnostico, observaciones, id_mascota, id_veterinario }) => {
  if (!fecha || !diagnostico || !observaciones || !id_mascota || !id_veterinario) {
    return 'Todos los campos son obligatorios';
  }
  return null;
};

exports.listarHistoriales = async (req, res, next) => {
  try {
    const [historiales] = await db.query(`
      SELECT h.*, m.nombre AS nombre_mascota, v.nombre AS nombre_veterinario
      FROM historial_medico h
      INNER JOIN mascotas m ON h.id_mascota = m.id_mascota
      INNER JOIN veterinarios v ON h.id_veterinario = v.id_veterinario
      ORDER BY h.fecha DESC
    `);
    res.json(historiales);
  } catch (error) {
    next(error);
  }
};

exports.obtenerHistorialPorId = async (req, res, next) => {
  try {
    const [historiales] = await db.query(`
      SELECT h.*, m.nombre AS nombre_mascota, v.nombre AS nombre_veterinario
      FROM historial_medico h
      INNER JOIN mascotas m ON h.id_mascota = m.id_mascota
      INNER JOIN veterinarios v ON h.id_veterinario = v.id_veterinario
      WHERE h.id_historial = ?
    `, [req.params.id]);

    if (historiales.length === 0) {
      return res.status(404).json({ mensaje: 'Historial medico no encontrado' });
    }
    res.json(historiales[0]);
  } catch (error) {
    next(error);
  }
};

exports.obtenerHistorialPorMascota = async (req, res, next) => {
  try {
    const [historiales] = await db.query(`
      SELECT h.*, m.nombre AS nombre_mascota, v.nombre AS nombre_veterinario
      FROM historial_medico h
      INNER JOIN mascotas m ON h.id_mascota = m.id_mascota
      INNER JOIN veterinarios v ON h.id_veterinario = v.id_veterinario
      WHERE h.id_mascota = ?
      ORDER BY h.fecha DESC
    `, [req.params.id_mascota]);

    res.json(historiales);
  } catch (error) {
    next(error);
  }
};

exports.crearHistorial = async (req, res, next) => {
  try {
    const errorValidacion = validarHistorial(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { fecha, diagnostico, observaciones, id_mascota, id_veterinario } = req.body;
    const [resultado] = await db.query(
      `INSERT INTO historial_medico (fecha, diagnostico, observaciones, id_mascota, id_veterinario)
       VALUES (?, ?, ?, ?, ?)`,
      [fecha, diagnostico, observaciones, id_mascota, id_veterinario]
    );

    res.status(201).json({
      mensaje: 'Historial medico registrado correctamente',
      id_historial: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'Mascota o veterinario no existe' });
    }
    next(error);
  }
};

exports.actualizarHistorial = async (req, res, next) => {
  try {
    const errorValidacion = validarHistorial(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { fecha, diagnostico, observaciones, id_mascota, id_veterinario } = req.body;
    const [resultado] = await db.query(
      `UPDATE historial_medico
       SET fecha = ?, diagnostico = ?, observaciones = ?, id_mascota = ?, id_veterinario = ?
       WHERE id_historial = ?`,
      [fecha, diagnostico, observaciones, id_mascota, id_veterinario, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Historial medico no encontrado' });
    }
    res.json({ mensaje: 'Historial medico actualizado correctamente' });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'Mascota o veterinario no existe' });
    }
    next(error);
  }
};

exports.eliminarHistorial = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM historial_medico WHERE id_historial = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Historial medico no encontrado' });
    }
    res.json({ mensaje: 'Historial medico eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
