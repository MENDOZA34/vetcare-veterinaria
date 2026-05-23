const express = require('express');
const router = express.Router();
const vacunasController = require('../controllers/vacunas.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, permitirRoles('administrador'), vacunasController.listarVacunas);
router.get('/:id', verificarToken, permitirRoles('administrador'), vacunasController.obtenerVacunaPorId);
router.post('/', verificarToken, permitirRoles('administrador'), vacunasController.crearVacuna);
router.put('/:id', verificarToken, permitirRoles('administrador'), vacunasController.actualizarVacuna);
router.delete('/:id', verificarToken, permitirRoles('administrador'), vacunasController.eliminarVacuna);

module.exports = router;
