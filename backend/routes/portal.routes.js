const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portal.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.use(verificarToken, permitirRoles('cliente'));

router.get('/perfil', portalController.perfil);
router.get('/mis-mascotas', portalController.misMascotas);
router.post('/mis-mascotas', portalController.crearMascota);
router.put('/mis-mascotas/:id', portalController.actualizarMascota);
router.get('/mis-citas', portalController.misCitas);
router.post('/mis-citas', portalController.crearCita);
router.put('/mis-citas/:id/cancelar', portalController.cancelarCita);
router.get('/mis-tratamientos', portalController.misTratamientos);

module.exports = router;
