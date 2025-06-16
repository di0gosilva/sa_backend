# Sistema de Agendamento Médico - Frontend

Frontend em React para o sistema de agendamento médico, desenvolvido com Vite, Tailwind CSS e React Router DOM.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas

## 📋 Funcionalidades

### 🌐 **Área Pública**
- **Landing Page** - Apresentação do sistema
- **Agendamento Online** - Pacientes podem agendar sem login
- **Seleção de Médicos** - Lista de profissionais disponíveis
- **Verificação de Horários** - Slots disponíveis em tempo real
- **Confirmação por Email** - Notificação automática

### 🔐 **Área Privada**

#### 👨‍⚕️ **Médicos**
- **Dashboard Personalizado** - Estatísticas e próximas consultas
- **Gestão de Consultas** - Visualizar e atualizar status
- **Gerenciamento de Horários** - Criar/editar horários de atendimento
- **Perfil** - Informações pessoais e profissionais

#### 👩‍💼 **Recepcionistas**
- **Dashboard Administrativo** - Visão geral da clínica
- **Gestão Completa de Consultas** - Cancelar e reagendar
- **Lista de Médicos** - Informações de todos os profissionais
- **Controle Total** - Acesso a todas as funcionalidades

### 🔒 **Sistema de Autenticação**
- **Login Seguro** - JWT com roles
- **Rotas Protegidas** - Controle de acesso por perfil
- **Redirecionamento** - Após login para área correta
- **Logout** - Limpeza de sessão

## 🛠️ Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <url-do-repositorio>
cd medical-appointment-frontend
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure o backend**
Certifique-se de que o backend está rodando na porta 3000

4. **Inicie o servidor de desenvolvimento**
\`\`\`bash
npm run dev
\`\`\`

O frontend estará disponível em `http://localhost:3001`

## 📁 Estrutura do Projeto

\`\`\`
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx      # Cabeçalho da aplicação
│   ├── Sidebar.jsx     # Menu lateral (área privada)
│   └── ProtectedRoute.jsx # Proteção de rotas
├── contexts/           # Contextos React
│   └── AuthContext.jsx # Contexto de autenticação
├── layouts/            # Layouts da aplicação
│   ├── PublicLayout.jsx  # Layout público
│   └── PrivateLayout.jsx # Layout privado
├── pages/              # Páginas da aplicação
│   ├── public/         # Páginas públicas
│   │   ├── Home.jsx    # Landing page
│   │   ├── Login.jsx   # Página de login
│   │   └── BookAppointment.jsx # Agendamento
│   ├── private/        # Páginas privadas
│   │   ├── Dashboard.jsx    # Dashboard
│   │   ├── Appointments.jsx # Consultas
│   │   ├── Schedules.jsx    # Horários (médicos)
│   │   ├── Doctors.jsx      # Médicos (recepcionista)
│   │   └── Profile.jsx      # Perfil
│   └── NotFound.jsx    # Página 404
├── services/           # Serviços
│   └── api.js         # Configuração do Axios
└── App.jsx            # Componente principal
\`\`\`

## 🎨 Design System

### **Cores Principais**
- **Primary**: Azul (#2563eb)
- **Success**: Verde (#10b981)
- **Warning**: Amarelo (#f59e0b)
- **Danger**: Vermelho (#ef4444)

### **Componentes CSS**
- **Botões**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- **Inputs**: `.input`
- **Cards**: `.card`, `.card-header`, `.card-content`, `.card-title`

## 🔐 Autenticação

### **Fluxo de Login**
1. Usuário insere credenciais
2. Frontend envia para `/api/auth/login`
3. Backend retorna JWT + dados do usuário
4. Token armazenado no localStorage
5. Redirecionamento para dashboard

### **Proteção de Rotas**
\`\`\`jsx
<ProtectedRoute allowedRoles={['DOCTOR']}>
  <Schedules />
</ProtectedRoute>
\`\`\`

### **Dados de Teste**
- **Médico**: `joao.silva@clinica.com` / `password123`
- **Recepcionista**: `ana.recepcao@clinica.com` / `password123`

## 📱 Responsividade

- **Mobile First** - Design otimizado para dispositivos móveis
- **Breakpoints Tailwind** - sm, md, lg, xl
- **Grid Responsivo** - Adaptação automática de layouts
- **Menu Mobile** - Sidebar colapsável

## 🚀 Build e Deploy

### **Build para Produção**
\`\`\`bash
npm run build
\`\`\`

### **Preview da Build**
\`\`\`bash
npm run preview
\`\`\`

### **Deploy**
O projeto pode ser deployado em:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- **Servidor próprio**

## 🔧 Configurações

### **Proxy de Desenvolvimento**
O Vite está configurado para fazer proxy das requisições `/api` para `http://localhost:3000`

### **Variáveis de Ambiente**
Crie um arquivo `.env.local` se necessário:
\`\`\`env
VITE_API_URL=http://localhost:3000/api
\`\`\`

## 📊 Funcionalidades por Perfil

### **Médico**
- ✅ Dashboard com estatísticas pessoais
- ✅ Visualizar consultas próprias
- ✅ Gerenciar horários de atendimento
- ✅ Atualizar status das consultas
- ✅ Perfil profissional

### **Recepcionista**
- ✅ Dashboard administrativo
- ✅ Visualizar todas as consultas
- ✅ Cancelar/reagendar consultas
- ✅ Lista completa de médicos
- ✅ Controle total do sistema

### **Paciente (Público)**
- ✅ Agendar consultas sem login
- ✅ Selecionar médico e horário
- ✅ Receber confirmação por email
- ✅ Interface intuitiva

## 🎯 Próximas Melhorias

- [ ] Sistema de notificações em tempo real
- [ ] Chat entre médico e paciente
- [ ] Histórico médico do paciente
- [ ] Relatórios e estatísticas avançadas
- [ ] Integração com calendário externo
- [ ] App mobile (React Native)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
