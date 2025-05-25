import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from '../../pages/auth/LoginPage';
import authReducer from '../../store/slices/authSlice';

// Мокирование config
jest.mock('../../config', () => ({
  AUTH_TOKEN_STORAGE_KEY: 'test_auth_token',
}));

// Мокирование API
jest.mock('../../api/api', () => ({
  __esModule: true,
  default: {
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

// Мокирование navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Создаем тему Material-UI для тестов
const theme = createTheme();

// Компонент-обертка для тестов
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('должен рендериться без ошибок', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    expect(screen.getByText('Введите email и пароль, чтобы войти в систему Твоя Шина')).toBeInTheDocument();
  });

  it('должен отображать поля ввода email и пароля', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('должен отображать кнопку "Войти"', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('Войти');
  });

  it('должен отображать тестовые данные для входа', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Тестовые данные для входа в систему:')).toBeInTheDocument();
    expect(screen.getByText('Email: admin@test.com, Пароль: admin')).toBeInTheDocument();
  });

  describe('валидация формы', () => {
    it('должен показывать ошибку при пустом email', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email обязателен')).toBeInTheDocument();
      });
    });

    it('должен показывать ошибку при некорректном email', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Некорректный формат email')).toBeInTheDocument();
      });
    });

    it('должен показывать ошибку при пустом пароле', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Пароль обязателен')).toBeInTheDocument();
      });
    });

    it('должен показывать ошибку при коротком пароле', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Пароль должен быть не менее 4 символов')).toBeInTheDocument();
      });
    });
  });

  describe('взаимодействие с пользователем', () => {
    it('должен обновлять значение email при вводе', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('должен обновлять значение пароля при вводе', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('должен очищать ошибки при исправлении email', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      // Сначала вызываем ошибку
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Email обязателен')).toBeInTheDocument();
      });

      // Затем исправляем
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Email обязателен')).not.toBeInTheDocument();
      });
    });

    it('должен очищать ошибки при исправлении пароля', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      // Заполняем email и вызываем ошибку пароля
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Пароль обязателен')).toBeInTheDocument();
      });

      // Затем исправляем пароль
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Пароль обязателен')).not.toBeInTheDocument();
      });
    });
  });

  describe('доступность (accessibility)', () => {
    it('должен иметь правильные aria-label для полей ввода', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput).toHaveAttribute('aria-label', 'Email');
      expect(passwordInput).toHaveAttribute('aria-label', 'Пароль');
    });

    it('должен устанавливать фокус на поле email при загрузке', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveFocus();
    });
  });

  describe('состояния загрузки', () => {
    it('должен отключать поля ввода во время загрузки', () => {
      // Создаем store с состоянием загрузки
      const storeWithLoading = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: true,
            error: null,
            isInitialized: false,
          },
        },
      });

      render(
        <Provider store={storeWithLoading}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <LoginPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
}); 