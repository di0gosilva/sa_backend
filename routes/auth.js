const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const { AuthController } = require("../controller/AuthController")

const router = express.Router()

// POST /api/auth/login
router.post("/login", AuthController.login)
//POST /api/auth/logout
router.post("/logout", AuthController.logout)
// POST /api/auth/register
router.post("/register", AuthController.register)

// GET /api/auth/me
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { senha: _, ...userWithoutPassword } = req.user
    res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

module.exports = router
