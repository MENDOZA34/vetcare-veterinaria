const API_INVENTARIO = `${API_BASE_URL}/inventario`;

const formInventario = document.getElementById('formInventario');
const tablaInventario = document.getElementById('tablaInventario');
const mensajeInventario = document.getElementById('mensajeInventario');
const btnGuardarInventario = document.getElementById('btnGuardarInventario');

let productosInventario = [];

const escaparHtml = (valor = '') => String(valor)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const mostrarMensajeInventario = (texto, tipo = 'exito') => {
  mensajeInventario.textContent = texto;
  mensajeInventario.className = `mensaje ${tipo}`;
  mostrarAlertaGlobal(texto, tipo);
};

const limpiarInventario = () => {
  formInventario.reset();
  document.getElementById('id_inventario').value = '';
  document.getElementById('estado').value = 'Disponible';
  btnGuardarInventario.textContent = 'Guardar producto';
};

const renderInventario = () => {
  if (!productosInventario.length) {
    tablaInventario.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay productos registrados.</td></tr>';
    return;
  }

  tablaInventario.innerHTML = productosInventario.map((producto) => `
    <tr>
      <td>${producto.id_inventario}</td>
      <td>${escaparHtml(producto.nombre_producto)}</td>
      <td>${escaparHtml(producto.categoria)}</td>
      <td>${producto.cantidad}</td>
      <td>Q ${Number(producto.precio_unitario).toFixed(2)}</td>
      <td><span class="estado">${escaparHtml(producto.estado)}</span></td>
      <td class="acciones-tabla">
        <button class="boton secundario" type="button" data-accion="editar" data-id="${producto.id_inventario}">Editar</button>
        <button class="boton peligro" type="button" data-accion="eliminar" data-id="${producto.id_inventario}">Eliminar</button>
      </td>
    </tr>
  `).join('');
};

const listarInventario = async () => {
  tablaInventario.innerHTML = '<tr><td colspan="7" class="sin-datos">Cargando inventario...</td></tr>';
  try {
    const respuesta = await fetch(API_INVENTARIO, { headers: obtenerHeadersAuth() });
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No se pudo cargar el inventario');
    }
    productosInventario = datos;
    renderInventario();
  } catch (error) {
    productosInventario = [];
    renderInventario();
    mostrarMensajeInventario(error.message || 'No se pudo conectar con el sistema.', 'error');
  }
};

const editarInventario = (id) => {
  const producto = productosInventario.find((item) => Number(item.id_inventario) === Number(id));
  if (!producto) return;

  document.getElementById('id_inventario').value = producto.id_inventario;
  document.getElementById('nombre_producto').value = producto.nombre_producto;
  document.getElementById('categoria').value = producto.categoria;
  document.getElementById('descripcion').value = producto.descripcion || '';
  document.getElementById('cantidad').value = producto.cantidad;
  document.getElementById('precio_unitario').value = producto.precio_unitario;
  document.getElementById('estado').value = producto.estado;
  btnGuardarInventario.textContent = 'Actualizar producto';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const eliminarInventario = async (id) => {
  if (!confirm('Desea eliminar este producto?')) return;

  try {
    const respuesta = await fetch(`${API_INVENTARIO}/${id}`, {
      method: 'DELETE',
      headers: obtenerHeadersAuth()
    });
    const datos = await respuesta.json();
    mostrarMensajeInventario(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarInventario();
      listarInventario();
    }
  } catch (error) {
    mostrarMensajeInventario('No se pudo conectar con el sistema.', 'error');
  }
};

formInventario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = document.getElementById('id_inventario').value;
  const producto = {
    nombre_producto: document.getElementById('nombre_producto').value.trim(),
    categoria: document.getElementById('categoria').value,
    descripcion: document.getElementById('descripcion').value.trim(),
    cantidad: Number(document.getElementById('cantidad').value),
    precio_unitario: Number(document.getElementById('precio_unitario').value),
    estado: document.getElementById('estado').value
  };

  btnGuardarInventario.disabled = true;
  btnGuardarInventario.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(id ? `${API_INVENTARIO}/${id}` : API_INVENTARIO, {
      method: id ? 'PUT' : 'POST',
      headers: obtenerHeadersAuth(),
      body: JSON.stringify(producto)
    });
    const datos = await respuesta.json();
    mostrarMensajeInventario(datos.mensaje, respuesta.ok ? 'exito' : 'error');
    if (respuesta.ok) {
      limpiarInventario();
      listarInventario();
    }
  } catch (error) {
    mostrarMensajeInventario('No se pudo conectar con el sistema.', 'error');
  } finally {
    btnGuardarInventario.disabled = false;
    btnGuardarInventario.textContent = document.getElementById('id_inventario').value ? 'Actualizar producto' : 'Guardar producto';
  }
});

tablaInventario.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  if (boton.dataset.accion === 'editar') {
    editarInventario(boton.dataset.id);
  }
  if (boton.dataset.accion === 'eliminar') {
    eliminarInventario(boton.dataset.id);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRutaPorRol('administrador')) return;
  document.getElementById('btnLimpiarInventario').addEventListener('click', limpiarInventario);
  limpiarInventario();
  listarInventario();
});
