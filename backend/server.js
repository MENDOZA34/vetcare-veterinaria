const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clientesRoutes = require('./routes/clientes.routes');
const mascotasRoutes = require('./routes/mascotas.routes');
const veterinariosRoutes = require('./routes/veterinarios.routes');
const citasRoutes = require('./routes/citas.routes');
const tratamientosRoutes = require('./routes/tratamientos.routes');
const historialRoutes = require('./routes/historial.routes');
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const portalRoutes = require('./routes/portal.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const vacunasRoutes = require('./routes/vacunas.routes');
const facturacionRoutes = require('./routes/facturacion.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Veterinaria San Patitas funcionando correctamente',
    version: '1.0.0',
    rutas: [
      '/api/clientes',
      '/api/mascotas',
      '/api/veterinarios',
      '/api/citas',
      '/api/tratamientos',
      '/api/historial',
      '/api/auth',
      '/api/usuarios',
      '/api/portal',
      '/api/inventario',
      '/api/vacunas',
      '/api/facturacion',
      '/api/reportes'
    ]
  });
});

app.use('/api/clientes', clientesRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/veterinarios', veterinariosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/tratamientos', tratamientosRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/vacunas', vacunasRoutes);
app.use('/api/facturacion', facturacionRoutes);
app.use('/api/reportes', reportesRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
