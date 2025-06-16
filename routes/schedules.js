const express = require("express")
const Joi = require("joi")
const prisma = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Aplicar autenticação em todas as rotas
router.use(authenticateToken)

// Schema de validação para horário
const scheduleSchema = Joi.object({
  diaSemana: Joi.number().integer().min(0).max(6).required(),
  horaInicio: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  horaFim: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
})

// GET /api/schedules - Listar horários
router.get("/", async (req, res) => {
  try {
    const { user } = req
    const { medicoId } = req.query

    const whereClause = {}

    if (user.role === "DOCTOR") {
      whereClause.medicoId = user.doctor.id
    } else if (medicoId) {
      whereClause.medicoId = medicoId
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        medico: {
          include: {
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    })

    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      diaSemana: schedule.diaSemana,
      horaInicio: schedule.horaInicio,
      horaFim: schedule.horaFim,
      medico: {
        id: schedule.medico.id,
        nome: schedule.medico.user.nome,
      },
    }))

    res.json(formattedSchedules)
  } catch (error) {
    console.error("Erro ao buscar horários:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// POST /api/schedules - Criar horário (apenas médicos)
router.post("/", authorizeRoles("DOCTOR"), async (req, res) => {
  try {
    const { error } = scheduleSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { diaSemana, horaInicio, horaFim } = req.body
    const { user } = req

    // Validar se hora fim é maior que hora início
    if (horaInicio >= horaFim) {
      return res.status(400).json({ error: "Hora de fim deve ser maior que hora de início" })
    }

    // Verificar conflitos de horário
    const conflictingSchedule = await prisma.schedule.findFirst({
      where: {
        medicoId: user.doctor.id,
        diaSemana,
        OR: [
          {
            AND: [{ horaInicio: { lte: horaInicio } }, { horaFim: { gt: horaInicio } }],
          },
          {
            AND: [{ horaInicio: { lt: horaFim } }, { horaFim: { gte: horaFim } }],
          },
          {
            AND: [{ horaInicio: { gte: horaInicio } }, { horaFim: { lte: horaFim } }],
          },
        ],
      },
    })

    if (conflictingSchedule) {
      return res.status(400).json({ error: "Conflito de horário detectado" })
    }

    const schedule = await prisma.schedule.create({
      data: {
        medicoId: user.doctor.id,
        diaSemana,
        horaInicio,
        horaFim,
      },
    })

    res.status(201).json({
      message: "Horário criado com sucesso",
      schedule,
    })
  } catch (error) {
    console.error("Erro ao criar horário:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// PUT /api/schedules/:id - Atualizar horário
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { error } = scheduleSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { diaSemana, horaInicio, horaFim } = req.body
    const { user } = req

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    })

    if (!schedule) {
      return res.status(404).json({ error: "Horário não encontrado" })
    }

    // Verificar permissões
    if (user.role === "DOCTOR" && schedule.medicoId !== user.doctor.id) {
      return res.status(403).json({ error: "Acesso negado" })
    }

    // Validar se hora fim é maior que hora início
    if (horaInicio >= horaFim) {
      return res.status(400).json({ error: "Hora de fim deve ser maior que hora de início" })
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        diaSemana,
        horaInicio,
        horaFim,
      },
    })

    res.json({
      message: "Horário atualizado com sucesso",
      schedule: updatedSchedule,
    })
  } catch (error) {
    console.error("Erro ao atualizar horário:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// DELETE /api/schedules/:id - Deletar horário
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { user } = req

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    })

    if (!schedule) {
      return res.status(404).json({ error: "Horário não encontrado" })
    }

    // Verificar permissões
    if (user.role === "DOCTOR" && schedule.medicoId !== user.doctor.id) {
      return res.status(403).json({ error: "Acesso negado" })
    }

    await prisma.schedule.delete({
      where: { id },
    })

    res.json({ message: "Horário deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar horário:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

module.exports = router
