const fs = require('fs');
const ru = JSON.parse(fs.readFileSync('src/i18n/locales/ru.json', 'utf8'));
console.log('carBrand в основной секции forms:', !!ru.forms.carBrand);
console.log('carBrand в forms.forms:', !!ru.forms.forms.carBrand);
