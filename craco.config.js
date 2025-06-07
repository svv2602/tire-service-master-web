const path = require('path');

// Конфигурация CRACO для настройки webpack
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Добавляем поддержку ESM модулей
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });
      webpackConfig.alias = {
        '@': path.resolve(__dirname, 'src'),
      };
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  },
}; 