const API_URL = `${API_BASE_URL}/veterinarios`;

if (obtenerUsuario()?.rol === 'cliente') {
  window.location.href = 'portal-cliente.html';
}

const formVeterinario = document.getElementById('formVeterinario');
const tablaVeterinarios = document.getElementById('tablaVeterinarios');
const mensaje = document.getElementById('mensaje');
const btnGuardar = formVeterinario.querySelector('button[type="submit"]');

const mostrarMensaje = (texto, tipo = 'exito') => {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const limpiarFormulario = () => {
  formVeterinario.reset();
  document.getElementById('id_veterinario').value = '';
};

const listarVeterinarios = async () => {
  try {
    tablaVeterinarios.innerHTML = '<tr><td colspan="6" class="sin-datos">Cargando veterinarios...</td></tr>';
    const respuesta = await fetch(API_URL);
    const veterinarios = await respuesta.json();
    if (!veterinarios.length) {
      tablaVeterinarios.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay veterinarios registrados.</td></tr>';
      return;
    }
    tablaVeterinarios.innerHTML = veterinarios.map(veterinario => `
      <tr>
        <td>${veterinario.id_veterinario}</td>
        <td>${veterinario.nombre}</td>
        <td>${veterinario.especialidad}</td>
        <td>${veterinario.telefono}</td>
        <td>${veterinario.email}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarVeterinario(${JSON.stringify(veterinario)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarVeterinario(${veterinario.id_veterinario})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

window.editarVeterinario = (veterinario) => {
  if (!requerirLogin()) return;
  document.getElementById('id_veterinario').value = veterinario.id_veterinario;
  document.getElementById('nombre').value = veterinario.nombre;
  document.getElementById('especialidad').value = veterinario.especialidad;
  document.getElementById('telefono').value = veterinario.telefono;
  document.getElementById('email').value = veterinario.email;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarVeterinario = async (id) => {
  if (!requerirLogin()) return;
  if (!confirm('Desea eliminar este veterinario?')) return;
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarVeterinarios();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

formVeterinario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!requerirLogin()) return;

  const id = document.getElementById('id_veterinario').value;
  const veterinario = {
    nombre: document.getElementById('nombre').value.trim(),
    especialidad: document.getElementById('especialidad').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    email: document.getElementById('email').value.trim()
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(veterinario)
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFormulario();
      listarVeterinarios();
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
});

document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
listarVeterinarios();
