const express = require("express")
const Joi = require("joi")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { ScheduleController } = require("../controller/ScheduleController.js")

const router = express.Router()

// Aplicar autenticação em todas as rotas
router.use(authenticateToken)

// GET /api/schedules - Listar horários
router.get("/", ScheduleController.getSchedules)

// POST /api/schedules - Criar horário (apenas médicos)
router.post("/", authorizeRoles("DOCTOR"), ScheduleController.setSchedule)

// PUT /api/schedules/:id - Atualizar horário
router.put("/:id", ScheduleController.updateSchedule)

// DELETE /api/schedules/:id - Deletar horário
router.delete("/:id", ScheduleController.deleteSchedule)

module.exports = router
