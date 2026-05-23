const cargarRecepcion = async () => {
  const [clientes, mascotas, citas] = await Promise.all([
    fetch(`${API_BASE_URL}/clientes`).then(respuesta => respuesta.json()),
    fetch(`${API_BASE_URL}/mascotas`).then(respuesta => respuesta.json()),
    fetch(`${API_BASE_URL}/citas`).then(respuesta => respuesta.json())
  ]);

  document.getElementById('totalClientes').textContent = Array.isArray(clientes) ? clientes.length : 0;
  document.getElementById('totalMascotas').textContent = Array.isArray(mascotas) ? mascotas.length : 0;
  document.getElementById('totalPendientes').textContent = Array.isArray(citas)
    ? citas.filter(cita => cita.estado === 'pendiente').length
    : 0;
};

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('recepcionista')) return;
  cargarRecepcion().catch(() => mostrarAlertaGlobal('No se pudo cargar el resumen de recepcion.', 'error'));
});
