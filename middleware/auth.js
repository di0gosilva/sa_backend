const jwt = require("jsonwebtoken")
const prisma = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { doctor: true },
    })

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado" })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  authorizeRoles,
}
