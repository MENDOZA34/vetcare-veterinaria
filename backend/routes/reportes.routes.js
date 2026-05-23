const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

router.get('/resumen', verificarToken, permitirRoles('administrador'), reportesController.obtenerResumen);

module.exports = router;
