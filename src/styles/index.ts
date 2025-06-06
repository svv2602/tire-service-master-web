// styles/index.ts
// Главный файл экспорта всех стилей

// Экспорт базовых констант и утилит темы
export {
  THEME_COLORS,
  SIZES,
  ANIMATIONS,
  GRADIENTS,
  getThemeColors,
  getGradient,
  type GradientType,
} from './theme';

// Экспорт стилей компонентов
export {
  getCardStyles,
  getButtonStyles,
  getTextFieldStyles,
  getChipStyles,
  getTableStyles,
  getFormStyles,
  getModalStyles,
  getNavigationStyles,
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
