import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Dr. João Silva',
        email: 'joao.silva@clinica.com',
        senha: '$2a$12$LQv3c1yqBwEHxv68JaMCOeHHzfzpIVtytLEwGckLIlku4t-FMuAGu',
        role: 'DOCTOR',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        nome: 'Dra. Maria Santos',
        email: 'maria.santos@clinica.com',
        senha: '$2a$12$LQv3c1yqBwEHxv68JaMCOeHHzfzpIVtytLEwGckLIlku4t-FMuAGu',
        role: 'DOCTOR',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        nome: 'Ana Recepção',
        email: 'ana.recepcao@clinica.com',
        senha: '$2a$12$LQv3c1yqBwEHxv68JaMCOeHHzfzpIVtytLEwGckLIlku4t-FMuAGu',
        role: 'RECEPTIONIST',
      },
    ],
  })

  await prisma.doctor.createMany({
    data: [
      {
        id: '650e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        especialidade: 'Cardiologia',
        crm: 'CRM/SP 123456',
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440002',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        especialidade: 'Dermatologia',
        crm: 'CRM/SP 789012',
      },
    ],
  })

  await prisma.schedule.createMany({
    data: [
      { id: '750e8400-e29b-41d4-a716-446655440001', medicoId: '650e8400-e29b-41d4-a716-446655440001', diaSemana: 1, horaInicio: '08:00', horaFim: '17:00' },
      { id: '750e8400-e29b-41d4-a716-446655440002', medicoId: '650e8400-e29b-41d4-a716-446655440001', diaSemana: 2, horaInicio: '08:00', horaFim: '17:00' },
      { id: '750e8400-e29b-41d4-a716-446655440003', medicoId: '650e8400-e29b-41d4-a716-446655440001', diaSemana: 3, horaInicio: '08:00', horaFim: '17:00' },
      { id: '750e8400-e29b-41d4-a716-446655440004', medicoId: '650e8400-e29b-41d4-a716-446655440001', diaSemana: 4, horaInicio: '08:00', horaFim: '17:00' },
      { id: '750e8400-e29b-41d4-a716-446655440005', medicoId: '650e8400-e29b-41d4-a716-446655440001', diaSemana: 5, horaInicio: '08:00', horaFim: '17:00' },
      { id: '750e8400-e29b-41d4-a716-446655440006', medicoId: '650e8400-e29b-41d4-a716-446655440002', diaSemana: 1, horaInicio: '09:00', horaFim: '16:00' },
      { id: '750e8400-e29b-41d4-a716-446655440007', medicoId: '650e8400-e29b-41d4-a716-446655440002', diaSemana: 3, horaInicio: '09:00', horaFim: '16:00' },
      { id: '750e8400-e29b-41d4-a716-446655440008', medicoId: '650e8400-e29b-41d4-a716-446655440002', diaSemana: 5, horaInicio: '09:00', horaFim: '16:00' },
    ],
  })

  await prisma.appointment.createMany({
    data: [
      {
        id: '850e8400-e29b-41d4-a716-446655440001',
        nomePaciente: 'Carlos Oliveira',
        emailPaciente: 'carlos@email.com',
        telefone: '(11) 99999-1111',
        medicoId: '650e8400-e29b-41d4-a716-446655440001',
        data: new Date('2024-01-15T10:00:00'),
        hora: new Date('2024-01-15T10:00:00'),
        status: 'AGENDADA',
      },
      {
        id: '850e8400-e29b-41d4-a716-446655440002',
        nomePaciente: 'Fernanda Lima',
        emailPaciente: 'fernanda@email.com',
        telefone: '(11) 99999-2222',
        medicoId: '650e8400-e29b-41d4-a716-446655440002',
        data: new Date('2024-01-16T14:30:00'),
        hora: new Date('2024-01-16T14:30:00'),
        status: 'AGENDADA',
      },
    ],
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
