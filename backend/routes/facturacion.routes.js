const express = require('express');
const router = express.Router();
const facturacionController = require('../controllers/facturacion.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, permitirRoles('administrador'), facturacionController.listarFacturas);
router.get('/:id', verificarToken, permitirRoles('administrador'), facturacionController.obtenerFacturaPorId);
router.post('/', verificarToken, permitirRoles('administrador'), facturacionController.crearFactura);
router.put('/:id', verificarToken, permitirRoles('administrador'), facturacionController.actualizarFactura);
router.delete('/:id', verificarToken, permitirRoles('administrador'), facturacionController.eliminarFactura);

module.exports = router;
