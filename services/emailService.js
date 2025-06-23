const { text } = require("express")
const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendAppointmentConfirmation({ patientName, patientEmail, doctorName, appointmentDate, appointmentId }) {
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR")
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: patientEmail,
      subject: "Confirmação de Consulta Médica",
      text: `Olá ${patientName}, sua consulta foi agendada com o Dr(a). ${doctorName} para o dia ${formattedDate} às ${formattedTime}. Código da consulta: ${appointmentId}. Chegue 15 minutos antes e traga um documento com foto.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Consulta Confirmada</h2>

          <p>Olá <strong>${patientName}</strong>,</p>

          <p>Sua consulta foi agendada com sucesso!</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Detalhes da Consulta:</h3>
            <p><strong>Médico:</strong> ${doctorName}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Horário:</strong> ${formattedTime}</p>
            <p><strong>Código:</strong> ${appointmentId}</p>
          </div>

          <p><strong>Importante:</strong></p>
          <ul>
            <li>Chegue com 15 minutos de antecedência</li>
            <li>Traga um documento com foto</li>
            <li>Você receberá um lembrete 24 horas antes da consulta</li>
          </ul>

          <p>Em caso de dúvidas, entre em contato conosco.</p>

          <p>Atenciosamente,<br>Equipe Médica</p>
        </div>
      `,
    }

    return this.transporter.sendMail(mailOptions)
  }

  async sendAppointmentReminder({ patientName, patientEmail, doctorName, appointmentDate, appointmentId }) {
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR")
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: patientEmail,
      subject: "Lembrete: Consulta Médica Amanhã",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🔔 Lembrete de Consulta</h2>

          <p>Olá <strong>${patientName}</strong>,</p>

          <p>Este é um lembrete de que você tem uma consulta médica agendada para amanhã.</p>

          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Detalhes da Consulta:</h3>
            <p><strong>Médico:</strong> ${doctorName}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Horário:</strong> ${formattedTime}</p>
            <p><strong>Código:</strong> ${appointmentId}</p>
          </div>

          <p><strong>Lembre-se:</strong></p>
          <ul>
            <li>Chegue com 15 minutos de antecedência</li>
            <li>Traga um documento com foto</li>
            <li>Traga seus exames anteriores, se houver</li>
          </ul>

          <p>Caso precise cancelar ou reagendar, entre em contato conosco o quanto antes.</p>

          <p>Atenciosamente,<br>Equipe Médica</p>
        </div>
      `,
    }

    return this.transporter.sendMail(mailOptions)
  }
}

module.exports = new EmailService()
