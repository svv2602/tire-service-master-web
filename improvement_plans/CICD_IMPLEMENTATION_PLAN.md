# План внедрения CI/CD

## Цели

1. Автоматизировать процесс сборки и тестирования приложения
2. Настроить автоматический деплой на тестовую среду
3. Улучшить качество кода с помощью статического анализа
4. Ускорить процесс разработки и выпуска новых версий

## Текущее состояние

- Отсутствует автоматизация сборки и тестирования
- Деплой на тестовую среду выполняется вручную
- Отсутствует автоматический статический анализ кода
- Нет единого процесса для проверки качества кода перед мержем

## План работ

### 1. Настройка GitHub Actions для CI

1. Создать файл конфигурации для проверки кода:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
  
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage report
        uses: codecov/codecov-action@v3
  
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: build/
```

2. Добавить скрипты в package.json:

```json
{
  "scripts": {
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
    "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
    "typecheck": "tsc --noEmit",
    "test:ci": "jest --ci --coverage"
  }
}
```

### 2. Настройка автоматического деплоя на тестовую среду

1. Создать файл конфигурации для деплоя:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.STAGING_API_URL }}
      
      - name: Deploy to staging
        uses: burnett01/rsync-deployments@5.2.1
        with:
          switches: -avzr --delete
          path: build/
          remote_path: ${{ secrets.STAGING_PATH }}
          remote_host: ${{ secrets.STAGING_HOST }}
          remote_user: ${{ secrets.STAGING_USER }}
          remote_key: ${{ secrets.STAGING_SSH_KEY }}
```

### 3. Настройка статического анализа кода

1. Настроить ESLint:

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
```

2. Настроить Prettier:

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
};
```

3. Настроить SonarQube:

```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  sonarqube:
    name: SonarQube Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:ci
      
      - name: SonarQube Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=tire-service-master-web
            -Dsonar.organization=tire-service
            -Dsonar.sources=src
            -Dsonar.tests=src
            -Dsonar.test.inclusions=src/**/*.test.tsx,src/**/*.test.ts
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            -Dsonar.testExecutionReportPaths=test-report.xml
```

### 4. Настройка автоматической проверки PR

1. Настроить GitHub Actions для проверки PR:

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  check:
    name: Check PR
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build
```

2. Настроить правила для веток:

```yaml
# .github/branch-protection.yml
branches:
  - name: main
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
        require_code_owner_reviews: true
      required_status_checks:
        strict: true
        contexts:
          - Lint
          - Test
          - Build
          - SonarQube Analysis
      enforce_admins: false
      restrictions: null
  
  - name: develop
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
      required_status_checks:
        strict: true
        contexts:
          - Lint
          - Test
          - Build
      enforce_admins: false
      restrictions: null
```

### 5. Настройка автоматического деплоя на продакшн

1. Создать файл конфигурации для деплоя на продакшн:

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.PRODUCTION_API_URL }}
      
      - name: Deploy to production
        uses: burnett01/rsync-deployments@5.2.1
        with:
          switches: -avzr --delete
          path: build/
          remote_path: ${{ secrets.PRODUCTION_PATH }}
          remote_host: ${{ secrets.PRODUCTION_HOST }}
          remote_user: ${{ secrets.PRODUCTION_USER }}
          remote_key: ${{ secrets.PRODUCTION_SSH_KEY }}
```

### 6. Настройка автоматического создания релизов

1. Создать файл конфигурации для создания релизов:

```yaml
# .github/workflows/release.yml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            Changes in this Release:
            ${{ github.event.head_commit.message }}
          draft: false
          prerelease: false
```

## График работ

| Задача | Статус | Срок |
|--------|--------|------|
| Настройка GitHub Actions для CI | Запланировано | 2 дня |
| Настройка автоматического деплоя на тестовую среду | Запланировано | 2 дня |
| Настройка статического анализа кода | Запланировано | 3 дня |
| Настройка автоматической проверки PR | Запланировано | 1 день |
| Настройка автоматического деплоя на продакшн | Запланировано | 2 дня |
| Настройка автоматического создания релизов | Запланировано | 1 день |

## Критерии успешного завершения

1. Настроен автоматический процесс сборки и тестирования
2. Настроен автоматический деплой на тестовую среду
3. Настроен статический анализ кода
4. Настроена автоматическая проверка PR
5. Настроен автоматический деплой на продакшн
6. Настроено автоматическое создание релизов