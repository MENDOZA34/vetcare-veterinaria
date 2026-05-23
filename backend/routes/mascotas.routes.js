const express = require('express');
const router = express.Router();
const mascotasController = require('../controllers/mascotas.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/', mascotasController.listarMascotas);
router.get('/:id', mascotasController.obtenerMascotaPorId);
router.post('/', verificarToken, permitirRoles('administrador', 'recepcionista'), mascotasController.crearMascota);
router.put('/:id', verificarToken, permitirRoles('administrador', 'recepcionista'), mascotasController.actualizarMascota);
router.delete('/:id', verificarToken, permitirRoles('administrador'), mascotasController.eliminarMascota);

module.exports = router;
