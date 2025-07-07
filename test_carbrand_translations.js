const fs = require('fs');
const ru = JSON.parse(fs.readFileSync('src/i18n/locales/ru.json', 'utf8'));
const uk = JSON.parse(fs.readFileSync('src/i18n/locales/uk.json', 'utf8'));

console.log('=== РУССКИЕ ПЕРЕВОДЫ ===');
console.log('forms.carBrand.title.edit:', ru.forms.carBrand?.title?.edit);
console.log('forms.carBrand.fields.name:', ru.forms.carBrand?.fields?.name);
console.log('forms.carBrand.fields.logo:', ru.forms.carBrand?.fields?.logo);
console.log('forms.carBrand.sections.brandInfo:', ru.forms.carBrand?.sections?.brandInfo);
console.log('forms.carBrand.buttons.uploadLogo:', ru.forms.carBrand?.buttons?.uploadLogo);
console.log('forms.carBrand.messages.logoRequirements:', ru.forms.carBrand?.messages?.logoRequirements);
console.log('forms.carBrand.fields.isActive:', ru.forms.carBrand?.fields?.isActive);

console.log('\n=== УКРАИНСКИЕ ПЕРЕВОДЫ ===');
console.log('forms.carBrand.title.edit:', uk.forms.carBrand?.title?.edit);
console.log('forms.carBrand.fields.name:', uk.forms.carBrand?.fields?.name);
console.log('forms.carBrand.fields.logo:', uk.forms.carBrand?.fields?.logo);
console.log('forms.carBrand.sections.brandInfo:', uk.forms.carBrand?.sections?.brandInfo);
console.log('forms.carBrand.buttons.uploadLogo:', uk.forms.carBrand?.buttons?.uploadLogo);
console.log('forms.carBrand.messages.logoRequirements:', uk.forms.carBrand?.messages?.logoRequirements);
console.log('forms.carBrand.fields.isActive:', uk.forms.carBrand?.fields?.isActive);
