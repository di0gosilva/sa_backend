require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cookieParser = require("cookie-parser")

// Importar rotas
const authRoutes = require("./routes/auth")
const doctorRoutes = require("./routes/doctors")
const appointmentRoutes = require("./routes/appointments")
const scheduleRoutes = require("./routes/schedules")
const publicRoutes = require("./routes/public")

// Importar jobs
const reminderJob = require("./jobs/reminderJob")

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de segurança
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Permitir cookies e credenciais
}))
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: "Muitas tentativas, tente novamente em 15 minutos",
})
app.use(limiter)

// Middleware para parsing JSON
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Rotas
app.use("/api/auth", authRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/schedules", scheduleRoutes)
app.use("/api/public", publicRoutes)

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Algo deu errado!",
    message: process.env.NODE_ENV === "development" ? err.message : "Erro interno do servidor",
  })
})

// Rota 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)

  // Iniciar job de lembretes
  reminderJob.start()
  console.log("📧 Job de lembretes iniciado")
})

module.exports = app
