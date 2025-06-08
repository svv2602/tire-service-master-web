import React from 'react';
import { Container, Typography, Box } from '@mui/material';
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
  SliderSection
} from './sections';

const StyleGuide: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Style Guide
      </Typography>

      {/* Тема */}
      <Box mb={6}>
        <ThemeSection />
      </Box>

      {/* Основные компоненты */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Основные компоненты
        </Typography>
        <ButtonSection />
        <TextFieldSection />
        <ChipSection />
        <PaginationSection />
        <BreadcrumbsSection />
        <ProgressSection />
        <CheckboxSection />
        <RadioSection />
        <SelectSection />
        <SwitchSection />
        <DatePickerSection />
        <TimePickerSection />
        <SliderSection />
        <FileUploadSection />
        <AutoCompleteSection />
      </Box>

      {/* Навигация и отображение данных */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Навигация и отображение данных
        </Typography>
        <AppBarSection />
        <DrawerSection />
        <DropdownSection />
        <TableSection />
        <AccordionSection />
        <StepperSection />
        <ScrollbarSection />
      </Box>

      {/* Контейнеры и карточки */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Контейнеры и карточки
        </Typography>
        <CardSection />
        <PaperSection />
      </Box>

      {/* Вспомогательные компоненты */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Вспомогательные компоненты
        </Typography>
        <BadgeSection />
        <SpeedDialSection />
        <RatingSection />
        <TooltipSection />
        <AlertSection />
        <ModalSection />
        <FilterSection />
      </Box>

      {/* Типография */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Типография
        </Typography>
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
    </Container>
  );
};

export default StyleGuide;