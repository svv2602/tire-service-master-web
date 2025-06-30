const path = require('path');

// Конфигурация CRACO для настройки webpack
module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
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

      // Оптимизация TypeScript checker для стабильности
      if (env === 'development') {
        const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
        
        // Находим и настраиваем существующий TypeScript checker
        const tsCheckerIndex = webpackConfig.plugins.findIndex(
          plugin => plugin instanceof ForkTsCheckerWebpackPlugin
        );
        
        if (tsCheckerIndex !== -1) {
          // Заменяем на оптимизированную версию
          webpackConfig.plugins[tsCheckerIndex] = new ForkTsCheckerWebpackPlugin({
            typescript: {
              memoryLimit: 2048, // Ограничиваем память до 2GB
              diagnosticOptions: {
                semantic: true,
                syntactic: true,
              },
            },
            issue: {
              include: [
                { file: '**/src/**/*.{ts,tsx}' },
              ],
              exclude: [
                { file: '**/src/**/__tests__/**' },
                { file: '**/src/**/?(*.){spec|test}.*' },
              ],
            },
            logger: {
              infrastructure: 'silent',
            },
          });
        }
      }
      
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