const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', citasController.listarCitas);
router.get('/:id', citasController.obtenerCitaPorId);
router.post('/', verificarToken, permitirRoles('administrador', 'recepcionista'), citasController.crearCita);
router.put('/:id', verificarToken, permitirRoles('administrador', 'recepcionista', 'veterinario'), citasController.actualizarCita);
router.delete('/:id', verificarToken, permitirRoles('administrador', 'recepcionista'), citasController.eliminarCita);

module.exports = router;
