const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', clientesController.listarClientes);
router.get('/:id', clientesController.obtenerClientePorId);
router.post('/', verificarToken, permitirRoles('administrador', 'recepcionista'), clientesController.crearCliente);
router.put('/:id', verificarToken, permitirRoles('administrador', 'recepcionista'), clientesController.actualizarCliente);
router.delete('/:id', verificarToken, permitirRoles('administrador'), clientesController.eliminarCliente);

module.exports = router;
