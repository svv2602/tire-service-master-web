import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';
import {
  // Основы дизайна
  ThemeSection,
  ColorSection,
  TypographySection,
  
  // Элементы ввода
  ButtonSection,
  TextFieldSection,
  CheckboxSection,
  RadioSection,
  SelectSection,
  SwitchSection,
  SliderSection,
  AutoCompleteSection,
  FileUploadSection,
  
  // Элементы даты и времени
  DatePickerSection,
  TimePickerSection,
  
  // Навигация
  AppBarSection,
  DrawerSection,
  TabsSection,
  BreadcrumbsSection,
  PaginationSection,
  StepperSection,
  
  // Отображение данных
  TableSection,
  ChipSection,
  BadgeSection,
  AvatarSection,
  RatingSection,
  ProgressSection,
  
  // Компоновка и структура
  GridSection,
  PaperSection,
  CardSection,
  AccordionSection,
  DividerSection,
  
  // Обратная связь
  AlertSection,
  NotificationSection,
  TooltipSection,
  ModalSection,
  SkeletonSection,
  
  // Утилитарные компоненты
  FilterSection,
  SpeedDialSection,
  ScrollbarSection,
  DropdownSection
} from './sections';

// Интерфейс для описания секции
interface StyleGuideSection {
  title: string;
  component: React.ComponentType;
}

// Конфигурация всех секций с группировкой
const sectionGroups = [
  {
    groupTitle: 'Основы дизайна',
    sections: [
      { title: 'Тема', component: ThemeSection },
      { title: 'Цвета', component: ColorSection },
      { title: 'Типография', component: TypographySection }
    ]
  },
  {
    groupTitle: 'Элементы ввода',
    sections: [
      { title: 'Кнопки', component: ButtonSection },
      { title: 'Текстовые поля', component: TextFieldSection },
      { title: 'Чекбоксы', component: CheckboxSection },
      { title: 'Радиокнопки', component: RadioSection },
      { title: 'Селект', component: SelectSection },
      { title: 'Переключатели', component: SwitchSection },
      { title: 'Слайдер', component: SliderSection },
      { title: 'Автодополнение', component: AutoCompleteSection },
      { title: 'Загрузка файлов', component: FileUploadSection }
    ]
  },
  {
    groupTitle: 'Элементы даты и времени',
    sections: [
      { title: 'Выбор даты', component: DatePickerSection },
      { title: 'Выбор времени', component: TimePickerSection }
    ]
  },
  {
    groupTitle: 'Навигация',
    sections: [
      { title: 'Панель приложения', component: AppBarSection },
      { title: 'Боковая панель', component: DrawerSection },
      { title: 'Вкладки', component: TabsSection },
      { title: 'Хлебные крошки', component: BreadcrumbsSection },
      { title: 'Пагинация', component: PaginationSection },
      { title: 'Степпер', component: StepperSection }
    ]
  },
  {
    groupTitle: 'Отображение данных',
    sections: [
      { title: 'Таблицы', component: TableSection },
      { title: 'Чипы', component: ChipSection },
      { title: 'Значки', component: BadgeSection },
      { title: 'Аватары', component: AvatarSection },
      { title: 'Рейтинг', component: RatingSection },
      { title: 'Прогресс', component: ProgressSection }
    ]
  },
  {
    groupTitle: 'Компоновка и структура',
    sections: [
      { title: 'Сетка', component: GridSection },
      { title: 'Бумага', component: PaperSection },
      { title: 'Карточки', component: CardSection },
      { title: 'Аккордеон', component: AccordionSection },
      { title: 'Разделители', component: DividerSection }
    ]
  },
  {
    groupTitle: 'Обратная связь',
    sections: [
      { title: 'Уведомления', component: AlertSection },
      { title: 'Нотификации', component: NotificationSection },
      { title: 'Подсказки', component: TooltipSection },
      { title: 'Модальные окна', component: ModalSection },
      { title: 'Скелетон', component: SkeletonSection }
    ]
  },
  {
    groupTitle: 'Утилитарные компоненты',
    sections: [
      { title: 'Фильтры', component: FilterSection },
      { title: 'Быстрый набор', component: SpeedDialSection },
      { title: 'Скроллбар', component: ScrollbarSection },
      { title: 'Выпадающее меню', component: DropdownSection }
    ]
  }
];

// Компонент для отображения одной секции в унифицированном формате
const SectionWrapper: React.FC<{ section: StyleGuideSection }> = ({ section }) => {
  const Component = section.component;
  
  return (
    <Box sx={{ mb: 6 }}>
      <Component />
    </Box>
  );
};

const StyleGuide: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ mb: 6 }}>
        Style Guide
      </Typography>

      {sectionGroups.map((group, groupIndex) => (
        <Box key={group.groupTitle} sx={{ mb: 8 }}>
          {/* Заголовок группы */}
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            {group.groupTitle}
          </Typography>

          {/* Секции группы */}
          {group.sections.map((section, sectionIndex) => (
            <React.Fragment key={section.title}>
              <SectionWrapper section={section} />
              
              {/* Разделитель между секциями (кроме последней в группе) */}
              {sectionIndex < group.sections.length - 1 && (
                <Divider sx={{ my: 4 }} />
              )}
            </React.Fragment>
          ))}

          {/* Разделитель между группами (кроме последней) */}
          {groupIndex < sectionGroups.length - 1 && (
            <Divider sx={{ my: 6, borderColor: 'primary.main', borderWidth: 2 }} />
          )}
        </Box>
      ))}
    </Container>
  );
};

export default StyleGuide;