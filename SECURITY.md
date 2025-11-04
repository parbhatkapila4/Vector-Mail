# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [help@productionsolution.net](mailto:help@productionsolution.net).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

VectorMail implements the following security measures:

### Authentication & Authorization

- **Clerk Authentication**: Industry-standard OAuth2.0 implementation
- **JWT Tokens**: Secure session management with automatic rotation
- **Role-Based Access**: Granular permissions for different user types

### Data Protection

- **Encryption at Rest**: All sensitive data encrypted in database
- **Encryption in Transit**: HTTPS/TLS 1.3 for all communications
- **Password Hashing**: Handled by Clerk with bcrypt
- **Email Data**: OAuth tokens stored securely, never plain passwords

### API Security

- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Input Validation**: All inputs sanitized and validated
- **CSRF Protection**: Token-based protection on all forms
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM

### Infrastructure Security

- **Environment Variables**: Sensitive data never committed to repo
- **Dependency Scanning**: Automated vulnerability scanning with Dependabot
- **Docker Security**: Multi-stage builds, non-root user
- **CORS Configuration**: Strict origin policies

### Monitoring & Logging

- **Error Tracking**: Sentry integration for security events
- **Audit Logs**: User actions logged for compliance
- **Anomaly Detection**: Unusual access patterns flagged

## Best Practices for Contributors

When contributing, please follow these security guidelines:

1. **Never commit secrets**: Use environment variables
2. **Sanitize inputs**: Always validate and sanitize user input
3. **Use parameterized queries**: Prevent SQL injection
4. **Implement proper error handling**: Don't expose stack traces
5. **Keep dependencies updated**: Regularly update packages
6. **Follow authentication patterns**: Use existing auth mechanisms
7. **Test security features**: Include security tests

## Known Security Limitations

- Email content is processed by third-party AI providers (OpenAI/Gemini)
- Email OAuth tokens have provider-specific expiration policies
- Rate limiting is application-level (consider adding WAF for production)

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. We will:

1. Patch the vulnerability
2. Release a new version
3. Notify users via GitHub Security Advisories
4. Update this document if necessary

## Responsible Disclosure

We kindly ask you to:

- Give us reasonable time to respond to your report before public disclosure
- Make a good faith effort to avoid privacy violations and service disruption
- Not access or modify data beyond what is necessary to demonstrate the vulnerability

## Recognition

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Researchers who follow our responsible disclosure policy may be acknowledged in our Hall of Fame (with permission).

## Contact

For security concerns, email: [help@productionsolution.net](mailto:help@productionsolution.net)

---

**Thank you for helping keep VectorMail secure! 🔒**

