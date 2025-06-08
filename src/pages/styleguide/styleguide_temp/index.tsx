import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
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
import StyleGuidePage from './StyleGuidePage';

const sectionStyle = {
  mb: 4,
  p: 3,
  borderRadius: 2,
  bgcolor: 'background.paper',
  boxShadow: 1,
};

const StyleGuide: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ mb: 4 }}>
        Style Guide
      </Typography>

      {/* Тема */}
      <Paper sx={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Тема
        </Typography>
        <ThemeSection />
      </Paper>

      {/* Основные компоненты */}
      <Paper sx={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Основные компоненты
        </Typography>
        <Box sx={{ '& > *': { mb: 4 } }}>
          <TimePickerSection />
          <SliderSection />
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
          <FileUploadSection />
          <AutoCompleteSection />
        </Box>
      </Paper>

      {/* Навигация и отображение данных */}
      <Paper sx={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Навигация и отображение данных
        </Typography>
        <Box sx={{ '& > *': { mb: 4 } }}>
          <AppBarSection />
          <DrawerSection />
          <DropdownSection />
          <TableSection />
          <AccordionSection />
          <StepperSection />
          <ScrollbarSection />
        </Box>
      </Paper>

      {/* Контейнеры и карточки */}
      <Paper sx={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Контейнеры и карточки
        </Typography>
        <Box sx={{ '& > *': { mb: 4 } }}>
          <CardSection />
          <PaperSection />
        </Box>
      </Paper>

      {/* Вспомогательные компоненты */}
      <Paper sx={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Вспомогательные компоненты
        </Typography>
        <Box sx={{ '& > *': { mb: 4 } }}>
          <BadgeSection />
          <SpeedDialSection />
          <RatingSection />
          <TooltipSection />
          <AlertSection />
          <ModalSection />
          <FilterSection />
        </Box>
      </Paper>

      {/* Типография */}
      <Paper sx={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
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
      </Paper>
    </Container>
  );
};

export default StyleGuidePage;