const express = require("express")
const Joi = require("joi")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { AppointmentController } = require("../controller/AppointmentController")

const router = express.Router()

// Aplicar autenticação em todas as rotas
router.use(authenticateToken)

// GET /api/appointments - Listar consultas
router.get("/", AppointmentController.getAllAppointements)

// PUT /api/appointments/:id/status - Atualizar status da consulta
router.put("/:id/status", AppointmentController.updatePatientAppoinmentsStatus)

// DELETE /api/appointments/:id - Cancelar consulta (apenas recepcionista)
router.delete("/:id", authorizeRoles("RECEPTIONIST"), AppointmentController.cancelPatientAppointment)

module.exports = router
