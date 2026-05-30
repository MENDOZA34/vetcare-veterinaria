const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/conexion');

const crearToken = (usuario) => {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

const datosPublicosUsuario = (usuario) => ({
  id_usuario: usuario.id_usuario,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  estado: Boolean(usuario.estado)
});

exports.registro = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono = 'Pendiente', direccion = 'Pendiente' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ mensaje: 'El email debe tener un formato valido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const [usuariosExistentes] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ mensaje: 'El correo ya esta registrado' });
    }

    const conexion = await db.getConnection();
    const passwordCifrada = await bcrypt.hash(password, 10);
    let usuario;

    try {
      await conexion.beginTransaction();
      const [resultado] = await conexion.query(
        'INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES (?, ?, ?, "cliente", TRUE)',
        [nombre, email, passwordCifrada]
      );

      await conexion.query(
        'INSERT INTO clientes (nombre, telefono, email, direccion, id_usuario) VALUES (?, ?, ?, ?, ?)',
        [nombre, telefono, email, direccion, resultado.insertId]
      );

      await conexion.commit();
      usuario = {
        id_usuario: resultado.insertId,
        nombre,
        email,
        rol: 'cliente',
        estado: true
      };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }

    res.status(201).json({
      mensaje: 'Cuenta de cliente registrada correctamente',
      usuario,
      token: crearToken(usuario)
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
    }

    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];
    if (!usuario.estado) {
      return res.status(403).json({ mensaje: 'El usuario esta inactivo' });
    }

    const passwordGuardada = usuario.password || '';
    const passwordEstaCifrada = passwordGuardada.startsWith('$2a$') || passwordGuardada.startsWith('$2b$');
    const passwordValida = passwordEstaCifrada
      ? await bcrypt.compare(password, passwordGuardada)
      : password === passwordGuardada;

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    if (!passwordEstaCifrada) {
      const passwordCifrada = await bcrypt.hash(password, 10);
      await db.query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [passwordCifrada, usuario.id_usuario]);
    }

    const usuarioPublico = datosPublicosUsuario(usuario);

    res.json({
      mensaje: 'Inicio de sesion correcto',
      usuario: usuarioPublico,
      token: crearToken(usuarioPublico)
    });
  } catch (error) {
    next(error);
  }
};

exports.perfil = async (req, res, next) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id_usuario, nombre, email, rol, estado FROM usuarios WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({
      mensaje: 'Perfil obtenido correctamente',
      usuario: datosPublicosUsuario(usuarios[0])
    });
  } catch (error) {
    next(error);
  }
};
