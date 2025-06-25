const express = require("express")
const prisma = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { DoctorController } = require("../controller/DoctorController")

const router = express.Router()

// Aplicar autenticação em todas as rotas
router.use(authenticateToken)

// GET /api/doctors - Listar médicos (apenas recepcionista)
router.get("/", authorizeRoles("RECEPTIONIST"), DoctorController.getAllDoctors)

// GET /api/doctors/:id - Buscar médico específico
router.get("/:id", DoctorController.getDoctor)

// GET /api/doctors/:id/dashboard - Dashboard do médico
router.get("/:id/dashboard", DoctorController.getDoctorAppointments)

module.exports = router
