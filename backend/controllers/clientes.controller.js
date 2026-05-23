const db = require('../db/conexion');

const validarCliente = ({ nombre, telefono, email, direccion }) => {
  if (!nombre || !telefono || !email || !direccion) {
    return 'Todos los campos son obligatorios';
  }
  if (!email.includes('@')) {
    return 'El email debe tener un formato valido';
  }
  return null;
};

exports.listarClientes = async (req, res, next) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes ORDER BY id_cliente DESC');
    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

exports.obtenerClientePorId = async (req, res, next) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (clientes.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(clientes[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearCliente = async (req, res, next) => {
  try {
    const errorValidacion = validarCliente(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, telefono, email, direccion } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)',
      [nombre, telefono, email, direccion]
    );

    res.status(201).json({
      mensaje: 'Cliente registrado correctamente',
      id_cliente: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarCliente = async (req, res, next) => {
  try {
    const errorValidacion = validarCliente(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { nombre, telefono, email, direccion } = req.body;
    const [resultado] = await db.query(
      'UPDATE clientes SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id_cliente = ?',
      [nombre, telefono, email, direccion, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.eliminarCliente = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
