# Contributing to RiseRoll

Thank you for your interest in contributing to RiseRoll! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project follows a code of conduct that ensures a welcoming environment for all contributors. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/morning-picker.git
   cd morning-picker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginner-friendly tasks
- Check the project board for assigned issues
- Comment on the issue to express interest

### 2. Make Your Changes

- Follow the coding standards outlined below
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation if needed

### 3. Submit a Pull Request

- Push your changes to your fork
- Create a pull request with a clear title and description
- Link to any related issues
- Request review from maintainers

## Coding Standards

### Vue.js Guidelines

- Use Composition API with `<script setup>`
- Follow Vue 3 best practices
- Use TypeScript when possible
- Write reusable components

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic

### File Organization

```
src/
├── components/     # Reusable Vue components
├── views/         # Page components
├── stores/        # Pinia stores
├── composables/   # Vue composables
├── router/        # Vue Router
└── assets/        # Static assets
```

### Naming Conventions

- **Files**: kebab-case (`my-component.vue`)
- **Components**: PascalCase (`MyComponent`)
- **Variables/Functions**: camelCase (`myVariable`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] No console errors or warnings

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on mobile
- [ ] Tested on desktop
- [ ] Tested in different browsers

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review code quality and functionality
3. **Testing**: Manual testing on different devices/browsers
4. **Approval**: At least one maintainer approval required

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, device type
- **Screenshots**: If applicable

### Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., iOS, Android, Windows, macOS]
- Browser: [e.g., Chrome, Safari, Firefox]
- Version: [e.g., 22]

## Additional Context
[Any other context about the problem]
```

## Feature Requests

### Before Requesting

- Check existing issues and discussions
- Consider if the feature aligns with project goals
- Think about implementation complexity

### Feature Request Template

```markdown
## Feature Description
[Clear description of the feature]

## Problem Statement
[What problem does this solve?]

## Proposed Solution
[How should this be implemented?]

## Alternatives Considered
[Other solutions you've considered]

## Additional Context
[Any other context about the feature request]
```

## Development Guidelines

### Git Workflow

1. **Main Branch**: `main` - production-ready code
2. **Feature Branches**: `feature/description` - new features
3. **Bug Fix Branches**: `bugfix/description` - bug fixes
4. **Hotfix Branches**: `hotfix/description` - urgent fixes

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(picker): add re-roll functionality
fix(notifications): resolve X button click issue
docs(readme): update installation instructions
```

### Testing

- Test on multiple devices (mobile, tablet, desktop)
- Test in different browsers (Chrome, Firefox, Safari, Edge)
- Test PWA functionality
- Test offline capabilities

## Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Documentation**: Check README.md and inline code comments

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## License

By contributing to RiseRoll, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to RiseRoll! 🎉
