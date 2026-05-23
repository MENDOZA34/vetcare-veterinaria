const express = require('express');
const router = express.Router();
const tratamientosController = require('../controllers/tratamientos.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, permitirRoles('administrador', 'recepcionista', 'veterinario'), tratamientosController.listarTratamientos);
router.get('/:id', verificarToken, permitirRoles('administrador', 'recepcionista', 'veterinario'), tratamientosController.obtenerTratamientoPorId);
router.post('/', verificarToken, permitirRoles('administrador', 'recepcionista', 'veterinario'), tratamientosController.crearTratamiento);
router.put('/:id', verificarToken, permitirRoles('administrador', 'recepcionista', 'veterinario'), tratamientosController.actualizarTratamiento);
router.delete('/:id', verificarToken, permitirRoles('administrador'), tratamientosController.eliminarTratamiento);

module.exports = router;
