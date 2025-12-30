<div align="center">

<img src="public/Red Midern Wings Box Delivery Logo.png" alt="VectorMail Logo" width="80" height="80" />

# VectorMail

### The AI Email Client That Actually Saves You Time

**Stop drowning in emails. Start being productive.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-vectormail.space-blueviolet?style=for-the-badge)](https://vectormail.space)
[![GitHub Stars](https://img.shields.io/github/stars/parbhatkapila4/Vector-Mail?style=for-the-badge&logo=github&color=yellow)](https://github.com/parbhatkapila4/Vector-Mail)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

<br />

[**Try VectorMail Free**](https://vectormail.space) &nbsp;&nbsp;|&nbsp;&nbsp; [**Watch Demo**](https://lcbcrithcxdbqynfmtxk.supabase.co/storage/v1/object/public/Videos/Vector-Mail-1762579701087.mp4) &nbsp;&nbsp;|&nbsp;&nbsp; [**Documentation**](#quick-start)

<br />

<img src="public/Vector-mail-hero.png" alt="VectorMail Dashboard" width="100%" style="border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);" />

</div>

<br />

## 🎯 The Problem We Solve

> **The average professional spends 28% of their workweek on email.** That's 11+ hours searching, reading, writing, and organizing. Time that should go to actual work.

Traditional email clients were built for the 1990s. VectorMail is built for how we work today.

<br />

## Why VectorMail?

<table>
<tr>
<td width="50%">

### Semantic Search That Actually Works

Search by **meaning**, not just keywords. Ask "emails about the budget meeting last month" and actually find them. Powered by vector embeddings and pgvector.

</td>
<td width="50%">

### AI That Understands Context

Every email gets an intelligent summary, automatic categorization, and smart tagging. Know what's important at a glance without reading everything.

</td>
</tr>
<tr>
<td width="50%">

### Write Emails in Seconds

Describe what you want to say, and our AI composes it with the right tone, context from previous conversations, and your writing style.

</td>
<td width="50%">

### Chat With Your Inbox

"Show me all receipts from last quarter" or "Find the email where John mentioned the deadline." Natural language meets your inbox.

</td>
</tr>
</table>

<br />

## Key Features

<details open>
<summary><strong>🧠 AI-Powered Intelligence</strong></summary>
<br />

| Feature                 | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Smart Summaries**     | Every email automatically summarized with key points, action items, and context |
| **Intelligent Tagging** | AI categorizes emails as urgent, informational, promotional, or action-required |
| **Vector Embeddings**   | 768-dimensional embeddings for each email enable true semantic understanding    |
| **Priority Detection**  | Automatically surfaces what matters and deprioritizes noise                     |

</details>

<details open>
<summary><strong>🔍 Next-Gen Search</strong></summary>
<br />

| Feature               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| **Semantic Search**   | Find emails by meaning, not exact words               |
| **Natural Language**  | Search like you'd ask a colleague                     |
| **Relevance Scoring** | Results ranked by actual importance, not just recency |
| **Instant Results**   | Sub-100ms search across thousands of emails           |

</details>

<details open>
<summary><strong> AI Composition</strong></summary>
<br />

| Feature                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| **Context-Aware Writing** | AI reads the thread and writes appropriate responses |
| **Tone Adjustment**       | Professional, casual, or custom—match any situation  |
| **One-Click Replies**     | Generate complete, thoughtful responses instantly    |
| **Smart Suggestions**     | Real-time writing assistance as you type             |

</details>

<details>
<summary><strong>Productivity Dashboard</strong></summary>
<br />

| Feature                    | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| **Email Analytics**        | Track response times, volume patterns, and productivity |
| **Communication Insights** | Understand who you email most and when                  |
| **Action Item Tracking**   | Never miss a follow-up or commitment                    |

</details>

<details>
<summary><strong>Enterprise-Ready Security</strong></summary>
<br />

| Feature                  | Description                                         |
| ------------------------ | --------------------------------------------------- |
| **Clerk Authentication** | Enterprise-grade auth with MFA, SSO support         |
| **Data Encryption**      | End-to-end encryption for all stored data           |
| **Privacy First**        | Your data stays yours—we don't train on your emails |
| **SOC 2 Ready**          | Built with compliance requirements in mind          |

</details>

<br />

## Architecture

VectorMail is built on a modern, scalable architecture designed for performance and reliability.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Next.js   │  │   React 19  │  │  Tailwind   │  │   Framer    │          │
│  │     15      │  │             │  │     CSS     │  │   Motion    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                               API LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                    tRPC (End-to-End Type Safety)                    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Account   │  │   Thread    │  │   Search    │  │     AI      │          │
│  │   Router    │  │   Router    │  │   Router    │  │   Router    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            INTELLIGENCE LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Gemini    │  │   OpenAI    │  │  Embedding  │  │   Vector    │          │
│  │   2.5 Flash │  │   GPT-4     │  │   Service   │  │   Search    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ PostgreSQL  │  │   pgvector  │  │   Prisma    │  │   Aurinko   │          │
│  │     16+     │  │  Extension  │  │     ORM     │  │  Email API  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────────────────────┘
```

<br />

## 🛠️ Tech Stack

| Category     | Technologies                                                            |
| ------------ | ----------------------------------------------------------------------- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Radix UI |
| **Backend**  | tRPC, Prisma ORM, PostgreSQL 16+, pgvector                              |
| **AI/ML**    | Google Gemini 2.5 Flash, OpenAI GPT-4, Custom Embeddings (768-dim)      |
| **Auth**     | Clerk (OAuth, MFA, Session Management)                                  |
| **Email**    | Aurinko API (Google, Microsoft 365)                                     |
| **Testing**  | Jest, React Testing Library, Playwright                                 |
| **DevOps**   | Docker, GitHub Actions                                                  |

<br />

## Quick Start

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+ with pgvector extension
- **Package Manager** npm, yarn, or bun

### 1. Clone & Install

```bash
git clone https://github.com/parbhatkapila4/Vector-Mail.git
cd Vector-Mail
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Add your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vectormail"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Email Service (Aurinko)
AURINKO_CLIENT_ID="..."
AURINKO_CLIENT_SECRET="..."

# AI Services
OPENROUTER_API_KEY="..."
GEMINI_API_KEY="..."
```

### 3. Initialize Database

```bash
npm run db:push
npm run db:generate
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - your AI email client is ready!

<br />

## Docker Deployment

```bash
docker-compose up -d
```

This spins up:

- PostgreSQL with pgvector
- VectorMail application
- Auto-configured networking

<br />

## Available Scripts

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start development server with Turbopack |
| `npm run build`     | Build for production                    |
| `npm run start`     | Start production server                 |
| `npm run lint`      | Run ESLint                              |
| `npm run typecheck` | Run TypeScript type checking            |
| `npm run test`      | Run unit tests (watch mode)             |
| `npm run test:ci`   | Run tests with coverage                 |
| `npm run test:e2e`  | Run Playwright E2E tests                |
| `npm run db:studio` | Open Prisma Studio                      |

<br />

## Pricing

| Plan           | Price    | Features                                                    |
| -------------- | -------- | ----------------------------------------------------------- |
| **Basic**      | Free     | 5 AI summaries/day, basic search, single account            |
| **Pro**        | $9.99/mo | Unlimited AI, advanced search, 5 accounts, priority support |
| **Enterprise** | $60/mo   | Everything + custom AI training, SSO, dedicated support     |

[View Full Pricing →](https://vectormail.space/pricing)

<br />

## 🗺️ Roadmap

- [x] **Semantic Search** - Vector-based email search
- [x] **AI Summaries** - Automatic email summarization
- [x] **AI Compose** - Context-aware email writing
- [x] **Multi-Account** - Support for multiple email accounts
- [ ] **Mobile App** - iOS & Android native apps
- [ ] **Calendar Integration** - Smart scheduling from emails
- [ ] **Team Workspaces** - Shared inboxes & collaboration
- [ ] **Plugins/Extensions** - CRM, Slack, Notion integrations
- [ ] **On-Premise** - Self-hosted enterprise deployment

<br />

## 🤝 Contributing

We welcome contributions! VectorMail is open source and community-driven.

```bash
# 1. Fork the repo
git clone https://github.com/YOUR_USERNAME/Vector-Mail.git

# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes and commit
git commit -m "feat: add amazing feature"

# 4. Push and open a PR
git push origin feature/amazing-feature
```

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

<br />

## License

VectorMail is open-source software licensed under the [MIT License](LICENSE).

<br />

## Support & Community

<table>
<tr>
<td align="center" width="33%">
<br />
<strong>Email Support</strong>
<br /><br />
<a href="mailto:parbhat@parbhat.dev">parbhat@parbhat.dev</a>
<br /><br />
</td>
<td align="center" width="33%">
<br />
<strong>🐛 Bug Reports</strong>
<br /><br />
<a href="https://github.com/parbhatkapila4/Vector-Mail/issues">GitHub Issues</a>
<br /><br />
</td>
<td align="center" width="33%">
<br />
<strong>💡 Feature Requests</strong>
<br /><br />
<a href="https://github.com/parbhatkapila4/Vector-Mail/issues">GitHub Discussions</a>
<br /><br />
</td>
</tr>
</table>

<br />

## Acknowledgments

Built with incredible open-source technologies:

- [T3 Stack](https://create.t3.gg/) - The best way to start a full-stack TypeScript app
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- [Aurinko](https://www.aurinko.io/) - Unified email API
- [OpenAI](https://openai.com/) & [Google Gemini](https://deepmind.google/technologies/gemini/) - AI capabilities

<br />

---

<div align="center">

<br />

**VectorMail** - _Email, Reimagined with AI_

<br />

Built by [Parbhat Kapila](https://github.com/parbhatkapila4)

<br />

[Website](https://vectormail.space/) · [GitHub](https://github.com/parbhatkapila4/Vector-Mail) · [Twitter](https://x.com/Parbhat03)

<br />

⭐ **Star us on GitHub** - it motivates us to keep building!

<br />

</div>
