const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'usuario';

function estaAutenticado() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

function obtenerToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function obtenerUsuario() {
  const usuario = localStorage.getItem(AUTH_USER_KEY);
  return usuario ? JSON.parse(usuario) : null;
}

function obtenerHeadersAuth() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${obtenerToken()}`
  };
}

function obtenerRutaPorRol(rol) {
  const rutas = {
    administrador: 'dashboard-admin.html',
    recepcionista: 'dashboard-recepcion.html',
    veterinario: 'dashboard-veterinario.html',
    cliente: 'portal-cliente.html'
  };
  return rutas[rol] || null;
}

function redirigirSegunRol(usuario) {
  const ruta = obtenerRutaPorRol(usuario?.rol);
  if (!ruta) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    mostrarAlertaGlobal('Rol no reconocido. Se cerro la sesion por seguridad.', 'error');
    return;
  }
  window.location.href = ruta;
}

function protegerRutaPorRol(...rolesPermitidos) {
  const usuario = obtenerUsuario();
  if (!estaAutenticado() || !usuario) {
    window.location.href = 'login.html';
    return false;
  }
  if (!rolesPermitidos.includes(usuario.rol)) {
    const ruta = obtenerRutaPorRol(usuario.rol);
    if (ruta) {
      window.location.href = ruta;
      return false;
    }
    cerrarSesion();
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function cerrarSesion() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  actualizarNavbarSesion();
  configurarNavbarPorRol();
  configurarAccionesInicio();
  mostrarAlertaGlobal('Sesion cerrada correctamente.', 'exito');
}

function requerirLogin() {
  if (estaAutenticado()) {
    return true;
  }
  mostrarModalLogin();
  return false;
}

function mostrarModalLogin() {
  let modal = document.getElementById('modalLogin');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalLogin';
    modal.className = 'modal-login';
    modal.innerHTML = `
      <div class="modal-contenido">
        <div class="modal-logo">${crearLogoSvg()}</div>
        <h2>Accion protegida</h2>
        <p>Debes iniciar sesion para realizar esta accion.</p>
        <div class="modal-acciones">
          <a class="boton principal" href="login.html">Iniciar sesion</a>
          <a class="boton secundario" href="registro.html">Crear cuenta</a>
          <button class="boton neutro" type="button" id="cerrarModalLogin">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cerrarModalLogin').addEventListener('click', () => {
      modal.classList.remove('visible');
    });
    modal.addEventListener('click', (evento) => {
      if (evento.target === modal) {
        modal.classList.remove('visible');
      }
    });
  }
  modal.classList.add('visible');
}

function actualizarNavbarSesion() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let areaSesion = document.getElementById('areaSesion');
  if (!areaSesion) {
    areaSesion = document.createElement('div');
    areaSesion.id = 'areaSesion';
    areaSesion.className = 'area-sesion';
    nav.appendChild(areaSesion);
  }

  const usuario = obtenerUsuario();
  if (usuario) {
    areaSesion.innerHTML = `
      <a class="usuario-activo" href="${obtenerRutaPorRol(usuario.rol) || 'index.html'}">${usuario.nombre || usuario.email}</a>
      <button class="boton sesion" type="button" id="btnCerrarSesion">Cerrar sesion</button>
    `;
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
  } else {
    areaSesion.innerHTML = `
      <a class="boton sesion" href="login.html">Iniciar sesion</a>
      <a class="boton sesion secundario-sesion" href="registro.html">Crear cuenta</a>
    `;
  }
}

function crearEnlaceNav(href, texto) {
  return `<a href="${href}">${texto}</a>`;
}

function obtenerMenuPorRol(usuario) {
  if (!usuario) {
    return [
      ['index.html', 'Inicio'],
      ['login.html', 'Agendar cita'],
      ['index.html#servicios', 'Conocer servicios'],
      ['login.html', 'Iniciar sesion'],
      ['registro.html', 'Crear cuenta']
    ];
  }

  const menus = {
    administrador: [
      ['dashboard-admin.html', 'Panel de administracion'],
      ['clientes.html', 'Clientes'],
      ['mascotas.html', 'Mascotas'],
      ['citas.html', 'Citas'],
      ['veterinarios.html', 'Veterinarios'],
      ['tratamientos.html', 'Tratamientos'],
      ['historial.html', 'Historial medico'],
      ['inventario.html', 'Inventario'],
      ['vacunas.html', 'Vacunas'],
      ['facturacion.html', 'Facturacion'],
      ['reportes.html', 'Reportes'],
      ['dashboard-admin.html#usuarios', 'Usuarios'],
      ['index.html#servicios', 'Conocer servicios']
    ],
    recepcionista: [
      ['dashboard-recepcion.html', 'Panel de recepcion'],
      ['clientes.html', 'Clientes'],
      ['mascotas.html', 'Mascotas'],
      ['citas.html', 'Citas']
    ],
    veterinario: [
      ['dashboard-veterinario.html', 'Panel veterinario'],
      ['citas.html', 'Citas'],
      ['tratamientos.html', 'Tratamientos'],
      ['historial.html', 'Historial medico']
    ],
    cliente: [
      ['portal-cliente.html', 'Mi portal'],
      ['portal-cliente.html#mascotas', 'Mis mascotas'],
      ['portal-cliente.html#misCitas', 'Mis citas'],
      ['portal-cliente.html#misTratamientos', 'Tratamientos de mis mascotas']
    ]
  };

  return menus[usuario.rol] || [['index.html', 'Inicio']];
}

function configurarNavbarPorRol() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const usuario = obtenerUsuario();
  navLinks.innerHTML = obtenerMenuPorRol(usuario)
    .map(([href, texto]) => crearEnlaceNav(href, texto))
    .join('');
}

function configurarAccionesInicio() {
  const accionesInicio = document.querySelector('.hero .acciones');
  if (!accionesInicio) return;

  const usuario = obtenerUsuario();
  if (!usuario) {
    accionesInicio.innerHTML = `
      <a class="boton principal" href="login.html">Agendar cita</a>
      <a class="boton secundario" href="login.html">Iniciar sesion</a>
      <a class="boton neutro" href="registro.html">Crear cuenta</a>
      <a class="boton neutro" href="#servicios">Conocer servicios</a>
    `;
    return;
  }

  const rutaPanel = obtenerRutaPorRol(usuario.rol) || 'index.html';
  const textoPanel = {
    administrador: 'Panel de administracion',
    recepcionista: 'Panel de recepcion',
    veterinario: 'Panel veterinario',
    cliente: 'Mi portal'
  }[usuario.rol] || 'Mi panel';

  const rutaCita = usuario.rol === 'cliente' ? 'portal-cliente.html#solicitarCita' : 'citas.html';
  accionesInicio.innerHTML = `
    <a class="boton principal" href="${rutaCita}">Agendar cita</a>
    <a class="boton secundario" href="${rutaPanel}">${textoPanel}</a>
    <a class="boton neutro" href="#servicios">Conocer servicios</a>
  `;
}

function redirigirSiYaTieneSesion() {
  const pagina = window.location.pathname.split('/').pop();
  if (!estaAutenticado() || !['login.html', 'registro.html'].includes(pagina)) return;

  const ruta = obtenerRutaPorRol(obtenerUsuario()?.rol);
  if (ruta) {
    window.location.href = ruta;
  }
}

function asegurarFooter() {
  if (document.querySelector('.pie')) return;
  const footer = document.createElement('footer');
  footer.className = 'pie';
  footer.innerHTML = '<p>VetCare Clinica Veterinaria. Atencion, seguimiento y cuidado para tus mascotas.</p>';
  document.body.appendChild(footer);
}

function mostrarAlertaGlobal(texto, tipo = 'exito') {
  let alerta = document.getElementById('alertaGlobal');
  if (!alerta) {
    alerta = document.createElement('div');
    alerta.id = 'alertaGlobal';
    alerta.className = 'alerta-global';
    document.body.appendChild(alerta);
  }
  alerta.textContent = texto;
  alerta.className = `alerta-global visible ${tipo}`;
  setTimeout(() => alerta.classList.remove('visible'), 3200);
}

function crearLogoSvg() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true" class="logo-svg">
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.12"></circle>
      <path d="M26 15h12v12h12v10H38v12H26V37H14V27h12V15z" fill="currentColor"></path>
      <circle cx="18" cy="47" r="4" fill="currentColor"></circle>
      <circle cx="28" cy="52" r="5" fill="currentColor"></circle>
      <circle cx="40" cy="52" r="5" fill="currentColor"></circle>
      <circle cx="50" cy="47" r="4" fill="currentColor"></circle>
    </svg>
  `;
}

async function enviarFormularioAuth(tipo) {
  const form = document.getElementById(tipo === 'login' ? 'formLogin' : 'formRegistro');
  const mensaje = document.getElementById('mensajeAuth');
  const boton = form.querySelector('button[type="submit"]');

  const payload = tipo === 'login'
    ? {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      }
    : {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        telefono: document.getElementById('telefono')?.value.trim() || 'Pendiente',
        direccion: document.getElementById('direccion')?.value.trim() || 'Pendiente'
      };

  boton.disabled = true;
  boton.textContent = tipo === 'login' ? 'Ingresando...' : 'Creando cuenta...';
  mensaje.textContent = '';

  try {
    const respuesta = await fetch(`${API_BASE_URL}/auth/${tipo === 'login' ? 'login' : 'registro'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.mensaje || 'No fue posible completar la accion.';
      mensaje.className = 'mensaje error';
      return;
    }

    localStorage.setItem(AUTH_TOKEN_KEY, datos.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(datos.usuario));
    mensaje.textContent = datos.mensaje;
    mensaje.className = 'mensaje exito';
    setTimeout(() => redirigirSegunRol(datos.usuario), 700);
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el sistema.';
    mensaje.className = 'mensaje error';
  } finally {
    boton.disabled = false;
    boton.textContent = tipo === 'login' ? 'Iniciar sesion' : 'Crear cuenta';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  redirigirSiYaTieneSesion();
  configurarNavbarPorRol();
  configurarAccionesInicio();
  actualizarNavbarSesion();
  asegurarFooter();

  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', (evento) => {
      evento.preventDefault();
      enviarFormularioAuth('login');
    });
  }

  const formRegistro = document.getElementById('formRegistro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', (evento) => {
      evento.preventDefault();
      enviarFormularioAuth('registro');
    });
  }
});
