const express = require("express")
const Joi = require("joi")
const prisma = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Aplicar autenticação em todas as rotas
router.use(authenticateToken)

// GET /api/appointments - Listar consultas
router.get("/", async (req, res) => {
  try {
    const { status, date, medicoId } = req.query
    const { user } = req

    const whereClause = {}

    // Filtros baseados no papel do usuário
    if (user.role === "DOCTOR") {
      whereClause.medicoId = user.doctor.id
    } else if (medicoId) {
      whereClause.medicoId = medicoId
    }

    // Filtros adicionais
    if (status) {
      whereClause.status = status
    }

    if (date) {
      const selectedDate = new Date(date)
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      whereClause.data = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const appointments = await prisma.appointment.findMany({
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
      orderBy: [{ data: "asc" }, { hora: "asc" }],
    })

    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      nomePaciente: appointment.nomePaciente,
      emailPaciente: appointment.emailPaciente,
      telefone: appointment.telefone,
      data: appointment.data,
      hora: appointment.hora,
      status: appointment.status,
      medico: {
        id: appointment.medico.id,
        nome: appointment.medico.user.nome,
        especialidade: appointment.medico.especialidade,
      },
      lembreteEnviado: appointment.lembreteEnviado,
      createdAt: appointment.createdAt,
    }))

    res.json(formattedAppointments)
  } catch (error) {
    console.error("Erro ao buscar consultas:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// PUT /api/appointments/:id/status - Atualizar status da consulta
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["AGENDADA", "CANCELADA", "REALIZADA"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        medico: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!appointment) {
      return res.status(404).json({ error: "Consulta não encontrada" })
    }

    // Verificar permissões
    if (req.user.role === "DOCTOR" && appointment.medicoId !== req.user.doctor.id) {
      return res.status(403).json({ error: "Acesso negado" })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
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
    })

    res.json({
      message: "Status atualizado com sucesso",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// DELETE /api/appointments/:id - Cancelar consulta (apenas recepcionista)
router.delete("/:id", authorizeRoles("RECEPTIONIST"), async (req, res) => {
  try {
    const { id } = req.params

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return res.status(404).json({ error: "Consulta não encontrada" })
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELADA" },
    })

    res.json({ message: "Consulta cancelada com sucesso" })
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

module.exports = router
