const tablaCitasVeterinario = document.getElementById('tablaCitasVeterinario');

const cargarVeterinario = async () => {
  const usuario = obtenerUsuario();
  const [citas, tratamientos, historiales] = await Promise.all([
    fetch(`${API_BASE_URL}/citas`).then(respuesta => respuesta.json()),
    fetch(`${API_BASE_URL}/tratamientos`, { headers: obtenerHeadersAuth() }).then(respuesta => respuesta.json()),
    fetch(`${API_BASE_URL}/historial`).then(respuesta => respuesta.json())
  ]);

  const citasAsignadas = Array.isArray(citas)
    ? citas.filter(cita => !usuario?.nombre || cita.nombre_veterinario === usuario.nombre || cita.estado === 'pendiente')
    : [];

  document.getElementById('totalPendientes').textContent = citasAsignadas.filter(cita => cita.estado === 'pendiente').length;
  document.getElementById('totalTratamientos').textContent = Array.isArray(tratamientos) ? tratamientos.length : 0;
  document.getElementById('totalHistorial').textContent = Array.isArray(historiales) ? historiales.length : 0;

  if (!citasAsignadas.length) {
    tablaCitasVeterinario.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay citas asignadas.</td></tr>';
    return;
  }

  tablaCitasVeterinario.innerHTML = citasAsignadas.map(cita => `
    <tr>
      <td>${String(cita.fecha).slice(0, 10)}</td>
      <td>${cita.hora}</td>
      <td>${cita.nombre_mascota}</td>
      <td>${cita.nombre_cliente}</td>
      <td>${cita.motivo}</td>
      <td><span class="estado ${cita.estado}">${cita.estado}</span></td>
    </tr>
  `).join('');
};

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('veterinario')) return;
  cargarVeterinario().catch(() => mostrarAlertaGlobal('No se pudo cargar el panel medico.', 'error'));
});
