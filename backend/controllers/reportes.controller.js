const db = require('../db/conexion');

const obtenerConteo = async (consulta, parametros = []) => {
  const [filas] = await db.query(consulta, parametros);
  return Number(filas[0]?.total || 0);
};

exports.obtenerResumen = async (req, res, next) => {
  try {
    const [
      totalUsuarios,
      totalClientes,
      totalMascotas,
      totalCitas,
      totalCitasPendientes,
      totalCitasAtendidas,
      totalCitasCanceladas,
      totalVeterinarios,
      totalTratamientos,
      totalInventario,
      totalVacunas,
      totalFacturas,
      totalFacturado
    ] = await Promise.all([
      obtenerConteo('SELECT COUNT(*) AS total FROM usuarios'),
      obtenerConteo('SELECT COUNT(*) AS total FROM clientes'),
      obtenerConteo('SELECT COUNT(*) AS total FROM mascotas'),
      obtenerConteo('SELECT COUNT(*) AS total FROM citas'),
      obtenerConteo('SELECT COUNT(*) AS total FROM citas WHERE estado = ?', ['pendiente']),
      obtenerConteo('SELECT COUNT(*) AS total FROM citas WHERE estado = ?', ['atendida']),
      obtenerConteo('SELECT COUNT(*) AS total FROM citas WHERE estado = ?', ['cancelada']),
      obtenerConteo('SELECT COUNT(*) AS total FROM veterinarios'),
      obtenerConteo('SELECT COUNT(*) AS total FROM tratamientos'),
      obtenerConteo('SELECT COUNT(*) AS total FROM inventario'),
      obtenerConteo('SELECT COUNT(*) AS total FROM vacunas'),
      obtenerConteo('SELECT COUNT(*) AS total FROM facturas'),
      obtenerConteo('SELECT COALESCE(SUM(total), 0) AS total FROM facturas WHERE estado <> ?', ['Anulada'])
    ]);

    res.json({
      totalUsuarios,
      totalClientes,
      totalMascotas,
      totalCitas,
      totalCitasPendientes,
      totalCitasAtendidas,
      totalCitasCanceladas,
      totalVeterinarios,
      totalTratamientos,
      totalInventario,
      totalVacunas,
      totalFacturas,
      totalFacturado
    });
  } catch (error) {
    next(error);
  }
};
