const db = require('../db/conexion');

const obtenerClientePorUsuario = async (idUsuario) => {
  const [clientes] = await db.query(
    `SELECT c.*, u.nombre AS nombre_usuario, u.email AS email_usuario, u.rol
     FROM clientes c
     INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
     WHERE c.id_usuario = ?`,
    [idUsuario]
  );
  return clientes[0];
};

const validarMascota = ({ nombre, especie, raza, edad, sexo }) => {
  if (!nombre || !especie || !raza || edad === undefined || !sexo) {
    return 'Todos los campos de la mascota son obligatorios';
  }
  if (Number(edad) < 0) {
    return 'La edad no puede ser negativa';
  }
  return null;
};

exports.perfil = async (req, res, next) => {
  try {
    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    res.json({
      id_cliente: cliente.id_cliente,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      usuario: {
        id_usuario: req.usuario.id_usuario,
        nombre: cliente.nombre_usuario,
        email: cliente.email_usuario,
        rol: cliente.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.misMascotas = async (req, res, next) => {
  try {
    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const [mascotas] = await db.query(
      'SELECT * FROM mascotas WHERE id_cliente = ? ORDER BY id_mascota DESC',
      [cliente.id_cliente]
    );
    res.json(mascotas);
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

    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const { nombre, especie, raza, edad, sexo } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO mascotas (nombre, especie, raza, edad, sexo, id_cliente) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, especie, raza, edad, sexo, cliente.id_cliente]
    );

    res.status(201).json({
      mensaje: 'Mascota registrada correctamente',
      id_mascota: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarMascota = async (req, res, next) => {
  try {
    const errorValidacion = validarMascota(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const { nombre, especie, raza, edad, sexo } = req.body;
    const [resultado] = await db.query(
      `UPDATE mascotas
       SET nombre = ?, especie = ?, raza = ?, edad = ?, sexo = ?
       WHERE id_mascota = ? AND id_cliente = ?`,
      [nombre, especie, raza, edad, sexo, req.params.id, cliente.id_cliente]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada para este cliente' });
    }

    res.json({ mensaje: 'Mascota actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.misCitas = async (req, res, next) => {
  try {
    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const [citas] = await db.query(
      `SELECT ci.*, m.nombre AS nombre_mascota, v.nombre AS nombre_veterinario
       FROM citas ci
       INNER JOIN mascotas m ON ci.id_mascota = m.id_mascota
       INNER JOIN veterinarios v ON ci.id_veterinario = v.id_veterinario
       WHERE ci.id_cliente = ?
       ORDER BY ci.fecha DESC, ci.hora DESC`,
      [cliente.id_cliente]
    );
    res.json(citas);
  } catch (error) {
    next(error);
  }
};

exports.misTratamientos = async (req, res, next) => {
  try {
    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const [tratamientos] = await db.query(
      `SELECT t.id_tratamiento, t.nombre, t.descripcion, t.costo, t.id_mascota,
              m.nombre AS nombre_mascota, NULL AS fecha
       FROM tratamientos t
       INNER JOIN mascotas m ON t.id_mascota = m.id_mascota
       WHERE m.id_cliente = ?
       ORDER BY t.id_tratamiento DESC`,
      [cliente.id_cliente]
    );

    res.json(tratamientos);
  } catch (error) {
    next(error);
  }
};

exports.crearCita = async (req, res, next) => {
  try {
    const { fecha, hora, motivo, id_mascota, id_veterinario } = req.body;
    if (!fecha || !hora || !motivo || !id_mascota || !id_veterinario) {
      return res.status(400).json({ mensaje: 'Fecha, hora, motivo, mascota y veterinario son obligatorios' });
    }

    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const [mascotas] = await db.query(
      'SELECT id_mascota FROM mascotas WHERE id_mascota = ? AND id_cliente = ?',
      [id_mascota, cliente.id_cliente]
    );
    if (mascotas.length === 0) {
      return res.status(403).json({ mensaje: 'No tienes permiso para agendar citas de esta mascota' });
    }

    const [resultado] = await db.query(
      `INSERT INTO citas (fecha, hora, motivo, estado, id_cliente, id_mascota, id_veterinario)
       VALUES (?, ?, ?, 'pendiente', ?, ?, ?)`,
      [fecha, hora, motivo, cliente.id_cliente, id_mascota, id_veterinario]
    );

    res.status(201).json({
      mensaje: 'Cita solicitada correctamente',
      id_cita: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'Mascota o veterinario no existe' });
    }
    next(error);
  }
};

exports.cancelarCita = async (req, res, next) => {
  try {
    const cliente = await obtenerClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });
    }

    const [resultado] = await db.query(
      `UPDATE citas
       SET estado = 'cancelada'
       WHERE id_cita = ? AND id_cliente = ? AND estado = 'pendiente'`,
      [req.params.id, cliente.id_cliente]
    );

    if (resultado.affectedRows === 0) {
      return res.status(400).json({ mensaje: 'Solo puedes cancelar citas pendientes propias' });
    }

    res.json({ mensaje: 'Cita cancelada correctamente' });
  } catch (error) {
    next(error);
  }
};
