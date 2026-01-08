# Contributing to VectorMail

Thank you for your interest in contributing to VectorMail! We're building the future of email management together.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write tests** for your changes
4. **Ensure tests pass** (`npm run test:ci`)
5. **Update documentation** if you're changing functionality
6. **Write a good commit message**

## 🚀 Development Process

### Setup Development Environment

1. Fork and clone the repository

   ```bash
   git clone https://github.com/YOUR_USERNAME/Vector-Mail.git
   cd Vector-Mail
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. Start database with Docker

   ```bash
   docker-compose up -d postgres redis
   ```

5. Run database migrations

   ```bash
   npm run db:push
   ```

6. Start development server
   ```bash
   npm run dev
   ```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:

- `feature/email-templates`
- `fix/search-query-bug`
- `docs/api-endpoints`

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(search): add semantic email search

fix(auth): resolve token refresh issue

docs(readme): update installation instructions

test(email): add unit tests for email parser
```

### Code Style

- **TypeScript**: We use TypeScript for type safety
- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Run `npm run format:write` to format code
- **Naming Conventions**:
  - Components: PascalCase (`EmailList.tsx`)
  - Functions: camelCase (`fetchEmails()`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
  - Files: kebab-case for utils, PascalCase for components

### Testing Requirements

All contributions must include appropriate tests:

1. **Unit Tests**: For utility functions and isolated components

   ```bash
   npm run test
   ```

2. **Integration Tests**: For API routes and database operations

3. **E2E Tests**: For critical user flows
   ```bash
   npm run test:e2e
   ```

**Test Coverage**: Aim for at least 70% coverage for new code

### Code Review Process

1. Create a pull request with a clear title and description
2. Link any related issues
3. Ensure all CI checks pass
4. Wait for review from maintainers
5. Address any feedback
6. Once approved, a maintainer will merge your PR

## 📁 Project Structure

```
vectormail-ai/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (auth)/       # Authentication routes
│   │   ├── api/          # API routes
│   │   └── mail/         # Mail client pages
│   ├── components/       # React components
│   │   ├── landing/      # Landing page components
│   │   ├── mail/         # Mail client components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utility functions
│   ├── server/           # Server-side code
│   │   └── api/          # tRPC routers
│   └── hooks/            # Custom React hooks
├── prisma/               # Database schema
├── e2e/                  # End-to-end tests
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🧪 Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { EmailList } from '@/components/mail/EmailList'

describe('EmailList', () => {
  it('renders email items correctly', () => {
    const emails = [{ id: '1', subject: 'Test', from: 'test@example.com' }]
    render(<EmailList emails={emails} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("user can compose and send email", async ({ page }) => {
  await page.goto("/mail");
  await page.click("text=Compose");
  await page.fill('[name="to"]', "recipient@example.com");
  await page.fill('[name="subject"]', "Test Subject");
  await page.click("text=Send");
  await expect(page.locator("text=Email sent")).toBeVisible();
});
```

## 📚 Documentation

When adding new features:

1. Update relevant documentation in `/docs`
2. Add inline code comments for complex logic
3. Update the README if necessary
4. Add JSDoc comments for public APIs

## 🤔 Questions?

- Check existing [Issues](https://github.com/parbhatkapila4/Vector-Mail/issues)
- Email us at [parbhat@parbhat.dev](mailto:parbhat@parbhat.dev)

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**

- Trolling, insulting comments, and personal attacks
- Public or private harassment
- Publishing others' private information
- Other conduct which could be considered inappropriate

## 🎉 Recognition

Contributors will be:

- Listed in our README
- Mentioned in release notes
- Given credit in the project

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making VectorMail better!**
