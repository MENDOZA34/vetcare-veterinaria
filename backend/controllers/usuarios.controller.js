const bcrypt = require('bcryptjs');
const db = require('../db/conexion');

const rolesInternos = ['administrador', 'recepcionista', 'veterinario'];
const rolesPermitidos = [...rolesInternos, 'cliente'];

const validarUsuario = ({ nombre, email, password, rol }, rolesValidos, requierePassword = true) => {
  if (!nombre || !email || !rol || (requierePassword && !password)) {
    return 'Nombre, email, password y rol son obligatorios';
  }

  if (!email.includes('@')) {
    return 'El email debe tener un formato valido';
  }

  if (!rolesValidos.includes(rol)) {
    return 'Rol no permitido';
  }

  if (password && password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  return null;
};

const usuarioPublico = (usuario) => ({
  id_usuario: usuario.id_usuario,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  estado: Boolean(usuario.estado),
  creado_en: usuario.creado_en
});

exports.listarUsuarios = async (req, res, next) => {
  try {
    const [usuarios] = await db.query(`
      SELECT id_usuario, nombre, email, rol, estado, creado_en
      FROM usuarios
      ORDER BY id_usuario DESC
    `);
    res.json(usuarios.map(usuarioPublico));
  } catch (error) {
    next(error);
  }
};

exports.crearUsuarioInterno = async (req, res, next) => {
  try {
    const errorValidacion = validarUsuario(req.body, rolesInternos);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, email, password, rol } = req.body;
    const [existentes] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ mensaje: 'El correo ya esta registrado' });
    }

    const passwordCifrada = await bcrypt.hash(password, 10);
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES (?, ?, ?, ?, TRUE)',
      [nombre, email, passwordCifrada, rol]
    );

    res.status(201).json({
      mensaje: 'Usuario interno creado correctamente',
      usuario: {
        id_usuario: resultado.insertId,
        nombre,
        email,
        rol,
        estado: true
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol, estado = true } = req.body;
    const errorValidacion = validarUsuario({ nombre, email, password, rol }, rolesPermitidos, false);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no permitido' });
    }

    const valores = [nombre, email, rol, Boolean(estado), req.params.id];
    let consulta = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, estado = ? WHERE id_usuario = ?';

    if (password) {
      const passwordCifrada = await bcrypt.hash(password, 10);
      consulta = 'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ?, estado = ? WHERE id_usuario = ?';
      valores.splice(2, 0, passwordCifrada);
    }

    const [resultado] = await db.query(consulta, valores);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'El correo ya esta registrado' });
    }
    next(error);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const idUsuarioEliminar = Number(req.params.id);

    if (Number(req.usuario.id_usuario) === idUsuarioEliminar) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta mientras tienes sesión activa.' });
    }

    const [usuarios] = await db.query('SELECT id_usuario, rol, estado FROM usuarios WHERE id_usuario = ?', [idUsuarioEliminar]);
    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuarioEliminar = usuarios[0];
    if (usuarioEliminar.rol === 'administrador' && usuarioEliminar.estado) {
      const [administradores] = await db.query(
        'SELECT COUNT(*) AS total FROM usuarios WHERE rol = "administrador" AND estado = TRUE'
      );

      if (administradores[0].total <= 1) {
        return res.status(400).json({ mensaje: 'No se puede eliminar el único administrador activo del sistema.' });
      }
    }

    const [resultado] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
