const Joi = require("joi")
const prisma = require("../config/database")

class DoctorController {
    static async getAllDoctors(req, res) {
        try {
            const doctors = await prisma.doctor.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            appointments: {
                                where: {
                                    status: "AGENDADA",
                                },
                            },
                        },
                    },
                },
            })

            const formattedDoctors = doctors.map((doctor) => ({
                id: doctor.id,
                nome: doctor.user.nome,
                email: doctor.user.email,
                especialidade: doctor.especialidade,
                crm: doctor.crm,
                consultasAgendadas: doctor._count.appointments,
                createdAt: doctor.user.createdAt,
            }))

            res.json(formattedDoctors)
        } catch (error) {
            console.error("Erro ao buscar médicos:", error)
            res.status(500).json({ error: "Erro interno do servidor" })
        }
    }

    static async getDoctor(req, res) {
        try {
            const { id } = req.params
            const { user } = req

            // Médicos só podem ver seus próprios dados
            if (user.role === "DOCTOR" && user.doctor.id !== id) {
                return res.status(403).json({ error: "Acesso negado" })
            }

            const doctor = await prisma.doctor.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            createdAt: true,
                        },
                    },
                    schedules: {
                        orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
                    },
                    appointments: {
                        where: {
                            status: "AGENDADA",
                            data: {
                                gte: new Date(),
                            },
                        },
                        orderBy: [{ data: "asc" }, { hora: "asc" }],
                        take: 10,
                    },
                },
            })

            if (!doctor) {
                return res.status(404).json({ error: "Médico não encontrado" })
            }

            const formattedDoctor = {
                id: doctor.id,
                nome: doctor.user.nome,
                email: doctor.user.email,
                especialidade: doctor.especialidade,
                crm: doctor.crm,
                createdAt: doctor.user.createdAt,
                schedules: doctor.schedules,
                proximasConsultas: doctor.appointments,
            }

            res.json(formattedDoctor)
        } catch (error) {
            console.error("Erro ao buscar médico:", error)
            res.status(500).json({ error: "Erro interno do servidor" })
        }
    }

    static async getDoctorAppointments(req, res) {
        try {
            const { id } = req.params
            const { user } = req

            // Médicos só podem ver seu próprio dashboard
            if (user.role === "DOCTOR" && user.doctor.id !== id) {
                return res.status(403).json({ error: "Acesso negado" })
            }

            const today = new Date()
            const startOfDay = new Date(today)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(today)
            endOfDay.setHours(23, 59, 59, 999)

            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            startOfWeek.setHours(0, 0, 0, 0)

            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)
            endOfWeek.setHours(23, 59, 59, 999)

            // Consultas de hoje
            const consultasHoje = await prisma.appointment.count({
                where: {
                    medicoId: id,
                    data: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: "AGENDADA",
                },
            })

            // Consultas da semana
            const consultasSemana = await prisma.appointment.count({
                where: {
                    medicoId: id,
                    data: {
                        gte: startOfWeek,
                        lte: endOfWeek,
                    },
                    status: "AGENDADA",
                },
            })

            // Próximas consultas
            const proximasConsultas = await prisma.appointment.findMany({
                where: {
                    medicoId: id,
                    data: {
                        gte: new Date(),
                    },
                    status: "AGENDADA",
                },
                orderBy: [{ data: "asc" }, { hora: "asc" }],
                take: 5,
            })

            // Consultas por status (últimos 30 dias)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const consultasPorStatus = await prisma.appointment.groupBy({
                by: ["status"],
                where: {
                    medicoId: id,
                    createdAt: {
                        gte: thirtyDaysAgo,
                    },
                },
                _count: {
                    status: true,
                },
            })

            const dashboard = {
                consultasHoje,
                consultasSemana,
                proximasConsultas,
                estatisticas: {
                    agendadas: consultasPorStatus.find((s) => s.status === "AGENDADA")?._count.status || 0,
                    realizadas: consultasPorStatus.find((s) => s.status === "REALIZADA")?._count.status || 0,
                    canceladas: consultasPorStatus.find((s) => s.status === "CANCELADA")?._count.status || 0,
                },
            }

            res.json(dashboard)
        } catch (error) {
            console.error("Erro ao buscar dashboard:", error)
            res.status(500).json({ error: "Erro interno do servidor" })
        }
    }
}

module.exports = { DoctorController }