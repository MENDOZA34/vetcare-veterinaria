const express = require('express');
const router = express.Router();
const veterinariosController = require('../controllers/veterinarios.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', veterinariosController.listarVeterinarios);
router.get('/:id', veterinariosController.obtenerVeterinarioPorId);
router.post('/', verificarToken, permitirRoles('administrador'), veterinariosController.crearVeterinario);
router.put('/:id', verificarToken, permitirRoles('administrador'), veterinariosController.actualizarVeterinario);
router.delete('/:id', verificarToken, permitirRoles('administrador'), veterinariosController.eliminarVeterinario);

module.exports = router;
