#!/usr/bin/env node

/**
 * Скрипт для автоматической миграции импортов из @mui/material на централизованные UI компоненты
 * 
 * Использование:
 *   node migrate-mui-imports.js <путь-к-файлу-или-папке>
 * 
 * Примеры:
 *   node migrate-mui-imports.js src/pages/dashboard/DashboardPage.tsx
 *   node migrate-mui-imports.js src/pages/users/
 */

const fs = require('fs');
const path = require('path');

// Маппинг компонентов, доступных в централизованной UI библиотеке
const AVAILABLE_UI_COMPONENTS = new Set([
  'Alert',
  'Avatar',
  'Backdrop',
  'Badge',
  'Box',
  'Breadcrumbs',
  'Button',
  'Card',
  'CardActions',
  'CardContent',
  'CardMedia',
  'Checkbox',
  'Chip',
  'CircularProgress',
  'Container',
  'DatePicker',
  'Dialog',
  'DialogActions',
  'DialogContent',
  'DialogTitle',
  'Divider',
  'Drawer',
  'Dropdown',
  'FileUpload',
  'Filter',
  'Grid',
  'IconButton',
  'List',
  'ListItem',
  'ListItemButton',
  'ListItemIcon',
  'ListItemText',
  'Menu',
  'MenuItem',
  'Modal',
  'Pagination',
  'Paper',
  'Radio',
  'RadioGroup',
  'Rating',
  'Select',
  'Skeleton',
  'Slider',
  'Snackbar',
  'Stack',
  'Stepper',
  'Step',
  'StepLabel',
  'Switch',
  'Table',
  'TableBody',
  'TableCell',
  'TableContainer',
  'TableHead',
  'TableRow',
  'Tabs',
  'Tab',
  'TextField',
  'Tooltip',
  'Typography',
]);

// Компоненты, которые остаются из MUI (не переопределены в UI библиотеке)
const MUI_ONLY_COMPONENTS = new Set([
  'Autocomplete',
  'FormControl',
  'FormControlLabel',
  'FormGroup',
  'FormHelperText',
  'FormLabel',
  'InputAdornment',
  'InputLabel',
  'LinearProgress',
  'Link',
  'ListSubheader',
  'TablePagination', // Старый компонент, должен быть заменен на Pagination
  'Toolbar',
  'useTheme', // хук
  'useMediaQuery', // хук
  'styled', // функция
  'alpha', // функция
]);

/**
 * Парсит импорты из файла
 */
function parseImports(content) {
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/g;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1]
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    
    imports.push({
      fullMatch: match[0],
      items: importedItems,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return imports;
}

/**
 * Разделяет импорты на UI компоненты и MUI-only компоненты
 */
function categorizeImports(importedItems) {
  const uiComponents = [];
  const muiOnlyComponents = [];
  const unknown = [];

  importedItems.forEach(item => {
    // Обработка алиасов (as xxx)
    const cleanItem = item.split(' as ')[0].trim();
    
    if (AVAILABLE_UI_COMPONENTS.has(cleanItem)) {
      uiComponents.push(item);
    } else if (MUI_ONLY_COMPONENTS.has(cleanItem)) {
      muiOnlyComponents.push(item);
    } else {
      unknown.push(item);
    }
  });

  return { uiComponents, muiOnlyComponents, unknown };
}

/**
 * Вычисляет относительный путь к UI библиотеке
 */
function getRelativeUIPath(filePath) {
  const fileDir = path.dirname(filePath);
  const uiPath = path.join(process.cwd(), 'src', 'components', 'ui');
  const relativePath = path.relative(fileDir, uiPath);
  return relativePath.replace(/\\/g, '/');
}

/**
 * Генерирует новые импорты
 */
function generateNewImports(categorized, relativeUIPath) {
  const newImports = [];

  if (categorized.uiComponents.length > 0) {
    const uiImport = `import { ${categorized.uiComponents.join(', ')} } from '${relativeUIPath}';`;
    newImports.push(uiImport);
  }

  if (categorized.muiOnlyComponents.length > 0) {
    const muiImport = `import { ${categorized.muiOnlyComponents.join(', ')} } from '@mui/material';`;
    newImports.push(muiImport);
  }

  if (categorized.unknown.length > 0) {
    const unknownImport = `import { ${categorized.unknown.join(', ')} } from '@mui/material'; // TODO: Проверить доступность в UI библиотеке`;
    newImports.push(unknownImport);
  }

  return newImports.join('\n');
}

/**
 * Мигрирует импорты в файле
 */
function migrateFile(filePath, dryRun = false) {
  console.log(`\n📄 Обработка файла: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = parseImports(content);

  if (imports.length === 0) {
    console.log('  ℹ️  MUI импорты не найдены');
    return { migrated: false, changes: [] };
  }

  let newContent = content;
  const changes = [];
  const relativeUIPath = getRelativeUIPath(filePath);

  // Обрабатываем импорты в обратном порядке, чтобы индексы не сбивались
  for (let i = imports.length - 1; i >= 0; i--) {
    const importBlock = imports[i];
    const categorized = categorizeImports(importBlock.items);
    
    console.log(`  📦 Найдено импортов: ${importBlock.items.length}`);
    console.log(`    ✅ UI компоненты: ${categorized.uiComponents.length}`);
    console.log(`    ⚠️  MUI-only: ${categorized.muiOnlyComponents.length}`);
    console.log(`    ❓ Неизвестные: ${categorized.unknown.length}`);

    if (categorized.uiComponents.length > 0) {
      const newImportsText = generateNewImports(categorized, relativeUIPath);
      
      newContent = 
        newContent.substring(0, importBlock.startIndex) +
        newImportsText +
        newContent.substring(importBlock.endIndex);

      changes.push({
        old: importBlock.fullMatch,
        new: newImportsText,
        uiComponents: categorized.uiComponents,
        muiOnlyComponents: categorized.muiOnlyComponents,
      });
    }
  }

  if (changes.length > 0 && !dryRun) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('  ✅ Файл обновлен успешно');
  } else if (changes.length > 0 && dryRun) {
    console.log('  🔍 Dry-run режим: изменения не сохранены');
  }

  return { migrated: changes.length > 0, changes };
}

/**
 * Рекурсивно обходит директорию
 */
function migrateDirectory(dirPath, dryRun = false) {
  const stats = { total: 0, migrated: 0, errors: 0 };

  function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Пропускаем node_modules и другие служебные папки
        if (!['node_modules', '.git', 'build', 'dist'].includes(entry.name)) {
          processDir(fullPath);
        }
      } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        stats.total++;
        try {
          const result = migrateFile(fullPath, dryRun);
          if (result.migrated) {
            stats.migrated++;
          }
        } catch (error) {
          console.error(`  ❌ Ошибка: ${error.message}`);
          stats.errors++;
        }
      }
    }
  }

  processDir(dirPath);
  return stats;
}

/**
 * Главная функция
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📚 Скрипт миграции MUI импортов на централизованные UI компоненты

Использование:
  node migrate-mui-imports.js <путь> [--dry-run]

Опции:
  --dry-run    Только показать изменения, не применять их

Примеры:
  node migrate-mui-imports.js src/pages/dashboard/DashboardPage.tsx
  node migrate-mui-imports.js src/pages/users/ --dry-run
  node migrate-mui-imports.js src/pages/ --dry-run
    `);
    process.exit(0);
  }

  const targetPath = args[0];
  const dryRun = args.includes('--dry-run');
  const fullPath = path.resolve(process.cwd(), targetPath);

  console.log(`\n🚀 Начинаем миграцию MUI импортов`);
  console.log(`📂 Путь: ${fullPath}`);
  console.log(`🔍 Режим: ${dryRun ? 'Dry-run (без изменений)' : 'Применение изменений'}\n`);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Ошибка: Путь не существует: ${fullPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(fullPath);

  if (stats.isFile()) {
    const result = migrateFile(fullPath, dryRun);
    console.log(`\n📊 Итого: ${result.migrated ? 'Мигрировано ✅' : 'Изменений не требуется'}`);
  } else if (stats.isDirectory()) {
    const results = migrateDirectory(fullPath, dryRun);
    console.log(`\n📊 Статистика миграции:`);
    console.log(`  📁 Всего файлов обработано: ${results.total}`);
    console.log(`  ✅ Файлов мигрировано: ${results.migrated}`);
    console.log(`  ❌ Ошибок: ${results.errors}`);
    console.log(`  ✨ Без изменений: ${results.total - results.migrated - results.errors}`);
  }

  console.log('\n✅ Миграция завершена!');
}

// Запуск скрипта
main();

