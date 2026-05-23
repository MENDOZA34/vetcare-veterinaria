const API_FACTURACION = `${API_BASE_URL}/facturacion`;
const API_CLIENTES_FACTURACION = `${API_BASE_URL}/clientes`;

const formFactura = document.getElementById('formFactura');
const tablaFacturas = document.getElementById('tablaFacturas');
const tablaDetallesFactura = document.getElementById('tablaDetallesFactura');
const mensajeFactura = document.getElementById('mensajeFactura');
const totalFactura = document.getElementById('totalFactura');
const btnGuardarFactura = document.getElementById('btnGuardarFactura');

let facturas = [];

const escaparHtml = (valor = '') => String(valor)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const mostrarMensajeFactura = (texto, tipo = 'exito') => {
  mensajeFactura.textContent = texto;
  mensajeFactura.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const formatearMoneda = (valor) => `Q ${Number(valor || 0).toFixed(2)}`;

const fechaActual = () => new Date().toISOString().slice(0, 10);

const recalcularTotal = () => {
  let total = 0;
  tablaDetallesFactura.querySelectorAll('tr').forEach((fila) => {
    const cantidad = Number(fila.querySelector('.detalle-cantidad').value || 0);
    const precio = Number(fila.querySelector('.detalle-precio').value || 0);
    const subtotal = cantidad * precio;
    fila.querySelector('.detalle-subtotal').textContent = formatearMoneda(subtotal);
    total += subtotal;
  });
  totalFactura.textContent = formatearMoneda(total);
};

const agregarDetalle = (detalle = {}) => {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td><input type="text" class="detalle-concepto" value="${escaparHtml(detalle.concepto || '')}" required></td>
    <td><input type="number" class="detalle-cantidad" min="1" value="${detalle.cantidad || 1}" required></td>
    <td><input type="number" class="detalle-precio" min="0" step="0.01" value="${detalle.precio_unitario || 0}" required></td>
    <td class="detalle-subtotal">${formatearMoneda(detalle.subtotal || 0)}</td>
    <td class="acciones-tabla"><button type="button" class="boton peligro btn-quitar-detalle">Quitar</button></td>
  `;
  tablaDetallesFactura.appendChild(fila);
  recalcularTotal();
};

const obtenerDetallesFormulario = () => Array.from(tablaDetallesFactura.querySelectorAll('tr')).map((fila) => ({
  concepto: fila.querySelector('.detalle-concepto').value.trim(),
  cantidad: Number(fila.querySelector('.detalle-cantidad').value),
  precio_unitario: Number(fila.querySelector('.detalle-precio').value)
}));

const limpiarFactura = () => {
  formFactura.reset();
  document.getElementById('id_factura').value = '';
  document.getElementById('fecha').value = fechaActual();
  document.getElementById('estado').value = 'Pendiente';
  tablaDetallesFactura.innerHTML = '';
  agregarDetalle();
  btnGuardarFactura.textContent = 'Guardar factura';
};

const cargarClientes = async () => {
  const respuesta = await fetch(API_CLIENTES_FACTURACION);
  const clientes = await respuesta.json();
  document.getElementById('id_cliente').innerHTML = '<option value="">Seleccione un cliente</option>' + clientes.map((cliente) =>
    `<option value="${cliente.id_cliente}">${escaparHtml(cliente.nombre)}</option>`
  ).join('');
};

const renderFacturas = () => {
  if (!facturas.length) {
    tablaFacturas.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay facturas registradas.</td></tr>';
    return;
  }

  tablaFacturas.innerHTML = facturas.map((factura) => `
    <tr>
      <td>${factura.id_factura}</td>
      <td>${String(factura.fecha).slice(0, 10)}</td>
      <td>${escaparHtml(factura.nombre_cliente)}</td>
      <td>${formatearMoneda(factura.total)}</td>
      <td><span class="estado">${escaparHtml(factura.estado)}</span></td>
      <td>${factura.total_detalles || 0}</td>
      <td class="acciones-tabla">
        <button class="boton secundario" type="button" data-accion="editar" data-id="${factura.id_factura}">Editar</button>
        <button class="boton secundario" type="button" data-accion="anular" data-id="${factura.id_factura}">Anular</button>
        <button class="boton peligro" type="button" data-accion="eliminar" data-id="${factura.id_factura}">Eliminar</button>
      </td>
    </tr>
  `).join('');
};

const listarFacturas = async () => {
  tablaFacturas.innerHTML = '<tr><td colspan="7" class="sin-datos">Cargando facturas...</td></tr>';
  try {
    const respuesta = await fetch(API_FACTURACION, { headers: obtenerHeadersAuth() });
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No se pudieron cargar las facturas');
    }
    facturas = datos;
    renderFacturas();
  } catch (error) {
    facturas = [];
    renderFacturas();
    mostrarMensajeFactura(error.message || 'No se pudo conectar con el sistema.', 'error');
  }
};

const cargarFacturaEnFormulario = async (id) => {
  try {
    const respuesta = await fetch(`${API_FACTURACION}/${id}`, { headers: obtenerHeadersAuth() });
    const factura = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(factura.mensaje || 'No se pudo cargar la factura');
    }

    document.getElementById('id_factura').value = factura.id_factura;
    document.getElementById('fecha').value = String(factura.fecha).slice(0, 10);
    document.getElementById('id_cliente').value = factura.id_cliente;
    document.getElementById('estado').value = factura.estado;
    tablaDetallesFactura.innerHTML = '';
    factura.detalles.forEach(agregarDetalle);
    btnGuardarFactura.textContent = 'Actualizar factura';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    mostrarMensajeFactura(error.message || 'No se pudo conectar con el sistema.', 'error');
  }
};

const anularFactura = async (id) => {
  if (!confirm('Desea anular esta factura?')) return;

  try {
    const respuestaDetalle = await fetch(`${API_FACTURACION}/${id}`, { headers: obtenerHeadersAuth() });
    const factura = await respuestaDetalle.json();
    if (!respuestaDetalle.ok) {
      throw new Error(factura.mensaje || 'No se pudo cargar la factura');
    }

    const respuesta = await fetch(`${API_FACTURACION}/${id}`, {
      method: 'PUT',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify({
        fecha: String(factura.fecha).slice(0, 10),
        id_cliente: factura.id_cliente,
        estado: 'Anulada',
        detalles: factura.detalles
      })
    });
    const datos = await respuesta.json();
    mostrarMensajeFactura(respuesta.ok ? 'Factura anulada correctamente' : datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      listarFacturas();
    }
  } catch (error) {
    mostrarMensajeFactura(error.message || 'No se pudo conectar con el sistema.', 'error');
  }
};

const eliminarFactura = async (id) => {
  if (!confirm('Desea eliminar esta factura?')) return;

  try {
    const respuesta = await fetch(`${API_FACTURACION}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensajeFactura(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFactura();
      listarFacturas();
    }
  } catch (error) {
    mostrarMensajeFactura('No se pudo conectar con el sistema.', 'error');
  }
};

formFactura.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = document.getElementById('id_factura').value;
  const factura = {
    fecha: document.getElementById('fecha').value,
    id_cliente: Number(document.getElementById('id_cliente').value),
    estado: document.getElementById('estado').value,
    detalles: obtenerDetallesFormulario()
  };

  btnGuardarFactura.disabled = true;
  btnGuardarFactura.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_FACTURACION}/${id}` : API_FACTURACION, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(factura)
    });
    const datos = await respuesta.json();
    mostrarMensajeFactura(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarFactura();
      listarFacturas();
    }
  } catch (error) {
    mostrarMensajeFactura('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardarFactura.disabled = false;
    btnGuardarFactura.textContent = document.getElementById('id_factura').value ? 'Actualizar factura' : 'Guardar factura';
  }
});

tablaDetallesFactura.addEventListener('input', recalcularTotal);
tablaDetallesFactura.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.btn-quitar-detalle');
  if (!boton) return;

  if (tablaDetallesFactura.querySelectorAll('tr').length === 1) {
    mostrarMensajeFactura('La factura debe tener al menos un detalle.', 'error');
    return;
  }

  boton.closest('tr').remove();
  recalcularTotal();
});

tablaFacturas.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  if (boton.dataset.accion === 'editar') {
    cargarFacturaEnFormulario(boton.dataset.id);
  }
  if (boton.dataset.accion === 'anular') {
    anularFactura(boton.dataset.id);
  }
  if (boton.dataset.accion === 'eliminar') {
    eliminarFactura(boton.dataset.id);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  if (!protegerRutaPorRol('administrador')) return;
  document.getElementById('btnAgregarDetalle').addEventListener('click', () => agregarDetalle());
  document.getElementById('btnLimpiarFactura').addEventListener('click', limpiarFactura);
  await cargarClientes();
  limpiarFactura();
  listarFacturas();
});
