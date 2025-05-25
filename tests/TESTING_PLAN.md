# 🧪 План тестирования фронтенда

## 📊 Текущее состояние

### ✅ Реализовано
- **Интеграционные тесты** (`tests/integration/`) - тестирование взаимодействия с API

### ❌ Отсутствует
- Unit тесты компонентов
- Unit тесты утилит и хуков
- Тесты Redux store и slice'ов
- E2E тесты пользовательских сценариев
- Тесты производительности
- Accessibility тесты
- Visual regression тесты

## 🎯 Приоритетный план реализации

### 1. Unit тесты (Высокий приоритет)

#### 1.1 Компоненты
```
src/__tests__/components/
├── auth/
│   ├── LoginForm.test.tsx
│   ├── RegisterForm.test.tsx
│   └── ProtectedRoute.test.tsx
├── layouts/
│   ├── MainLayout.test.tsx
│   └── AuthLayout.test.tsx
├── common/
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   ├── Modal.test.tsx
│   └── LoadingSpinner.test.tsx
└── pages/
    ├── Dashboard.test.tsx
    ├── Partners.test.tsx
    └── ServicePoints.test.tsx
```

**Что тестировать:**
- Рендеринг компонентов
- Обработка пропсов
- Пользовательские взаимодействия
- Условный рендеринг
- Обработка ошибок

#### 1.2 Утилиты и хуки
```
src/__tests__/utils/
├── api.test.ts
├── validation.test.ts
├── formatters.test.ts
└── constants.test.ts

src/__tests__/hooks/
├── useAuth.test.ts
├── useApi.test.ts
└── useLocalStorage.test.ts
```

#### 1.3 Redux Store
```
src/__tests__/store/
├── authSlice.test.ts
├── partnersSlice.test.ts
├── servicePointsSlice.test.ts
└── store.test.ts
```

### 2. E2E тесты (Средний приоритет)

#### 2.1 Критические пользовательские сценарии
```
tests/e2e/
├── auth.spec.ts           # Аутентификация
├── partners.spec.ts       # Управление партнерами
├── service-points.spec.ts # Управление сервисными точками
├── dashboard.spec.ts      # Основная функциональность
└── navigation.spec.ts     # Навигация по приложению
```

**Инструменты:** Playwright или Cypress

### 3. Дополнительные тесты (Низкий приоритет)

#### 3.1 Performance тесты
- Время загрузки страниц
- Размер бандла
- Lighthouse аудит

#### 3.2 Accessibility тесты
- Поддержка screen readers
- Keyboard navigation
- ARIA атрибуты
- Цветовой контраст

#### 3.3 Visual Regression тесты
- Скриншоты компонентов
- Сравнение с эталонами

## 🛠️ Инструменты и настройка

### Текущие зависимости
- ✅ Jest - test runner
- ✅ @testing-library/react - тестирование React компонентов
- ✅ @testing-library/jest-dom - дополнительные матчеры
- ✅ @testing-library/user-event - симуляция пользовательских действий

### Нужно добавить
- **MSW** (Mock Service Worker) - мокирование API
- **Playwright** или **Cypress** - E2E тестирование
- **@testing-library/react-hooks** - тестирование хуков
- **jest-axe** - accessibility тестирование

## 📋 Конфигурация

### Jest конфигурация
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/reportWebVitals.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Структура тестовых файлов
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── ...
├── __tests__/           # Общие тесты
│   ├── utils/
│   ├── hooks/
│   └── store/
└── setupTests.ts        # Настройка тестовой среды
```

## 🎯 Метрики качества

### Покрытие кода
- **Минимум:** 70%
- **Цель:** 85%
- **Критические компоненты:** 95%

### Типы покрытия
- **Lines:** Покрытие строк кода
- **Functions:** Покрытие функций
- **Branches:** Покрытие ветвлений
- **Statements:** Покрытие операторов

## 🚀 План внедрения

### Этап 1: Базовые Unit тесты (1-2 недели)
1. Настройка тестовой среды
2. Тесты критических компонентов (LoginForm, Dashboard)
3. Тесты основных утилит
4. Тесты Redux slice'ов

### Этап 2: Расширенные Unit тесты (1 неделя)
1. Тесты всех компонентов
2. Тесты хуков
3. Достижение 80% покрытия

### Этап 3: E2E тесты (1-2 недели)
1. Настройка Playwright/Cypress
2. Тесты критических сценариев
3. Интеграция в CI/CD

### Этап 4: Дополнительные тесты (по необходимости)
1. Performance тесты
2. Accessibility тесты
3. Visual regression тесты

## 📝 Примеры тестов

### Unit тест компонента
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Unit тест Redux slice
```typescript
// authSlice.test.ts
import { authSlice, login, logout } from './authSlice';

describe('authSlice', () => {
  it('should handle login', () => {
    const initialState = { user: null, token: null };
    const action = login({ user: { id: 1, email: 'test@test.com' }, token: 'abc123' });
    
    const state = authSlice.reducer(initialState, action);
    
    expect(state.user).toEqual({ id: 1, email: 'test@test.com' });
    expect(state.token).toBe('abc123');
  });
});
```

### E2E тест
```typescript
// auth.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

## 🔗 Полезные ресурсы

- [Testing Library документация](https://testing-library.com/)
- [Jest документация](https://jestjs.io/)
- [Playwright документация](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 