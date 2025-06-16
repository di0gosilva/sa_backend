const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
})

// Middleware para logs de queries em desenvolvimento
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    console.log("Query: " + e.query)
    console.log("Duration: " + e.duration + "ms")
  })
}

module.exports = prisma
