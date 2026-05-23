const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, permitirRoles('administrador'), inventarioController.listarInventario);
router.get('/:id', verificarToken, permitirRoles('administrador'), inventarioController.obtenerInventarioPorId);
router.post('/', verificarToken, permitirRoles('administrador'), inventarioController.crearInventario);
router.put('/:id', verificarToken, permitirRoles('administrador'), inventarioController.actualizarInventario);
router.delete('/:id', verificarToken, permitirRoles('administrador'), inventarioController.eliminarInventario);

module.exports = router;
