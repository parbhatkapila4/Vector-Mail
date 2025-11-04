# VectorMail

> AI-Powered Email Client Built to Save You Time

[![CI/CD](https://github.com/parbhatkapila4/Vector-Mail/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/parbhatkapila4/Vector-Mail/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

VectorMail is a modern, AI-native email client that leverages semantic search, intelligent summarization, and automated email management to transform how you handle your inbox.

## 🌟 Features

- **🤖 AI-Powered Email Management**: Intelligent email categorization, priority detection, and smart replies
- **🔍 Semantic Search**: Find emails by meaning, not just keywords using pgvector
- **📧 Multi-Account Support**: Manage multiple email accounts from a single dashboard
- **✨ Smart Composition**: AI-assisted email writing with context-aware suggestions
- **📊 Email Analytics**: Insights into your email patterns and productivity
- **🎨 Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **🔐 Secure Authentication**: Powered by Clerk with OAuth support
- **⚡ Real-time Sync**: Instant email synchronization across devices

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ with pgvector extension
- Redis (optional, for caching)
- npm or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/parbhatkapila4/Vector-Mail.git
   cd Vector-Mail
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables (see [Environment Variables](#environment-variables))

4. **Set up the database**

   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Setup (Recommended)

```bash
docker-compose up -d
```

This will start:

- PostgreSQL with pgvector
- Redis cache
- VectorMail application

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  React   │  │ tRPC API │  │  Clerk   │  │ Tailwind │   │
│  │Components│  │  Client  │  │   Auth   │  │   CSS    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (tRPC)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Account    │  │    Email     │  │   Search     │     │
│  │   Router     │  │   Router     │  │   Router     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Services Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Aurinko    │  │   OpenAI     │  │  Embedding   │     │
│  │  Email API   │  │   Gemini     │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   Prisma     │     │
│  │  + pgvector  │  │    Cache     │  │     ORM      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Policy](SECURITY.md)

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS + Radix UI
- **Animations**: Framer Motion
- **State Management**: tRPC + React Query
- **Authentication**: Clerk

### Backend

- **API**: tRPC
- **Database**: PostgreSQL + Prisma ORM
- **Vector Search**: pgvector
- **Cache**: Redis
- **AI/ML**: OpenAI GPT-4, Google Gemini

### DevOps

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest, React Testing Library, Playwright
- **Code Quality**: ESLint, Prettier, TypeScript

## 🧪 Testing

```bash
npm run test          # Run unit tests (watch mode)
npm run test:ci       # Run tests with coverage
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Run E2E tests with UI
```

## 📦 Scripts

| Script                 | Description                    |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start development server       |
| `npm run build`        | Build production bundle        |
| `npm run start`        | Start production server        |
| `npm run lint`         | Run ESLint                     |
| `npm run typecheck`    | Run TypeScript check           |
| `npm run format:write` | Format code with Prettier      |
| `npm run db:push`      | Push Prisma schema to database |
| `npm run db:studio`    | Open Prisma Studio             |

## 🔒 Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vectormail"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
AURINKO_CLIENT_ID="..."
AURINKO_CLIENT_SECRET="..."
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
REDIS_URL="redis://localhost:6379"
```

See `.env.example` for all available options.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Email service powered by [Aurinko](https://www.aurinko.io/)
- AI capabilities from [OpenAI](https://openai.com/) and [Google Gemini](https://deepmind.google/technologies/gemini/)

## 📧 Contact

For questions or support, reach out to [help@productionsolution.net](mailto:help@productionsolution.net)

## 🌐 Links

- [Website](https://vectormail.parbhat.dev/)
- [GitHub](https://github.com/parbhatkapila4/Vector-Mail)
- [Issues](https://github.com/parbhatkapila4/Vector-Mail/issues)

---

**Built with Parbhat Kapila**

[⬆ back to top](#vectormail)
