const API_HISTORIAL = `${API_BASE_URL}/historial`;
const API_MASCOTAS = `${API_BASE_URL}/mascotas`;
const API_VETERINARIOS = `${API_BASE_URL}/veterinarios`;

if (obtenerUsuario()?.rol === 'cliente') {
  window.location.href = 'portal-cliente.html';
}

const formHistorial = document.getElementById('formHistorial');
const tablaHistorial = document.getElementById('tablaHistorial');
const mensaje = document.getElementById('mensaje');
const btnGuardar = formHistorial.querySelector('button[type="submit"]');

const mostrarMensaje = (texto, tipo = 'exito') => {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const cargarSelect = async (url, selectId, idCampo, textoCampo) => {
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Seleccione una opcion</option>' + datos.map(item =>
    `<option value="${item[idCampo]}">${item[textoCampo]}</option>`
  ).join('');
};

const limpiarFormulario = () => {
  formHistorial.reset();
  document.getElementById('id_historial').value = '';
};

const listarHistorial = async () => {
  try {
    tablaHistorial.innerHTML = '<tr><td colspan="7" class="sin-datos">Cargando historial...</td></tr>';
    const respuesta = await fetch(API_HISTORIAL);
    const historiales = await respuesta.json();
    if (!historiales.length) {
      tablaHistorial.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay historiales medicos registrados.</td></tr>';
      return;
    }
    tablaHistorial.innerHTML = historiales.map(historial => `
      <tr>
        <td>${historial.id_historial}</td>
        <td>${String(historial.fecha).slice(0, 10)}</td>
        <td>${historial.diagnostico}</td>
        <td>${historial.observaciones}</td>
        <td>${historial.nombre_mascota}</td>
        <td>${historial.nombre_veterinario}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarHistorial(${JSON.stringify(historial)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarHistorial(${historial.id_historial})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

window.editarHistorial = (historial) => {
  if (!requerirLogin()) return;
  document.getElementById('id_historial').value = historial.id_historial;
  document.getElementById('fecha').value = String(historial.fecha).slice(0, 10);
  document.getElementById('diagnostico').value = historial.diagnostico;
  document.getElementById('observaciones').value = historial.observaciones;
  document.getElementById('id_mascota').value = historial.id_mascota;
  document.getElementById('id_veterinario').value = historial.id_veterinario;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarHistorial = async (id) => {
  if (!requerirLogin()) return;
  if (!confirm('Desea eliminar este historial?')) return;
  try {
    const respuesta = await fetch(`${API_HISTORIAL}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarHistorial();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

formHistorial.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!requerirLogin()) return;

  const id = document.getElementById('id_historial').value;
  const historial = {
    fecha: document.getElementById('fecha').value,
    diagnostico: document.getElementById('diagnostico').value.trim(),
    observaciones: document.getElementById('observaciones').value.trim(),
    id_mascota: Number(document.getElementById('id_mascota').value),
    id_veterinario: Number(document.getElementById('id_veterinario').value)
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_HISTORIAL}/${id}` : API_HISTORIAL, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(historial)
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFormulario();
      listarHistorial();
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
});

document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
cargarSelect(API_MASCOTAS, 'id_mascota', 'id_mascota', 'nombre');
cargarSelect(API_VETERINARIOS, 'id_veterinario', 'id_veterinario', 'nombre');
listarHistorial();
