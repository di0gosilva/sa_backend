const { PrismaClient } = require("@prisma/client")

let prisma

if (!global._prisma) {
  global._prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  })

  if (process.env.NODE_ENV === "development") {
    global._prisma.$on("query", (e) => {
      console.log("Query: " + e.query)
      console.log("Duration: " + e.duration + "ms")
    })
  }
}

prisma = global._prisma

module.exports = prisma
