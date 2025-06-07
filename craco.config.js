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
      return webpackConfig;
    },
  },
}; 