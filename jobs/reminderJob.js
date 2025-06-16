const cron = require("node-cron")
const prisma = require("../config/database")
const emailService = require("../services/emailService")

class ReminderJob {
  start() {
    // Executa a cada 30 minutos
    cron.schedule("*/30 * * * *", async () => {
      console.log("🔄 Executando job de lembretes...")
      await this.sendReminders()
    })
  }

  async sendReminders() {
    try {
      const reminderHours = Number.parseInt(process.env.REMINDER_HOURS_BEFORE) || 24

      // Calcular o intervalo de tempo para envio de lembretes
      const now = new Date()
      const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60 * 1000)

      // Buscar consultas que precisam de lembrete
      const appointmentsToRemind = await prisma.appointment.findMany({
        where: {
          status: "AGENDADA",
          lembreteEnviado: false,
          data: {
            gte: now,
            lte: reminderTime,
          },
        },
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

      console.log(`📧 Encontradas ${appointmentsToRemind.length} consultas para lembrete`)

      for (const appointment of appointmentsToRemind) {
        try {
          await emailService.sendAppointmentReminder({
            patientName: appointment.nomePaciente,
            patientEmail: appointment.emailPaciente,
            doctorName: appointment.medico.user.nome,
            appointmentDate: appointment.data,
            appointmentId: appointment.id,
          })

          // Marcar lembrete como enviado
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { lembreteEnviado: true },
          })

          console.log(`✅ Lembrete enviado para ${appointment.emailPaciente}`)
        } catch (error) {
          console.error(`❌ Erro ao enviar lembrete para ${appointment.emailPaciente}:`, error)
        }
      }
    } catch (error) {
      console.error("❌ Erro no job de lembretes:", error)
    }
  }
}

module.exports = new ReminderJob()
