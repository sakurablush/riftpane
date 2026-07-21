# Contributing to Riftpane

Thank you for your interest in contributing to **Riftpane** (Laser Speckle & Volumetric Cavern Simulator)! We welcome pull requests, bug reports, feature suggestions, and documentation improvements.

---

## Development Setup

### 1. Prerequisites

- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 2. Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/riftpane.git
cd riftpane

# Install dependencies
npm install

# Start local development server (runs at http://localhost:3000)
npm run dev
```

---

## Guidelines & Best Practices

### Code Quality & Standards

1. **TypeScript**: Ensure strict type safety. Avoid `any` types wherever possible.
2. **GLSL Shaders**: Keep fragment shader logic in `src/shaders.ts`. Ensure mathematical efficiency and maintain comments explaining complex spatial transformations.
3. **React Hooks**: Use `useCallback` and `useMemo` where appropriate to avoid unnecessary re-renders during high-frame-rate WebGL animation loops.

### Verification Tools

Before submitting a Pull Request, please run the following commands to ensure all checks pass:

```bash
# Typecheck & Linting
npm run lint

# Run Unit Tests
npm run test

# Run Unit Tests with Coverage
npm run test:coverage

# Production Build Check
npm run build
```

---

## Submitting Pull Requests

1. **Fork & Branch**: Create a descriptive feature branch (e.g., `feature/custom-wavelength` or `fix/shader-precision`).
2. **Commit Messages**: Write clear, imperative commit messages (e.g., `feat: add 355nm UV laser preset`).
3. **Tests**: Add unit tests for any new UI controls, utilities, or state managers.
4. **Pull Request**: Open a PR against the `main` branch with a summary of changes and visual screenshots if UI/Shader output changed.

---

## License

By contributing to this repository, you agree that your contributions will be licensed under the [MIT License](LICENSE).
