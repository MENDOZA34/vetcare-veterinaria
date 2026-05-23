const API_URL = `${API_BASE_URL}/clientes`;

if (obtenerUsuario()?.rol === 'cliente') {
  window.location.href = 'portal-cliente.html';
}

const formCliente = document.getElementById('formCliente');
const tablaClientes = document.getElementById('tablaClientes');
const mensaje = document.getElementById('mensaje');
const btnLimpiar = document.getElementById('btnLimpiar');
const btnGuardar = document.getElementById('btnGuardar');

const mostrarMensaje = (texto, tipo = 'exito') => {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const limpiarFormulario = () => {
  formCliente.reset();
  document.getElementById('id_cliente').value = '';
};

const crearFilaVacia = () => `
  <tr>
    <td colspan="6" class="sin-datos">No hay clientes registrados.</td>
  </tr>
`;

const listarClientes = async () => {
  try {
    tablaClientes.innerHTML = '<tr><td colspan="6" class="sin-datos">Cargando clientes...</td></tr>';
    const respuesta = await fetch(API_URL);
    const clientes = await respuesta.json();
    if (!clientes.length) {
      tablaClientes.innerHTML = crearFilaVacia();
      return;
    }
    tablaClientes.innerHTML = clientes.map(cliente => `
      <tr>
        <td>${cliente.id_cliente}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.telefono}</td>
        <td>${cliente.email}</td>
        <td>${cliente.direccion}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarCliente(${JSON.stringify(cliente)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarCliente(${cliente.id_cliente})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
    tablaClientes.innerHTML = crearFilaVacia();
  }
};

window.editarCliente = (cliente) => {
  if (!requerirLogin()) return;
  document.getElementById('id_cliente').value = cliente.id_cliente;
  document.getElementById('nombre').value = cliente.nombre;
  document.getElementById('telefono').value = cliente.telefono;
  document.getElementById('email').value = cliente.email;
  document.getElementById('direccion').value = cliente.direccion;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarCliente = async (id) => {
  if (!requerirLogin()) return;
  if (!confirm('Desea eliminar este cliente?')) return;
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarClientes();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  }
};

formCliente.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!requerirLogin()) return;

  const id = document.getElementById('id_cliente').value;
  const cliente = {
    nombre: document.getElementById('nombre').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    email: document.getElementById('email').value.trim(),
    direccion: document.getElementById('direccion').value.trim()
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(cliente)
    });
    const datos = await respuesta.json();
    mostrarMensaje(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFormulario();
      listarClientes();
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
});

btnLimpiar.addEventListener('click', limpiarFormulario);
listarClientes();
