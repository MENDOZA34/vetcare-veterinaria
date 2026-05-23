const API_PORTAL = `${API_BASE_URL}/portal`;

const perfilCliente = document.getElementById('perfilCliente');
const formMascotaCliente = document.getElementById('formMascotaCliente');
const formCitaCliente = document.getElementById('formCitaCliente');
const listaMascotasCliente = document.getElementById('listaMascotasCliente');
const listaCitasCliente = document.getElementById('listaCitasCliente');
const listaTratamientosCliente = document.getElementById('listaTratamientosCliente');
const mensajePortal = document.getElementById('mensajePortal');

let mascotasCliente = [];

const mostrarMensajePortal = (texto, tipo = 'exito') => {
  mensajePortal.textContent = texto;
  mensajePortal.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const limpiarMascotaCliente = () => {
  formMascotaCliente.reset();
  document.getElementById('id_mascota_cliente').value = '';
};

const cargarPerfil = async () => {
  const respuesta = await fetch(`${API_PORTAL}/perfil`, { headers: obtenerHeadersAuth() });
  const perfil = await respuesta.json();
  if (!respuesta.ok) throw new Error(perfil.mensaje || 'No se pudo cargar el perfil');

  perfilCliente.innerHTML = `
    <p><strong>Nombre:</strong> ${perfil.nombre}</p>
    <p><strong>Email:</strong> ${perfil.email}</p>
    <p><strong>Telefono:</strong> ${perfil.telefono}</p>
    <p><strong>Direccion:</strong> ${perfil.direccion}</p>
  `;
};

const cargarMascotas = async () => {
  const respuesta = await fetch(`${API_PORTAL}/mis-mascotas`, { headers: obtenerHeadersAuth() });
  mascotasCliente = await respuesta.json();
  if (!respuesta.ok) throw new Error(mascotasCliente.mensaje || 'No se pudieron cargar las mascotas');

  const selectMascotas = document.getElementById('cita_mascota');
  selectMascotas.innerHTML = '<option value="">Seleccione una mascota</option>' + mascotasCliente.map(mascota =>
    `<option value="${mascota.id_mascota}">${mascota.nombre}</option>`
  ).join('');

  if (!mascotasCliente.length) {
    listaMascotasCliente.innerHTML = '<p class="sin-datos">Aun no tienes mascotas registradas.</p>';
    return;
  }

  listaMascotasCliente.innerHTML = mascotasCliente.map(mascota => `
    <article class="tarjeta tarjeta-compacta">
      <span class="icono">M</span>
      <h3>${mascota.nombre}</h3>
      <p>${mascota.especie} - ${mascota.raza}</p>
      <p>Edad: ${mascota.edad} | Sexo: ${mascota.sexo}</p>
      <button class="boton secundario" type="button" onclick='editarMascotaCliente(${JSON.stringify(mascota)})'>Editar</button>
    </article>
  `).join('');
};

const cargarVeterinariosPortal = async () => {
  const respuesta = await fetch(`${API_BASE_URL}/veterinarios`);
  const veterinarios = await respuesta.json();
  const select = document.getElementById('cita_veterinario');
  select.innerHTML = '<option value="">Seleccione un veterinario</option>' + veterinarios.map(veterinario =>
    `<option value="${veterinario.id_veterinario}">${veterinario.nombre} - ${veterinario.especialidad}</option>`
  ).join('');
};

const cargarCitas = async () => {
  const respuesta = await fetch(`${API_PORTAL}/mis-citas`, { headers: obtenerHeadersAuth() });
  const citas = await respuesta.json();
  if (!respuesta.ok) throw new Error(citas.mensaje || 'No se pudieron cargar las citas');

  if (!citas.length) {
    listaCitasCliente.innerHTML = '<p class="sin-datos">Aun no tienes citas registradas.</p>';
    return;
  }

  listaCitasCliente.innerHTML = citas.map(cita => `
    <article class="tarjeta tarjeta-compacta cita-card">
      <div>
        <span class="estado ${cita.estado}">${cita.estado}</span>
        <h3>${String(cita.fecha).slice(0, 10)} - ${cita.hora}</h3>
        <p><strong>Mascota:</strong> ${cita.nombre_mascota}</p>
        <p><strong>Veterinario:</strong> ${cita.nombre_veterinario}</p>
        <p>${cita.motivo}</p>
      </div>
      ${cita.estado === 'pendiente'
        ? `<button class="boton peligro" type="button" onclick="cancelarCitaCliente(${cita.id_cita})">Cancelar cita</button>`
        : ''}
    </article>
  `).join('');
};

const cargarTratamientos = async () => {
  const respuesta = await fetch(`${API_PORTAL}/mis-tratamientos`, { headers: obtenerHeadersAuth() });
  const tratamientos = await respuesta.json();
  if (!respuesta.ok) throw new Error(tratamientos.mensaje || 'No se pudieron cargar los tratamientos');

  if (!tratamientos.length) {
    listaTratamientosCliente.innerHTML = '<p class="sin-datos">Aun no hay tratamientos registrados para esta mascota.</p>';
    return;
  }

  listaTratamientosCliente.innerHTML = tratamientos.map(tratamiento => `
    <article class="tarjeta tarjeta-compacta tratamiento-cliente-card">
      <span class="icono">T</span>
      <h3>${tratamiento.nombre_mascota}</h3>
      <p><strong>Tratamiento:</strong> ${tratamiento.nombre}</p>
      <p>${tratamiento.descripcion}</p>
      <p><strong>Costo:</strong> Q ${Number(tratamiento.costo).toFixed(2)}</p>
      <p><strong>Fecha:</strong> ${tratamiento.fecha ? String(tratamiento.fecha).slice(0, 10) : 'No registrada'}</p>
    </article>
  `).join('');
};

window.editarMascotaCliente = (mascota) => {
  document.getElementById('id_mascota_cliente').value = mascota.id_mascota;
  document.getElementById('mascota_nombre').value = mascota.nombre;
  document.getElementById('mascota_especie').value = mascota.especie;
  document.getElementById('mascota_raza').value = mascota.raza;
  document.getElementById('mascota_edad').value = mascota.edad;
  document.getElementById('mascota_sexo').value = mascota.sexo;
  document.getElementById('mascotas').scrollIntoView({ behavior: 'smooth' });
};

window.cancelarCitaCliente = async (id) => {
  if (!confirm('Desea cancelar esta cita pendiente?')) return;
  const respuesta = await fetch(`${API_PORTAL}/mis-citas/${id}/cancelar`, {
    method: 'PUT',
    headers: obtenerHeadersAuth()
  });
  const datos = await respuesta.json();
  mostrarMensajePortal(datos.mensaje, respuesta.ok ? 'exito' : 'error');
  if (respuesta.ok) cargarCitas();
};

formMascotaCliente.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = document.getElementById('id_mascota_cliente').value;
  const payload = {
    nombre: document.getElementById('mascota_nombre').value.trim(),
    especie: document.getElementById('mascota_especie').value.trim(),
    raza: document.getElementById('mascota_raza').value.trim(),
    edad: Number(document.getElementById('mascota_edad').value),
    sexo: document.getElementById('mascota_sexo').value
  };

  const respuesta = await fetch(id ? `${API_PORTAL}/mis-mascotas/${id}` : `${API_PORTAL}/mis-mascotas`, {
    method: id ? 'PUT' : 'POST',
    headers: obtenerHeadersAuth(),
    body: JSON.stringify(payload)
  });
  const datos = await respuesta.json();
  mostrarMensajePortal(datos.mensaje, respuesta.ok ? 'exito' : 'error');
  if (respuesta.ok) {
    limpiarMascotaCliente();
    cargarMascotas();
  }
});

formCitaCliente.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const payload = {
    fecha: document.getElementById('cita_fecha').value,
    hora: document.getElementById('cita_hora').value,
    motivo: document.getElementById('cita_motivo').value.trim(),
    id_mascota: Number(document.getElementById('cita_mascota').value),
    id_veterinario: Number(document.getElementById('cita_veterinario').value)
  };

  const respuesta = await fetch(`${API_PORTAL}/mis-citas`, {
    method: 'POST',
    headers: obtenerHeadersAuth(),
    body: JSON.stringify(payload)
  });
  const datos = await respuesta.json();
  mostrarMensajePortal(datos.mensaje, respuesta.ok ? 'exito' : 'error');
  if (respuesta.ok) {
    mostrarMensajePortal('Tu solicitud de cita fue registrada correctamente. La veterinaria revisara tu solicitud.', 'exito');
    formCitaCliente.reset();
    cargarCitas();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('cliente')) return;
  document.getElementById('btnLimpiarMascotaCliente').addEventListener('click', limpiarMascotaCliente);
  Promise.all([cargarPerfil(), cargarMascotas(), cargarVeterinariosPortal(), cargarCitas(), cargarTratamientos()])
    .catch(error => mostrarMensajePortal(error.message, 'error'));
});
