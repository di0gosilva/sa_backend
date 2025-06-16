-- Script para popular o banco com dados iniciais

-- Inserir usuários (senhas são 'password123' com hash bcrypt)
INSERT INTO users (id, nome, email, senha, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Dr. João Silva', 'joao.silva@clinica.com', '$2a$12$LQv3c1yqBwEHxv68JaMCOeHHzfzpIVtytLEwGckLIlku4t-FMuAGu', 'DOCTOR'),
('550e8400-e29b-41d4-a716-446655440002', 'Dra. Maria Santos', 'maria.santos@clinica.com', '$2a$12$LQv3c1yqBwEHxv68JaMCOeHHzfzpIVtytLEwGckLIlku4t-FMuAGu', 'DOCTOR'),
('550e8400-e29b-41d4-a716-446655440003', 'Ana Recepção', 'ana.recepcao@clinica.com', '$2a$12$LQv3c1yqBwEHxv68JaMCOeHHzfzpIVtytLEwGckLIlku4t-FMuAGu', 'RECEPTIONIST');

-- Inserir médicos
INSERT INTO doctors (id, user_id, especialidade, crm) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cardiologia', 'CRM/SP 123456'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Dermatologia', 'CRM/SP 789012');

-- Inserir horários de trabalho
-- Dr. João Silva - Segunda a Sexta, 8h às 17h
INSERT INTO schedules (id, medico_id, dia_semana, hora_inicio, hora_fim) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 1, '08:00', '17:00'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 2, '08:00', '17:00'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 3, '08:00', '17:00'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 4, '08:00', '17:00'),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 5, '08:00', '17:00');

-- Dra. Maria Santos - Segunda, Quarta e Sexta, 9h às 16h
INSERT INTO schedules (id, medico_id, dia_semana, hora_inicio, hora_fim) VALUES
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 1, '09:00', '16:00'),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 3, '09:00', '16:00'),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', 5, '09:00', '16:00');

-- Inserir algumas consultas de exemplo
INSERT INTO appointments (id, nome_paciente, email_paciente, telefone, medico_id, data, hora, status) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Carlos Oliveira', 'carlos@email.com', '(11) 99999-1111', '650e8400-e29b-41d4-a716-446655440001', '2024-01-15 10:00:00', '2024-01-15 10:00:00', 'AGENDADA'),
('850e8400-e29b-41d4-a716-446655440002', 'Fernanda Lima', 'fernanda@email.com', '(11) 99999-2222', '650e8400-e29b-41d4-a716-446655440002', '2024-01-16 14:30:00', '2024-01-16 14:30:00', 'AGENDADA');
