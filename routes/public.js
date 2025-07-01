const express = require("express")
const { PatientController } = require("../controller/PatientController")

const router = express.Router()

// GET /api/public/doctors - Listar médicos disponíveis
router.get("/doctors", PatientController.getAllDoctors)

// GET /api/public/doctors/:id/availability - Verificar disponibilidade do médico
router.get("/doctors/:id/availability", PatientController.getDoctorSchedule)

// POST /api/public/appointments - Agendar consulta
router.post("/appointments", PatientController.setSchedule)

module.exports = router
