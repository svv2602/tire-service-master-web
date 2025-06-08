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
      
      // Настраиваем алиасы
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      
      webpackConfig.resolve.alias = {
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