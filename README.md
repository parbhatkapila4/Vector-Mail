# VectorMail

**An AI-Native Email Client for Modern Productivity**

[![CI/CD](https://github.com/parbhatkapila4/Vector-Mail/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/parbhatkapila4/Vector-Mail/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

VectorMail is an enterprise-grade, AI-powered email client that leverages advanced semantic search, intelligent summarization, and automated email management to optimize inbox workflows and enhance productivity.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Docker Deployment](#docker-deployment)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

VectorMail represents a paradigm shift in email management by integrating artificial intelligence at every layer of the application. Built on modern web technologies and powered by state-of-the-art language models, VectorMail transforms traditional email workflows into intelligent, context-aware interactions.

## Key Features

### AI-Powered Email Management
Leverages machine learning for intelligent email categorization, priority detection, and context-aware automated responses.

### Semantic Search
Implements vector-based search using pgvector, enabling users to find emails by meaning and context rather than exact keyword matching.

### Multi-Account Support
Unified dashboard for managing multiple email accounts across different providers with seamless account switching.

### Smart Composition
AI-assisted email writing with real-time suggestions, tone adjustment, and context-aware content generation.

### Email Analytics
Comprehensive insights into communication patterns, response times, and productivity metrics with visual dashboards.

### Modern User Interface
Responsive, accessible interface built with Next.js 15 and Tailwind CSS, optimized for desktop and mobile experiences.

### Secure Authentication
Enterprise-grade authentication powered by Clerk with support for OAuth, multi-factor authentication, and session management.

### Real-time Synchronization
Instant email synchronization across devices with optimistic updates and conflict resolution.

---

## Technology Stack

### Frontend Layer
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with Radix UI primitives
- **Animations**: Framer Motion
- **State Management**: tRPC with React Query
- **Authentication**: Clerk

### Backend Layer
- **API**: tRPC for end-to-end type safety
- **Database**: PostgreSQL 16+ with Prisma ORM
- **Vector Database**: pgvector extension for semantic search
- **Caching**: Redis for session and query caching
- **AI Integration**: OpenAI GPT-4, Google Gemini

### DevOps & Tooling
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions workflows
- **Testing**: Jest, React Testing Library, Playwright
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

---

## Getting Started

### Prerequisites

Ensure the following dependencies are installed on your system:

- **Node.js**: Version 20 or higher
- **PostgreSQL**: Version 16 or higher with pgvector extension enabled
- **Redis**: Optional but recommended for caching
- **Package Manager**: npm or bun

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/parbhatkapila4/Vector-Mail.git
cd Vector-Mail
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment file and configure with your credentials:

```bash
cp .env.example .env.local
```

Refer to the [Configuration](#configuration) section for detailed environment variable documentation.

#### 4. Initialize Database

Execute the following commands to set up the database schema:

```bash
npm run db:push
npm run db:generate
```

#### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Docker Deployment

For a containerized deployment with all dependencies configured:

```bash
docker-compose up -d
```

This command initializes:
- PostgreSQL database with pgvector extension
- Redis cache server
- VectorMail application server

---

## Architecture

The VectorMail architecture follows a layered approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│                      (Next.js Client)                       │
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
│                   Business Logic Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Aurinko    │  │   OpenAI     │  │  Embedding   │     │
│  │  Email API   │  │   Gemini     │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Persistence Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   Prisma     │     │
│  │  + pgvector  │  │    Cache     │  │     ORM      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration

Create a `.env.local` file in the project root with the following environment variables:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/vectormail"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Email Service (Aurinko)
AURINKO_CLIENT_ID="..."
AURINKO_CLIENT_SECRET="..."

# AI Services
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."

# Cache (Optional)
REDIS_URL="redis://localhost:6379"
```

For a complete list of configuration options, refer to `.env.example` in the project repository.

---

## Development

### Available Scripts

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Start development server with hot reload        |
| `npm run build`        | Build production-optimized bundle               |
| `npm run start`        | Start production server                          |
| `npm run lint`         | Execute ESLint for code quality checks           |
| `npm run typecheck`    | Run TypeScript type checking                     |
| `npm run format:write` | Format codebase with Prettier                    |
| `npm run db:push`      | Synchronize Prisma schema with database          |
| `npm run db:studio`    | Launch Prisma Studio for database management     |

### Testing

VectorMail includes comprehensive test coverage across unit, integration, and end-to-end tests.

```bash
# Unit Tests (Watch Mode)
npm run test

# Unit Tests with Coverage Report
npm run test:ci

# End-to-End Tests (Headless)
npm run test:e2e

# End-to-End Tests (Interactive UI)
npm run test:e2e:ui
```

---

## Documentation

Detailed documentation is available in the following resources:

- **[API Documentation](docs/API.md)**: Complete API reference and endpoint documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)**: System design and architectural decisions
- **[Contributing Guide](CONTRIBUTING.md)**: Guidelines for contributing to the project
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Production deployment instructions
- **[Security Policy](SECURITY.md)**: Security practices and vulnerability reporting

---

## Contributing

Contributions to VectorMail are welcomed and appreciated. To contribute:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Vector-Mail.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Implement Changes**
   - Follow the existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit Changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all CI checks pass

For detailed guidelines, please refer to the [Contributing Guide](CONTRIBUTING.md).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for complete terms and conditions.

---

## Acknowledgments

VectorMail is built upon the shoulders of exceptional open-source projects and services:

- **[T3 Stack](https://create.t3.gg/)**: Modern full-stack TypeScript development framework
- **[shadcn/ui](https://ui.shadcn.com/)**: High-quality, accessible UI component library
- **[Aurinko](https://www.aurinko.io/)**: Unified email API service
- **[OpenAI](https://openai.com/)**: Advanced language model capabilities
- **[Google Gemini](https://deepmind.google/technologies/gemini/)**: Multimodal AI intelligence

---

## Support

For technical support, bug reports, or feature requests:

- **Email**: [help@productionsolution.net](mailto:help@productionsolution.net)
- **GitHub Issues**: [Report an Issue](https://github.com/parbhatkapila4/Vector-Mail/issues)
- **Website**: [vectormail.parbhat.dev](https://vectormail.parbhat.dev/)

---

## Project Links

- **Production**: [https://vectormail.parbhat.dev/](https://vectormail.parbhat.dev/)
- **Repository**: [https://github.com/parbhatkapila4/Vector-Mail](https://github.com/parbhatkapila4/Vector-Mail)
- **Issue Tracker**: [https://github.com/parbhatkapila4/Vector-Mail/issues](https://github.com/parbhatkapila4/Vector-Mail/issues)

---

<div align="center">

**VectorMail** - Redefining Email Productivity with Artificial Intelligence

Developed and maintained by [Parbhat Kapila](https://github.com/parbhatkapila4)

[⬆ Back to Top](#vectormail)

</div>
