# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please report it responsibly:

- **Email:** security@sakurablush.github.io (replace with actual contact)
- **GitHub Security Advisory:** Use the "Security" tab on this repository to privately report the issue.

Please do **not** open a public GitHub issue for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Security Best Practices

This project follows secure-by-default principles:

- **ZERO hardcoded secrets** — no API keys, passwords, tokens, salts, or credentials are committed to version control.
- **Cryptographically secure randomness** — `crypto.randomUUID()` / `crypto.getRandomValues()` are used instead of `Math.random()` for any security-sensitive values.
- **Constant-time comparison** — all secret comparisons use `crypto.subtle.timingSafeEqual()` or equivalent.
- **Input validation** — all external/untrusted inputs are strictly validated and fail closed.
- **Dependency scanning** — Dependabot and CodeQL run weekly to catch known vulnerabilities.

## Pentesting

A full pentest report is maintained in [`PENTEST_REPORT.md`](./PENTEST_REPORT.md). That document records the scope, methodology, findings, and mitigations for the most recent security review.

---

*This security policy is inspired by the [Keep Code Private](https://github.com/sakurablush/banal) reporting model.*
