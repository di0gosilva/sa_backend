const express = require("express")
const Joi = require("joi")
const prisma = require("../config/database")
const emailService = require("../services/emailService")

const router = express.Router()

// Schema de validação para agendamento
const appointmentSchema = Joi.object({
  nomePaciente: Joi.string().min(2).required(),
  emailPaciente: Joi.string().email().required(),
  telefone: Joi.string().optional(),
  medicoId: Joi.string().uuid().required(),
  data: Joi.date().min("now").required(),
  hora: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
})

// GET /api/public/doctors - Listar médicos disponíveis
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            nome: true,
          },
        },
      },
    })

    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      nome: doctor.user.nome,
      especialidade: doctor.especialidade,
      crm: doctor.crm,
    }))

    res.json(formattedDoctors)
  } catch (error) {
    console.error("Erro ao buscar médicos:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// GET /api/public/doctors/:id/availability - Verificar disponibilidade do médico
router.get("/doctors/:id/availability", async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ error: "Data é obrigatória" })
    }

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()

    // Buscar horários do médico para o dia da semana
    const schedules = await prisma.schedule.findMany({
      where: {
        medicoId: id,
        diaSemana: dayOfWeek,
      },
    })

    if (schedules.length === 0) {
      return res.json({ availableSlots: [] })
    }

    // Buscar consultas já agendadas para a data
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        medicoId: id,
        data: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "AGENDADA",
      },
    })

    // Gerar slots disponíveis
    const availableSlots = []

    for (const schedule of schedules) {
      const startTime = schedule.horaInicio
      const endTime = schedule.horaFim

      const slots = generateTimeSlots(startTime, endTime, 30) // 30 min por consulta

      for (const slot of slots) {
        const isBooked = bookedAppointments.some((appointment) => {
          const appointmentTime = appointment.hora.toTimeString().slice(0, 5)
          return appointmentTime === slot
        })

        if (!isBooked) {
          availableSlots.push(slot)
        }
      }
    }

    res.json({ availableSlots })
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// POST /api/public/appointments - Agendar consulta
router.post("/appointments", async (req, res) => {
  try {
    const { error } = appointmentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { nomePaciente, emailPaciente, telefone, medicoId, data, hora } = req.body

    // Verificar se o médico existe
    const doctor = await prisma.doctor.findUnique({
      where: { id: medicoId },
      include: { user: true },
    })

    if (!doctor) {
      return res.status(404).json({ error: "Médico não encontrado" })
    }

    // Criar data/hora completa
    const appointmentDate = new Date(data)
    const [hours, minutes] = hora.split(":")
    appointmentDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

    // Verificar se o horário está disponível
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        medicoId,
        data: appointmentDate,
        status: "AGENDADA",
      },
    })

    if (existingAppointment) {
      return res.status(400).json({ error: "Horário não disponível" })
    }

    // Criar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        nomePaciente,
        emailPaciente,
        telefone,
        medicoId,
        data: appointmentDate,
        hora: appointmentDate,
      },
      include: {
        medico: {
          include: {
            user: true,
          },
        },
      },
    })

    // Enviar email de confirmação
    try {
      await emailService.sendAppointmentConfirmation({
        patientName: nomePaciente,
        patientEmail: emailPaciente,
        doctorName: appointment.medico.user.nome,
        appointmentDate: appointmentDate,
        appointmentId: appointment.id,
      })
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError)
      // Não falhar o agendamento por causa do email
    }

    res.status(201).json({
      message: "Consulta agendada com sucesso",
      appointment: {
        id: appointment.id,
        nomePaciente: appointment.nomePaciente,
        data: appointment.data,
        hora: appointment.hora,
        medico: appointment.medico.user.nome,
      },
    })
  } catch (error) {
    console.error("Erro ao agendar consulta:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Função auxiliar para gerar slots de tempo
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = []
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)

  const current = new Date(start)

  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5))
    current.setMinutes(current.getMinutes() + intervalMinutes)
  }

  return slots
}

module.exports = router
