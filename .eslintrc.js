module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Кастомное правило: запрет прямых импортов из MUI
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@mui/material',
            message:
              '❌ Прямой импорт из @mui/material запрещен! Используйте централизованные UI компоненты из "../../components/ui" или "src/components/ui". См. документацию: design-unification/UI_COMPONENTS_GUIDE.md',
          },
          {
            name: '@mui/system',
            message:
              '❌ Прямой импорт из @mui/system запрещен! Используйте централизованные стили из "src/styles/theme" или "src/styles/components".',
          },
          {
            name: 'styled-components',
            message:
              '❌ Использование styled-components запрещено! Используйте MUI sx prop или централизованные стили из "src/styles".',
          },
        ],
        patterns: [
          {
            group: ['@mui/material/*'],
            message:
              '❌ Прямой импорт из @mui/material/* запрещен! Используйте централизованные UI компоненты из "../../components/ui".',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Исключения: сами UI компоненты и файлы настройки темы
      files: [
        'src/components/ui/**/*.{ts,tsx}',
        'src/styles/**/*.{ts,tsx}',
        'src/theme/**/*.{ts,tsx}',
        'src/contexts/ThemeContext.tsx',
        'src/App.tsx',
        'craco.config.js',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/__tests__/**/*.{ts,tsx}',
        'src/setupTests.ts',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      // Временное исключение для страниц в процессе миграции
      // TODO: Удалить эти исключения после завершения миграции
      files: [
        // Список страниц, которые еще не мигрированы
        // Постепенно удалять файлы отсюда по мере миграции
        'src/pages/client/**/*.{ts,tsx}',
        'src/pages/bookings/components/**/*.{ts,tsx}',
        'src/pages/partner-rewards/**/*.{ts,tsx}',
        'src/pages/agreements/**/*.{ts,tsx}',
        'src/pages/admin/**/*.{ts,tsx}',
        'src/pages/tire-models/**/*.{ts,tsx}',
        'src/pages/tire-brands/**/*.{ts,tsx}',
        'src/pages/countries/**/*.{ts,tsx}',
        'src/pages/notifications/**/*.{ts,tsx}',
        'src/pages/service-points/components/**/*.{ts,tsx}',
        'src/pages/partner-applications/**/*.{ts,tsx}',
        'src/pages/page-content/**/*.{ts,tsx}',
        'src/pages/operators/**/*.{ts,tsx}',
        'src/pages/audit-logs/**/*.{ts,tsx}',
        'src/pages/test/**/*.{ts,tsx}',
        'src/pages/tire-calculator/**/*.{ts,tsx}',
        'src/pages/knowledge-base/**/*.{ts,tsx}',
        'src/pages/my-bookings/**/*.{ts,tsx}',
        'src/pages/styleguide/**/*.{ts,tsx}',
        'src/pages/testing/**/*.{ts,tsx}',
        'src/pages/tire-search/**/*.{ts,tsx}',
      ],
      rules: {
        // Для файлов в процессе миграции - только предупреждение
        'no-restricted-imports': 'warn',
      },
    },
  ],
};

