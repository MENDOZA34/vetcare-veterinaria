const API_CITAS = `${API_BASE_URL}/citas`;
const API_CLIENTES = `${API_BASE_URL}/clientes`;
const API_MASCOTAS = `${API_BASE_URL}/mascotas`;
const API_VETERINARIOS = `${API_BASE_URL}/veterinarios`;

if (obtenerUsuario()?.rol === 'cliente') {
  window.location.href = 'portal-cliente.html';
}

const formCita = document.getElementById('formCita');
const tablaCitas = document.getElementById('tablaCitas');
const mensaje = document.getElementById('mensaje');
const btnGuardar = formCita.querySelector('button[type="submit"]');
const accionTratamientoCita = document.getElementById('accionTratamientoCita');

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
  formCita.reset();
  document.getElementById('id_cita').value = '';
  accionTratamientoCita.innerHTML = '';
};

const obtenerTextoSelect = (selectId) => {
  const select = document.getElementById(selectId);
  return select.options[select.selectedIndex]?.textContent || '';
};

const mostrarAccionTratamiento = (idMascota, nombreMascota) => {
  const url = `tratamientos.html?id_mascota=${encodeURIComponent(idMascota)}&nombre_mascota=${encodeURIComponent(nombreMascota)}`;
  localStorage.setItem('mascotaAtendida', JSON.stringify({ id_mascota: idMascota, nombre_mascota: nombreMascota }));
  accionTratamientoCita.innerHTML = `<a class="boton principal" href="${url}">Registrar tratamiento</a>`;
};

const listarCitas = async () => {
  try {
    tablaCitas.innerHTML = '<tr><td colspan="9" class="sin-datos">Cargando citas...</td></tr>';
    const respuesta = await fetch(API_CITAS);
    const citas = await respuesta.json();
    if (!citas.length) {
      tablaCitas.innerHTML = '<tr><td colspan="9" class="sin-datos">No hay citas registradas.</td></tr>';
      return;
    }
    tablaCitas.innerHTML = citas.map(cita => `
      <tr>
        <td>${cita.id_cita}</td>
        <td>${String(cita.fecha).slice(0, 10)}</td>
        <td>${cita.hora}</td>
        <td>${cita.motivo}</td>
        <td><span class="estado ${cita.estado}">${cita.estado}</span></td>
        <td>${cita.nombre_cliente}</td>
        <td>${cita.nombre_mascota}</td>
        <td>${cita.nombre_veterinario}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarCita(${JSON.stringify(cita)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarCita(${cita.id_cita})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

window.editarCita = (cita) => {
  if (!requerirLogin()) return;
  document.getElementById('id_cita').value = cita.id_cita;
  document.getElementById('fecha').value = String(cita.fecha).slice(0, 10);
  document.getElementById('hora').value = cita.hora;
  document.getElementById('motivo').value = cita.motivo;
  document.getElementById('estado').value = cita.estado;
  document.getElementById('id_cliente').value = cita.id_cliente;
  document.getElementById('id_mascota').value = cita.id_mascota;
  document.getElementById('id_veterinario').value = cita.id_veterinario;
  accionTratamientoCita.innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarCita = async (id) => {
  if (!requerirLogin()) return;
  if (!confirm('Desea eliminar o cancelar esta cita?')) return;
  try {
    const respuesta = await fetch(`${API_CITAS}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarCitas();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

formCita.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!requerirLogin()) return;

  const id = document.getElementById('id_cita').value;
  const cita = {
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    motivo: document.getElementById('motivo').value.trim(),
    estado: document.getElementById('estado').value,
    id_cliente: Number(document.getElementById('id_cliente').value),
    id_mascota: Number(document.getElementById('id_mascota').value),
    id_veterinario: Number(document.getElementById('id_veterinario').value)
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_CITAS}/${id}` : API_CITAS, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(cita)
    });
    const datos = await respuesta.json();
    const tipoMensaje = respuesta.ok ? 'exito' : 'error';
    mostrarMensaje(datos.mensaje, tipoMensaje);
    if (respuesta.ok) {
      const citaAtendida = cita.estado === 'atendida';
      const idMascotaAtendida = cita.id_mascota;
      const nombreMascotaAtendida = obtenerTextoSelect('id_mascota');
      limpiarFormulario();
      if (citaAtendida) {
        mostrarMensaje('Cita marcada como atendida. Ahora puedes registrar el tratamiento de la mascota.', 'exito');
        mostrarAccionTratamiento(idMascotaAtendida, nombreMascotaAtendida);
      }
      listarCitas();
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
});

document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
cargarSelect(API_CLIENTES, 'id_cliente', 'id_cliente', 'nombre');
cargarSelect(API_MASCOTAS, 'id_mascota', 'id_mascota', 'nombre');
cargarSelect(API_VETERINARIOS, 'id_veterinario', 'id_veterinario', 'nombre');
listarCitas();
