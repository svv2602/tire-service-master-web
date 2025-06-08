import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';
import {
  ButtonSection,
  TextFieldSection,
  ChipSection,
  PaginationSection,
  BreadcrumbsSection,
  ProgressSection,
  TableSection,
  DropdownSection,
  AlertSection,
  ModalSection,
  TooltipSection,
  CheckboxSection,
  RadioSection,
  SelectSection,
  SwitchSection,
  ThemeSection,
  DatePickerSection,
  AccordionSection,
  StepperSection,
  FilterSection,
  ScrollbarSection,
  AppBarSection,
  CardSection,
  DrawerSection,
  TimePickerSection,
  AutoCompleteSection,
  FileUploadSection,
  SpeedDialSection,
  PaperSection,
  BadgeSection,
  RatingSection,
  SliderSection,
  ColorSection,
  SkeletonSection,
  TabsSection,
  NotificationSection
} from './sections';

// Интерфейс для описания секции
interface StyleGuideSection {
  title: string;
  component: React.ComponentType;
}

// Конфигурация всех секций с группировкой
const sectionGroups = [
  {
    groupTitle: 'Тема оформления',
    sections: [
      { title: 'Тема', component: ThemeSection },
      { title: 'Цвета', component: ColorSection }
    ]
  },
  {
    groupTitle: 'Основные компоненты',
    sections: [
      { title: 'Кнопки', component: ButtonSection },
      { title: 'Текстовые поля', component: TextFieldSection },
      { title: 'Чипы', component: ChipSection },
      { title: 'Пагинация', component: PaginationSection },
      { title: 'Хлебные крошки', component: BreadcrumbsSection },
      { title: 'Прогресс', component: ProgressSection },
      { title: 'Чекбоксы', component: CheckboxSection },
      { title: 'Радиокнопки', component: RadioSection },
      { title: 'Селект', component: SelectSection },
      { title: 'Переключатели', component: SwitchSection },
      { title: 'Выбор даты', component: DatePickerSection },
      { title: 'Выбор времени', component: TimePickerSection },
      { title: 'Загрузка файлов', component: FileUploadSection },
      { title: 'Автодополнение', component: AutoCompleteSection },
      { title: 'Слайдер', component: SliderSection }
    ]
  },
  {
    groupTitle: 'Навигация и отображение данных',
    sections: [
      { title: 'Панель приложения', component: AppBarSection },
      { title: 'Боковая панель', component: DrawerSection },
      { title: 'Вкладки', component: TabsSection },
      { title: 'Выпадающее меню', component: DropdownSection },
      { title: 'Таблицы', component: TableSection },
      { title: 'Аккордеон', component: AccordionSection },
      { title: 'Степпер', component: StepperSection },
      { title: 'Скроллбар', component: ScrollbarSection }
    ]
  },
  {
    groupTitle: 'Контейнеры и карточки',
    sections: [
      { title: 'Карточки', component: CardSection },
      { title: 'Бумага', component: PaperSection }
    ]
  },
  {
    groupTitle: 'Вспомогательные компоненты',
    sections: [
      { title: 'Значки', component: BadgeSection },
      { title: 'Быстрый набор', component: SpeedDialSection },
      { title: 'Рейтинг', component: RatingSection },
      { title: 'Подсказки', component: TooltipSection },
      { title: 'Уведомления', component: AlertSection },
      { title: 'Нотификации', component: NotificationSection },
      { title: 'Модальные окна', component: ModalSection },
      { title: 'Фильтры', component: FilterSection },
      { title: 'Скелетон', component: SkeletonSection }
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

      {/* Типография как отдельная секция */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Типография
        </Typography>
        <Box sx={{ '& > *': { mb: 2 } }}>
          <Typography variant="h1" gutterBottom>H1 Заголовок</Typography>
          <Typography variant="h2" gutterBottom>H2 Заголовок</Typography>
          <Typography variant="h3" gutterBottom>H3 Заголовок</Typography>
          <Typography variant="h4" gutterBottom>H4 Заголовок</Typography>
          <Typography variant="h5" gutterBottom>H5 Заголовок</Typography>
          <Typography variant="h6" gutterBottom>H6 Заголовок</Typography>
          <Typography variant="body1" gutterBottom>
            Body 1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Quos blanditiis tenetur unde suscipit.
          </Typography>
          <Typography variant="body2" gutterBottom>
            Body 2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Quos blanditiis tenetur unde suscipit.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default StyleGuide;