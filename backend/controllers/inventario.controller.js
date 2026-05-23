const db = require('../db/conexion');

const categoriasPermitidas = ['Medicamento', 'Vacuna', 'Insumo', 'Producto', 'Otro'];
const estadosPermitidos = ['Disponible', 'Agotado', 'Inactivo'];

const validarInventario = ({ nombre_producto, categoria, cantidad, precio_unitario, estado = 'Disponible' }) => {
  if (!nombre_producto || !categoria || cantidad === undefined || precio_unitario === undefined) {
    return 'Nombre, categoria, cantidad y precio unitario son obligatorios';
  }
  if (!categoriasPermitidas.includes(categoria)) {
    return 'Categoria no permitida';
  }
  if (!estadosPermitidos.includes(estado)) {
    return 'Estado no permitido';
  }
  if (Number(cantidad) < 0) {
    return 'La cantidad no puede ser negativa';
  }
  if (Number(precio_unitario) < 0) {
    return 'El precio unitario no puede ser negativo';
  }
  return null;
};

exports.listarInventario = async (req, res, next) => {
  try {
    const [productos] = await db.query('SELECT * FROM inventario ORDER BY id_inventario DESC');
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

exports.obtenerInventarioPorId = async (req, res, next) => {
  try {
    const [productos] = await db.query('SELECT * FROM inventario WHERE id_inventario = ?', [req.params.id]);
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'Producto de inventario no encontrado' });
    }
    res.json(productos[0]);
  } catch (error) {
    next(error);
  }
};

exports.crearInventario = async (req, res, next) => {
  try {
    const errorValidacion = validarInventario(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const {
      nombre_producto,
      categoria,
      descripcion = '',
      cantidad,
      precio_unitario,
      estado = 'Disponible'
    } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO inventario (nombre_producto, categoria, descripcion, cantidad, precio_unitario, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_producto, categoria, descripcion, cantidad, precio_unitario, estado]
    );

    res.status(201).json({
      mensaje: 'Producto registrado correctamente',
      id_inventario: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarInventario = async (req, res, next) => {
  try {
    const errorValidacion = validarInventario(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const {
      nombre_producto,
      categoria,
      descripcion = '',
      cantidad,
      precio_unitario,
      estado = 'Disponible'
    } = req.body;

    const [resultado] = await db.query(
      `UPDATE inventario
       SET nombre_producto = ?, categoria = ?, descripcion = ?, cantidad = ?, precio_unitario = ?, estado = ?
       WHERE id_inventario = ?`,
      [nombre_producto, categoria, descripcion, cantidad, precio_unitario, estado, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto de inventario no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.eliminarInventario = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM inventario WHERE id_inventario = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto de inventario no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
