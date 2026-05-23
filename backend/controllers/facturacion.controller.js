const db = require('../db/conexion');

const estadosPermitidos = ['Pendiente', 'Pagada', 'Anulada'];

const normalizarDetalles = (detalles = []) => detalles.map((detalle) => {
  const cantidad = Number(detalle.cantidad);
  const precioUnitario = Number(detalle.precio_unitario);
  return {
    concepto: detalle.concepto,
    cantidad,
    precio_unitario: precioUnitario,
    subtotal: cantidad * precioUnitario
  };
});

const calcularTotal = (detalles) => detalles.reduce((total, detalle) => total + detalle.subtotal, 0);

const validarFactura = ({ fecha, id_cliente, estado = 'Pendiente', detalles }) => {
  if (!fecha || !id_cliente || !estado) {
    return 'Fecha, cliente y estado son obligatorios';
  }
  if (!estadosPermitidos.includes(estado)) {
    return 'Estado no permitido';
  }
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return 'La factura debe incluir al menos un detalle';
  }

  const detalleInvalido = detalles.some((detalle) =>
    !detalle.concepto ||
    Number(detalle.cantidad) <= 0 ||
    Number(detalle.precio_unitario) < 0 ||
    Number.isNaN(Number(detalle.cantidad)) ||
    Number.isNaN(Number(detalle.precio_unitario))
  );

  if (detalleInvalido) {
    return 'Cada detalle debe tener concepto, cantidad mayor a cero y precio unitario valido';
  }

  return null;
};

const obtenerFacturaCompleta = async (idFactura, conexion = db) => {
  const [facturas] = await conexion.query(`
    SELECT f.*, c.nombre AS nombre_cliente, c.email AS email_cliente
    FROM facturas f
    INNER JOIN clientes c ON f.id_cliente = c.id_cliente
    WHERE f.id_factura = ?
  `, [idFactura]);

  if (facturas.length === 0) {
    return null;
  }

  const [detalles] = await conexion.query(
    'SELECT * FROM detalle_factura WHERE id_factura = ? ORDER BY id_detalle ASC',
    [idFactura]
  );

  return {
    ...facturas[0],
    detalles
  };
};

exports.listarFacturas = async (req, res, next) => {
  try {
    const [facturas] = await db.query(`
      SELECT f.*, c.nombre AS nombre_cliente, COUNT(df.id_detalle) AS total_detalles
      FROM facturas f
      INNER JOIN clientes c ON f.id_cliente = c.id_cliente
      LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura
      GROUP BY f.id_factura
      ORDER BY f.id_factura DESC
    `);
    res.json(facturas);
  } catch (error) {
    next(error);
  }
};

exports.obtenerFacturaPorId = async (req, res, next) => {
  try {
    const factura = await obtenerFacturaCompleta(req.params.id);
    if (!factura) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }
    res.json(factura);
  } catch (error) {
    next(error);
  }
};

exports.crearFactura = async (req, res, next) => {
  const conexion = await db.getConnection();
  try {
    const errorValidacion = validarFactura(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { fecha, id_cliente, estado = 'Pendiente' } = req.body;
    const detalles = normalizarDetalles(req.body.detalles);
    const total = calcularTotal(detalles);

    await conexion.beginTransaction();
    const [resultado] = await conexion.query(
      'INSERT INTO facturas (fecha, id_cliente, total, estado) VALUES (?, ?, ?, ?)',
      [fecha, id_cliente, total, estado]
    );

    const valoresDetalles = detalles.map((detalle) => [
      resultado.insertId,
      detalle.concepto,
      detalle.cantidad,
      detalle.precio_unitario,
      detalle.subtotal
    ]);

    await conexion.query(
      `INSERT INTO detalle_factura (id_factura, concepto, cantidad, precio_unitario, subtotal)
       VALUES ?`,
      [valoresDetalles]
    );

    await conexion.commit();
    res.status(201).json({
      mensaje: 'Factura registrada correctamente',
      id_factura: resultado.insertId,
      total
    });
  } catch (error) {
    await conexion.rollback();
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'El cliente indicado no existe' });
    }
    next(error);
  } finally {
    conexion.release();
  }
};

exports.actualizarFactura = async (req, res, next) => {
  const conexion = await db.getConnection();
  try {
    const errorValidacion = validarFactura(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const { fecha, id_cliente, estado = 'Pendiente' } = req.body;
    const detalles = normalizarDetalles(req.body.detalles);
    const total = calcularTotal(detalles);

    await conexion.beginTransaction();
    const [resultado] = await conexion.query(
      'UPDATE facturas SET fecha = ?, id_cliente = ?, total = ?, estado = ? WHERE id_factura = ?',
      [fecha, id_cliente, total, estado, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      await conexion.rollback();
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    await conexion.query('DELETE FROM detalle_factura WHERE id_factura = ?', [req.params.id]);

    const valoresDetalles = detalles.map((detalle) => [
      req.params.id,
      detalle.concepto,
      detalle.cantidad,
      detalle.precio_unitario,
      detalle.subtotal
    ]);

    await conexion.query(
      `INSERT INTO detalle_factura (id_factura, concepto, cantidad, precio_unitario, subtotal)
       VALUES ?`,
      [valoresDetalles]
    );

    await conexion.commit();
    res.json({
      mensaje: 'Factura actualizada correctamente',
      total
    });
  } catch (error) {
    await conexion.rollback();
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ mensaje: 'El cliente indicado no existe' });
    }
    next(error);
  } finally {
    conexion.release();
  }
};

exports.eliminarFactura = async (req, res, next) => {
  try {
    const [resultado] = await db.query('DELETE FROM facturas WHERE id_factura = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }
    res.json({ mensaje: 'Factura eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
