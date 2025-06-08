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
  SliderSection
} from './sections';

const StyleGuidePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Style Guide
      </Typography>

      {/* Тема */}
      <Box sx={{ mb: 6 }}>
        <ThemeSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      {/* Основные компоненты */}
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Основные компоненты
      </Typography>

      <Box sx={{ mb: 6 }}>
        <TimePickerSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <SliderSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <ButtonSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <TextFieldSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <ChipSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <PaginationSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <BreadcrumbsSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <ProgressSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <CheckboxSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <RadioSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <SelectSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <SwitchSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <DatePickerSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <FileUploadSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <AutoCompleteSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      {/* Навигация и отображение данных */}
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Навигация и отображение данных
      </Typography>

      <Box sx={{ mb: 6 }}>
        <AppBarSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <DrawerSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <DropdownSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <TableSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <AccordionSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <StepperSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <ScrollbarSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      {/* Контейнеры и карточки */}
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Контейнеры и карточки
      </Typography>

      <Box sx={{ mb: 6 }}>
        <CardSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <PaperSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      {/* Вспомогательные компоненты */}
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Вспомогательные компоненты
      </Typography>

      <Box sx={{ mb: 6 }}>
        <BadgeSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <SpeedDialSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <RatingSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <TooltipSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <AlertSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <ModalSection />
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 6 }}>
        <FilterSection />
      </Box>
    </Container>
  );
};

export default StyleGuidePage; 