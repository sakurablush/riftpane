# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please report it responsibly:

- **GitHub Security Advisory:** Use the "Security" tab on this repository to privately report the issue.

Please do **not** open a public GitHub issue for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

This project follows secure-by-default principles:

- **ZERO hardcoded secrets** — no API keys, passwords, tokens, salts, or credentials are committed to version control.
- **Cryptographically secure randomness** — `crypto.randomUUID()` / `crypto.getRandomValues()` are used instead of `Math.random()` for any security-sensitive values.
- **Constant-time comparison** — all secret comparisons use `crypto.subtle.timingSafeEqual()` or equivalent.
- **Input validation** — all external/untrusted inputs are strictly validated and fail closed.
- **Dependency scanning** — Dependabot and CodeQL run to catch known vulnerabilities.

## Third-Party Assets

This project includes the `CodeOfRealityV1.otf` font, which is NOT open source and NOT covered by the MIT license. See [`assets/fonts/FONT-LICENSE.md`](./assets/fonts/FONT-LICENSE.md) for its actual terms.

---

*This security policy follows standard open-source reporting practices.*