module.exports = {
  env: {
    serviceworker: true,
    browser: true,
    es6: true
  },
  globals: {
    self: 'readonly',
    clients: 'readonly',
    caches: 'readonly',
    skipWaiting: 'readonly',
    registration: 'readonly'
  },
  rules: {
    'no-restricted-globals': 'off'
  }
}; 