const API_REPORTES = `${API_BASE_URL}/reportes/resumen`;

const mensajeReportes = document.getElementById('mensajeReportes');

const formatearMonedaReporte = (valor) => `Q ${Number(valor || 0).toFixed(2)}`;

const asignarReporte = (id, valor) => {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = id === 'totalFacturado' ? formatearMonedaReporte(valor) : valor;
  }
};

const cargarReportes = async () => {
  try {
    const respuesta = await fetch(API_REPORTES, { headers: obtenerHeadersAuth() });
    const resumen = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(resumen.mensaje || 'No se pudieron cargar los reportes');
    }

    Object.entries(resumen).forEach(([clave, valor]) => asignarReporte(clave, valor));
    mensajeReportes.textContent = 'Reportes cargados correctamente.';
    mensajeReportes.className = 'mensaje exito';
  } catch (error) {
    mensajeReportes.textContent = error.message || 'No se pudo conectar con el sistema.';
    mensajeReportes.className = 'mensaje error';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('administrador')) return;
  cargarReportes();
});
