const API_MASCOTAS = `${API_BASE_URL}/mascotas`;
const API_CLIENTES = `${API_BASE_URL}/clientes`;

if (obtenerUsuario()?.rol === 'cliente') {
  window.location.href = 'portal-cliente.html';
}

const formMascota = document.getElementById('formMascota');
const tablaMascotas = document.getElementById('tablaMascotas');
const mensaje = document.getElementById('mensaje');
const selectCliente = document.getElementById('id_cliente');
const btnGuardar = formMascota.querySelector('button[type="submit"]');

const mostrarMensaje = (texto, tipo = 'exito') => {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const cargarClientes = async () => {
  const respuesta = await fetch(API_CLIENTES);
  const clientes = await respuesta.json();
  selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>' + clientes.map(cliente =>
    `<option value="${cliente.id_cliente}">${cliente.nombre}</option>`
  ).join('');
};

const limpiarFormulario = () => {
  formMascota.reset();
  document.getElementById('id_mascota').value = '';
};

const listarMascotas = async () => {
  try {
    tablaMascotas.innerHTML = '<tr><td colspan="8" class="sin-datos">Cargando mascotas...</td></tr>';
    const respuesta = await fetch(API_MASCOTAS);
    const mascotas = await respuesta.json();
    if (!mascotas.length) {
      tablaMascotas.innerHTML = '<tr><td colspan="8" class="sin-datos">No hay mascotas registradas.</td></tr>';
      return;
    }
    tablaMascotas.innerHTML = mascotas.map(mascota => `
      <tr>
        <td>${mascota.id_mascota}</td>
        <td>${mascota.nombre}</td>
        <td>${mascota.especie}</td>
        <td>${mascota.raza}</td>
        <td>${mascota.edad}</td>
        <td>${mascota.sexo}</td>
        <td>${mascota.nombre_cliente}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarMascota(${JSON.stringify(mascota)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarMascota(${mascota.id_mascota})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

window.editarMascota = (mascota) => {
  if (!requerirLogin()) return;
  document.getElementById('id_mascota').value = mascota.id_mascota;
  document.getElementById('nombre').value = mascota.nombre;
  document.getElementById('especie').value = mascota.especie;
  document.getElementById('raza').value = mascota.raza;
  document.getElementById('edad').value = mascota.edad;
  document.getElementById('sexo').value = mascota.sexo;
  selectCliente.value = mascota.id_cliente;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarMascota = async (id) => {
  if (!requerirLogin()) return;
  if (!confirm('Desea eliminar esta mascota?')) return;
  try {
    const respuesta = await fetch(`${API_MASCOTAS}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarMascotas();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

formMascota.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!requerirLogin()) return;

  const id = document.getElementById('id_mascota').value;
  const mascota = {
    nombre: document.getElementById('nombre').value.trim(),
    especie: document.getElementById('especie').value.trim(),
    raza: document.getElementById('raza').value.trim(),
    edad: Number(document.getElementById('edad').value),
    sexo: document.getElementById('sexo').value.trim(),
    id_cliente: Number(selectCliente.value)
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_MASCOTAS}/${id}` : API_MASCOTAS, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(mascota)
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFormulario();
      listarMascotas();
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
});

document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
cargarClientes();
listarMascotas();
