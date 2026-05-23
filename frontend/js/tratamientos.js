const API_TRATAMIENTOS = `${API_BASE_URL}/tratamientos`;
const API_MASCOTAS = `${API_BASE_URL}/mascotas`;

if (obtenerUsuario()?.rol === 'cliente') {
  window.location.href = 'portal-cliente.html';
}

const formTratamiento = document.getElementById('formTratamiento');
const tablaTratamientos = document.getElementById('tablaTratamientos');
const mensaje = document.getElementById('mensaje');
const btnGuardar = formTratamiento.querySelector('button[type="submit"]');
const mascotaAtendida = document.getElementById('mascotaAtendida');
const paramsTratamiento = new URLSearchParams(window.location.search);

const mostrarMensaje = (texto, tipo = 'exito') => {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const cargarMascotas = async () => {
  const respuesta = await fetch(API_MASCOTAS);
  const mascotas = await respuesta.json();
  document.getElementById('id_mascota').innerHTML = '<option value="">Seleccione una mascota</option>' + mascotas.map(mascota =>
    `<option value="${mascota.id_mascota}">${mascota.nombre}</option>`
  ).join('');
  aplicarMascotaAtendida();
};

const limpiarFormulario = () => {
  formTratamiento.reset();
  document.getElementById('id_tratamiento').value = '';
  mascotaAtendida.hidden = true;
  localStorage.removeItem('mascotaAtendida');
};

const aplicarMascotaAtendida = () => {
  const idUrl = paramsTratamiento.get('id_mascota');
  const nombreUrl = paramsTratamiento.get('nombre_mascota');
  const guardada = JSON.parse(localStorage.getItem('mascotaAtendida') || 'null');
  const idMascota = idUrl || guardada?.id_mascota;
  const nombreMascota = nombreUrl || guardada?.nombre_mascota;

  if (!idMascota) return;

  document.getElementById('id_mascota').value = idMascota;
  if (nombreMascota) {
    mascotaAtendida.textContent = `Mascota atendida: ${nombreMascota}`;
    mascotaAtendida.hidden = false;
  }
};

const listarTratamientos = async () => {
  try {
    tablaTratamientos.innerHTML = '<tr><td colspan="6" class="sin-datos">Cargando tratamientos...</td></tr>';
    const respuesta = await fetch(API_TRATAMIENTOS, { headers: obtenerHeadersAuth() });
    const tratamientos = await respuesta.json();
    if (!tratamientos.length) {
      tablaTratamientos.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay tratamientos registrados.</td></tr>';
      return;
    }
    tablaTratamientos.innerHTML = tratamientos.map(tratamiento => `
      <tr>
        <td>${tratamiento.id_tratamiento}</td>
        <td>${tratamiento.nombre}</td>
        <td>${tratamiento.descripcion}</td>
        <td>Q ${Number(tratamiento.costo).toFixed(2)}</td>
        <td>${tratamiento.nombre_mascota}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarTratamiento(${JSON.stringify(tratamiento)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarTratamiento(${tratamiento.id_tratamiento})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

window.editarTratamiento = (tratamiento) => {
  if (!requerirLogin()) return;
  document.getElementById('id_tratamiento').value = tratamiento.id_tratamiento;
  document.getElementById('nombre').value = tratamiento.nombre;
  document.getElementById('descripcion').value = tratamiento.descripcion;
  document.getElementById('costo').value = tratamiento.costo;
  document.getElementById('id_mascota').value = tratamiento.id_mascota;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarTratamiento = async (id) => {
  if (!requerirLogin()) return;
  if (!confirm('Desea eliminar este tratamiento?')) return;
  try {
    const respuesta = await fetch(`${API_TRATAMIENTOS}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarTratamientos();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

formTratamiento.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!requerirLogin()) return;

  const id = document.getElementById('id_tratamiento').value;
  const tratamiento = {
    nombre: document.getElementById('nombre').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    costo: Number(document.getElementById('costo').value),
    id_mascota: Number(document.getElementById('id_mascota').value)
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_TRATAMIENTOS}/${id}` : API_TRATAMIENTOS, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(tratamiento)
    });
    const datos = await respuesta.json();
    const mensajeExito = id ? datos.mensaje : 'Tratamiento registrado correctamente para la mascota.';
    mostrarMensaje(respuesta.ok ? mensajeExito : datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFormulario();
      listarTratamientos();
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar tratamiento';
  }
});

document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
cargarMascotas();
listarTratamientos();
