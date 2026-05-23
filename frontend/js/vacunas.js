const API_VACUNAS = `${API_BASE_URL}/vacunas`;

const formVacuna = document.getElementById('formVacuna');
const tablaVacunas = document.getElementById('tablaVacunas');
const mensajeVacuna = document.getElementById('mensajeVacuna');
const btnGuardarVacuna = document.getElementById('btnGuardarVacuna');

let vacunas = [];

const escaparHtml = (valor = '') => String(valor)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const mostrarMensajeVacuna = (texto, tipo = 'exito') => {
  mensajeVacuna.textContent = texto;
  mensajeVacuna.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const limpiarVacuna = () => {
  formVacuna.reset();
  document.getElementById('id_vacuna').value = '';
  document.getElementById('estado').value = 'Disponible';
  btnGuardarVacuna.textContent = 'Guardar vacuna';
};

const renderVacunas = () => {
  if (!vacunas.length) {
    tablaVacunas.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay vacunas registradas.</td></tr>';
    return;
  }

  tablaVacunas.innerHTML = vacunas.map((vacuna) => `
    <tr>
      <td>${vacuna.id_vacuna}</td>
      <td>${escaparHtml(vacuna.nombre)}</td>
      <td>${escaparHtml(vacuna.dosis || '')}</td>
      <td>${escaparHtml(vacuna.frecuencia || '')}</td>
      <td>Q ${Number(vacuna.precio).toFixed(2)}</td>
      <td><span class="estado">${escaparHtml(vacuna.estado)}</span></td>
      <td class="acciones-tabla">
        <button class="boton secundario" type="button" data-accion="editar" data-id="${vacuna.id_vacuna}">Editar</button>
        <button class="boton peligro" type="button" data-accion="eliminar" data-id="${vacuna.id_vacuna}">Eliminar</button>
      </td>
    </tr>
  `).join('');
};

const listarVacunas = async () => {
  tablaVacunas.innerHTML = '<tr><td colspan="7" class="sin-datos">Cargando vacunas...</td></tr>';
  try {
    const respuesta = await fetch(API_VACUNAS, { headers: obtenerHeadersAuth() });
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No se pudieron cargar las vacunas');
    }
    vacunas = datos;
    renderVacunas();
  } catch (error) {
    vacunas = [];
    renderVacunas();
    mostrarMensajeVacuna(error.message || 'No se pudo conectar con el sistema.', 'error');
  }
};

const editarVacuna = (id) => {
  const vacuna = vacunas.find((item) => Number(item.id_vacuna) === Number(id));
  if (!vacuna) return;

  document.getElementById('id_vacuna').value = vacuna.id_vacuna;
  document.getElementById('nombre').value = vacuna.nombre;
  document.getElementById('descripcion').value = vacuna.descripcion || '';
  document.getElementById('dosis').value = vacuna.dosis || '';
  document.getElementById('frecuencia').value = vacuna.frecuencia || '';
  document.getElementById('precio').value = vacuna.precio;
  document.getElementById('estado').value = vacuna.estado;
  btnGuardarVacuna.textContent = 'Actualizar vacuna';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const eliminarVacuna = async (id) => {
  if (!confirm('Desea eliminar esta vacuna?')) return;

  try {
    const respuesta = await fetch(`${API_VACUNAS}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensajeVacuna(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarVacuna();
      listarVacunas();
    }
  } catch (error) {
    mostrarMensajeVacuna('No se pudo conectar con el sistema.', 'error');
  }
};

formVacuna.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = document.getElementById('id_vacuna').value;
  const vacuna = {
    nombre: document.getElementById('nombre').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    dosis: document.getElementById('dosis').value.trim(),
    frecuencia: document.getElementById('frecuencia').value.trim(),
    precio: Number(document.getElementById('precio').value),
    estado: document.getElementById('estado').value
  };

  btnGuardarVacuna.disabled = true;
  btnGuardarVacuna.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_VACUNAS}/${id}` : API_VACUNAS, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(vacuna)
    });
    const datos = await respuesta.json();
    mostrarMensajeVacuna(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarVacuna();
      listarVacunas();
    }
  } catch (error) {
    mostrarMensajeVacuna('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardarVacuna.disabled = false;
    btnGuardarVacuna.textContent = document.getElementById('id_vacuna').value ? 'Actualizar vacuna' : 'Guardar vacuna';
  }
});

tablaVacunas.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  if (boton.dataset.accion === 'editar') {
    editarVacuna(boton.dataset.id);
  }
  if (boton.dataset.accion === 'eliminar') {
    eliminarVacuna(boton.dataset.id);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('administrador')) return;
  document.getElementById('btnLimpiarVacuna').addEventListener('click', limpiarVacuna);
  limpiarVacuna();
  listarVacunas();
});
