// styles/index.ts
// Главный файл экспорта всех стилей

// Экспорт базовых констант и утилит темы
export * from './theme';
export * from './theme/tokens';
export * from './auth';

// Экспорт стилей компонентов
export {
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getChipStyles,
  getFormStyles,
  getModalStyles,
  getTabStyles,
  getContainerStyles,
  getDashboardStyles,
  getTablePageStyles,
  type CardVariant,
  type ButtonVariant,
  type ChipVariant,
  type TextFieldVariant,
} from './components';

// Пример использования:
/*
import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  getFormStyles,
  THEME_COLORS,
  SIZES 
} from '../styles';

// В компоненте:
const theme = useTheme();
const cardStyles = getCardStyles(theme, 'primary');
const buttonStyles = getButtonStyles(theme, 'primary');
const textFieldStyles = getTextFieldStyles(theme, 'filled');
const formStyles = getFormStyles(theme);
*/
