# План внедрения тестирования

## Цели

1. Увеличить покрытие кода тестами до 80%
2. Внедрить модульное тестирование компонентов и хуков
3. Настроить автоматическое тестирование при сборке
4. Обеспечить стабильность приложения при внесении изменений

## Текущее состояние

- Текущее покрытие кода тестами: ~20%
- Отсутствуют тесты для большинства компонентов
- Отсутствуют тесты для хуков и утилит
- Нет интеграционных тестов для ключевых пользовательских сценариев

## План работ

### 1. Настройка инфраструктуры тестирования

1. Обновить конфигурацию Jest:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/reportWebVitals.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

2. Настроить файл setupTests.ts:

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Увеличиваем таймаут для асинхронных операций
configure({ asyncUtilTimeout: 5000 });

// Мок для fetch
global.fetch = jest.fn();

// Мок для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Мок для matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

3. Создать вспомогательные утилиты для тестирования:

```typescript
// src/utils/test-utils.tsx
import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { createAppTheme } from '@/styles/theme/theme';

// Создаем тестовый store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

// Создаем обертку для тестов
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
  theme?: 'light' | 'dark';
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    theme = 'light',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const appTheme = createAppTheme(theme);
  
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <ThemeProvider theme={appTheme}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    );
  }
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Мок для RTK Query
export const createMockApiResponse = (data: any) => {
  return {
    data,
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: jest.fn(),
  };
};
```

### 2. Тестирование ��омпонентов

#### Этап 1: Базовые компоненты (высокий приоритет)

1. Button
2. TextField
3. Card
4. Select
5. Checkbox

Пример теста для компонента Button:

```typescript
// src/components/ui/Button/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { renderWithProviders } from '@/utils/test-utils';

describe('Button', () => {
  it('отображает текст кнопки', () => {
    renderWithProviders(<Button>Текст кнопки</Button>);
    expect(screen.getByText('Текст кнопки')).toBeInTheDocument();
  });

  it('вызывает onClick при клике', () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Кликни меня</Button>);
    fireEvent.click(screen.getByText('Кликни меня'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('отключается при disabled=true', () => {
    renderWithProviders(<Button disabled>Отключено</Button>);
    expect(screen.getByText('Отключено')).toBeDisabled();
  });

  it('применяет различные варианты', () => {
    const { rerender } = renderWithProviders(
      <Button variant="contained" color="primary">Основная</Button>
    );
    let button = screen.getByText('Основная');
    expect(button).toHaveClass('MuiButton-containedPrimary');

    rerender(
      <Button variant="outlined" color="secondary">Вторичная</Button>
    );
    button = screen.getByText('Вторичная');
    expect(button).toHaveClass('MuiButton-outlinedSecondary');
  });
});
```

#### Этап 2: Составные компоненты (средний приоритет)

1. Dialog
2. Modal
3. Table
4. Tabs
5. List

#### Этап 3: Страницы и макеты (низкий приоритет)

1. MainLayout
2. Header
3. Sidebar
4. Footer
5. Основные страницы

### 3. Тестирование хуков

1. Создать тесты для пользовательских хуков:

```typescript
// src/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from './useAuth';
import { authReducer } from '@/store/slices/authSlice';

describe('useAuth', () => {
  it('возвращает информацию о пользователе', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Test User' },
          isAuthenticated: true,
        },
      },
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 1, name: 'Test User' });
  });

  it('выполняет выход пользователя', async () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Test User' },
          isAuthenticated: true,
        },
      },
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### 4. Тестирование Redux

1. Тестирование редьюсеров:

```typescript
// src/store/slices/authSlice.test.ts
import { authReducer, login, logout } from './authSlice';

describe('authReducer', () => {
  it('устанавливает пользователя при входе', () => {
    const initialState = {
      user: null,
      isAuthenticated: false,
    };
    
    const user = { id: 1, name: 'Test User' };
    const action = login(user);
    const state = authReducer(initialState, action);
    
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });
  
  it('очищает пользователя при выходе', () => {
    const initialState = {
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
    };
    
    const action = logout();
    const state = authReducer(initialState, action);
    
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

2. Тестирование селекторов:

```typescript
// src/store/selectors/authSelectors.test.ts
import { selectUser, selectIsAuthenticated } from './authSelectors';

describe('authSelectors', () => {
  it('выбирает пользователя из состояния', () => {
    const user = { id: 1, name: 'Test User' };
    const state = {
      auth: {
        user,
        isAuthenticated: true,
      },
    };
    
    expect(selectUser(state)).toEqual(user);
  });
  
  it('выбирает статус аутентификации из состояния', () => {
    const state = {
      auth: {
        user: { id: 1, name: 'Test User' },
        isAuthenticated: true,
      },
    };
    
    expect(selectIsAuthenticated(state)).toBe(true);
  });
});
```

### 5. Тестирование API

1. Тестирование RTK Query:

```typescript
// src/api/users.api.test.ts
import { setupApiStore } from '@/utils/test-utils';
import { usersApi } from './users.api';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ])
    );
  }),
  
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({ id: Number(id), name: `User ${id}` })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usersApi', () => {
  const storeRef = setupApiStore(usersApi);
  
  it('получает список пользователей', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => usersApi.endpoints.getUsers.useQuery(),
      { wrapper: storeRef.wrapper }
    );
    
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ]);
  });
});
```

### 6. Интеграционные тесты

1. Тестирование основных пользовательских сценариев:

```typescript
// src/features/auth/Login.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Login } from './Login';
import { renderWithProviders } from '@/utils/test-utils';

const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'user@example.com' && password === 'password') {
      return res(
        ctx.json({
          user: { id: 1, email: 'user@example.com', name: 'Test User' },
          token: 'fake-token',
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Login', () => {
  it('успешно выполняет вход', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'password' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/успешный вход/i)).toBeInTheDocument();
    });
  });
  
  it('показывает ошибку при неверных данных', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrong' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/неверные учетные данные/i)).toBeInTheDocument();
    });
  });
});
```

### 7. Настройка CI/CD для тестирования

1. Добавить скрипты в package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage"
  }
}
```

2. Настроить GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage report
      uses: codecov/codecov-action@v2
```

## График работ

| Задача | Статус | Срок |
|--------|--------|------|
| Настройка инфраструктуры тестирования | Запланировано | 2 дня |
| Тестирование базовых компонентов | Запланировано | 5 дней |
| Тестирование составных компонентов | Запланировано | 7 дней |
| Тестирование хуков и Redux | Запланировано | 4 дня |
| Тестирование API | Запланировано | 3 дня |
| Интеграционные тесты | Запланировано | 5 дней |
| Настройка CI/CD для тестирования | Запланировано | 2 дня |

## Критерии успешного завершения

1. Покрытие кода тестами достигает 80%
2. Все базовые компоненты имеют тесты
3. Все хуки и утилиты имеют тесты
4. Настроено автоматическое тестирование при сборке
5. Документированы подходы к тестированию компонентов и хуков