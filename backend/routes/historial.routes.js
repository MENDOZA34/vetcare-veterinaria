const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', historialController.listarHistoriales);
router.get('/mascota/:id_mascota', historialController.obtenerHistorialPorMascota);
router.get('/:id', historialController.obtenerHistorialPorId);
router.post('/', verificarToken, permitirRoles('administrador', 'veterinario'), historialController.crearHistorial);
router.put('/:id', verificarToken, permitirRoles('administrador', 'veterinario'), historialController.actualizarHistorial);
router.delete('/:id', verificarToken, permitirRoles('administrador'), historialController.eliminarHistorial);

module.exports = router;
