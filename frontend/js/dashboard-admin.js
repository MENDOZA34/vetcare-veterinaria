const API_USUARIOS = `${API_BASE_URL}/usuarios`;
const API_REPORTES_RESUMEN = `${API_BASE_URL}/reportes/resumen`;

const formUsuarioInterno = document.getElementById('formUsuarioInterno');
const tablaUsuarios = document.getElementById('tablaUsuarios');
const mensajeAdmin = document.getElementById('mensajeAdmin');

const mostrarMensajeAdmin = (texto, tipo = 'exito') => {
  mensajeAdmin.textContent = texto;
  mensajeAdmin.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const limpiarUsuario = () => {
  formUsuarioInterno.reset();
  document.getElementById('id_usuario').value = '';
  document.getElementById('password').required = true;
};

const cargarConteo = async (url, idElemento) => {
  try {
    const requiereToken = url.includes('/usuarios') || url.includes('/tratamientos');
    const respuesta = await fetch(url, requiereToken ? { headers: obtenerHeadersAuth() } : undefined);
    const datos = await respuesta.json();
    const elemento = document.getElementById(idElemento);
    if (elemento) {
      elemento.textContent = Array.isArray(datos) ? datos.length : 0;
    }
  } catch (error) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
      elemento.textContent = '0';
    }
  }
};

const asignarResumen = (id, valor) => {
  const elemento = document.getElementById(id);
  if (!elemento) return;
  elemento.textContent = id === 'totalFacturado' ? `Q ${Number(valor || 0).toFixed(2)}` : valor;
};

const cargarResumenBasico = () => {
  cargarConteo(API_USUARIOS, 'totalUsuarios');
  cargarConteo(`${API_BASE_URL}/clientes`, 'totalClientes');
  cargarConteo(`${API_BASE_URL}/mascotas`, 'totalMascotas');
  cargarConteo(`${API_BASE_URL}/citas`, 'totalCitas');
  cargarConteo(`${API_BASE_URL}/veterinarios`, 'totalVeterinarios');
  cargarConteo(`${API_BASE_URL}/tratamientos`, 'totalTratamientos');
};

const cargarResumen = async () => {
  try {
    const respuesta = await fetch(API_REPORTES_RESUMEN, { headers: obtenerHeadersAuth() });
    const resumen = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(resumen.mensaje || 'No se pudo cargar el resumen administrativo');
    }
    Object.entries(resumen).forEach(([clave, valor]) => asignarResumen(clave, valor));
  } catch (error) {
    cargarResumenBasico();
  }
};

const listarUsuarios = async () => {
  tablaUsuarios.innerHTML = '<tr><td colspan="6" class="sin-datos">Cargando usuarios...</td></tr>';
  try {
    const respuesta = await fetch(API_USUARIOS, { headers: obtenerHeadersAuth() });
    const usuarios = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(usuarios.mensaje || 'No se pudieron cargar los usuarios');
    }
    if (!usuarios.length) {
      tablaUsuarios.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay usuarios registrados.</td></tr>';
      return;
    }
    tablaUsuarios.innerHTML = usuarios.map(usuario => `
      <tr>
        <td>${usuario.id_usuario}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td>${usuario.rol}</td>
        <td>${usuario.estado ? 'Activo' : 'Inactivo'}</td>
        <td class="acciones-tabla">
          <button class="boton secundario" onclick='editarUsuario(${JSON.stringify(usuario)})'>Editar</button>
          <button class="boton peligro" onclick="eliminarUsuario(${usuario.id_usuario})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tablaUsuarios.innerHTML = '<tr><td colspan="6" class="sin-datos">No fue posible cargar usuarios.</td></tr>';
    mostrarMensajeAdmin(error.message, 'error');
  }
};

window.editarUsuario = (usuario) => {
  document.getElementById('id_usuario').value = usuario.id_usuario;
  document.getElementById('nombre').value = usuario.nombre;
  document.getElementById('email').value = usuario.email;
  document.getElementById('rol').value = usuario.rol;
  document.getElementById('estado').value = String(Boolean(usuario.estado));
  document.getElementById('password').required = false;
  document.getElementById('password').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarUsuario = async (id) => {
  if (!confirm('Desea eliminar este usuario?')) return;
  try {
    const respuesta = await fetch(`${API_USUARIOS}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensajeAdmin(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    listarUsuarios();
    cargarResumen();
  } catch (error) {
    mostrarMensajeAdmin('No se pudo conectar con el sistema.', 'error');
  }
};

formUsuarioInterno.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('id_usuario').value;
  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    rol: document.getElementById('rol').value,
    estado: document.getElementById('estado').value === 'true'
  };
  if (id && !payload.password) {
    delete payload.password;
  }

  try {
    const respuesta = await fetch(id ? `${API_USUARIOS}/${id}` : API_USUARIOS, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(payload)
    });
    const datos = await respuesta.json();
    mostrarMensajeAdmin(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarUsuario();
      listarUsuarios();
      cargarResumen();
    }
  } catch (error) {
    mostrarMensajeAdmin('No se pudo conectar con el sistema.', 'error');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('administrador')) return;
  document.getElementById('btnLimpiarUsuario').addEventListener('click', limpiarUsuario);
  limpiarUsuario();
  listarUsuarios();
  cargarResumen();
});
