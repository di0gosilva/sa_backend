const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Joi = require("joi")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Schema de validação para login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
})

// Schema de validação para registro
const registerSchema = Joi.object({
  nome: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  role: Joi.string().valid("DOCTOR", "RECEPTIONIST").required(),
  // Campos específicos para médicos
  especialidade: Joi.string().when("role", {
    is: "DOCTOR",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  crm: Joi.string().when("role", {
    is: "DOCTOR",
    then: Joi.required().label("CRM é obrigatório para médicos"),
    otherwise: Joi.any().strip(),
  }),
})

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email, senha } = req.body

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctor: true },
    })

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.senha)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    // Gerar token JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Usar cookies seguros em produção
      maxAge: 24 * 60 * 60 * 1000, // Converter para milissegundos
      sameSite: "strict", // Proteção contra CSRF
    })

    // Remover senha da resposta
    const { senha: _, ...userWithoutPassword } = user

    res.json({
      message: "Login realizado com sucesso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

router.post("/logout", (req, res) => {
  try {
    // Limpar o cookie de autenticação
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    res.json({ message: "Logout realizado com sucesso" })
  } catch (error) {
    console.error("Erro no logout:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { nome, email, senha, role, especialidade, crm } = req.body

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" })
    }

    // Verificar CRM duplicado para médicos
    if (role === "DOCTOR" && crm) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { crm },
      })

      if (existingDoctor) {
        return res.status(400).json({ error: "CRM já cadastrado" })
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12)

    // Criar usuário e médico (se aplicável) em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          role,
        },
      })

      if (role === "DOCTOR") {
        await tx.doctor.create({
          data: {
            userId: user.id,
            especialidade: especialidade || null,
            crm,
          },
        })
      }

      return user
    })

    res.status(201).json({
      message: "Usuário criado com sucesso",
      userId: result.id,
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

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
