# Git Workflow for samuellimabraz.github.io

This document outlines the Git workflow for this project, which follows a development branch strategy with PR-based deployments.

## Branches

- **main**: Production branch. The code on this branch is deployed to GitHub Pages.
- **develop**: Development branch where features are integrated before being promoted to production.
- **feature/\***: Feature branches for developing new features.
- **bugfix/\***: Bugfix branches for fixing issues.

## Workflow

### Starting New Work

1. Always start from the latest `develop` branch:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create a new branch for your work:
   ```bash
   # For a new feature
   git checkout -b feature/your-feature-name
   
   # For a bug fix
   git checkout -b bugfix/issue-description
   ```

3. Make your changes, commit regularly with descriptive commit messages:
   ```bash
   git add .
   git commit -m "Descriptive message about the changes"
   ```

### Submitting Changes

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request (PR) to merge your branch into `develop`.

3. After code review and approval, merge your PR into the `develop` branch.

### Deploying to Production

1. Create a PR from `develop` to `main` when you're ready to deploy.

2. After review, merge the PR into `main`.

3. The GitHub Actions workflow will automatically build and deploy your site to GitHub Pages.

## CI/CD Pipelines

This project uses two GitHub Actions workflows:

1. **Test Build** (`.github/workflows/test-build.yml`):
   - Triggered on pushes and PRs to the `develop` branch
   - Builds the project to ensure there are no build errors
   - Does not deploy the site

2. **Deploy to GitHub Pages** (`.github/workflows/deploy.yml`):
   - Triggered when a PR to `main` is merged
   - Builds the project and deploys it to GitHub Pages

## Best Practices

- Never commit directly to `main` or `develop` branches
- Keep your commits small and focused
- Write descriptive commit messages
- Update documentation when necessary
- Request reviews before merging PRs
- Regularly pull the latest changes from `develop` to your feature branch 