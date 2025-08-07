import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Stack,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as CountryIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles';
import Pagination from '../../components/ui/Pagination/Pagination';

// Временные типы данных (позже заменить на реальные API)
interface Country {
  id: number;
  name: string;
  code: string; // ISO код страны (например, "UA", "DE", "JP")
  flag?: string; // URL флага
  isActive: boolean;
  createdAt: string;
}

const CountriesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Временные данные (заменить на API)
  const mockCountries: Country[] = [
    { id: 1, name: 'Украина', code: 'UA', isActive: true, createdAt: '2025-01-01' },
    { id: 2, name: 'Германия', code: 'DE', isActive: true, createdAt: '2025-01-01' },
    { id: 3, name: 'Япония', code: 'JP', isActive: true, createdAt: '2025-01-01' },
    { id: 4, name: 'Италия', code: 'IT', isActive: true, createdAt: '2025-01-01' },
    { id: 5, name: 'Франция', code: 'FR', isActive: true, createdAt: '2025-01-01' },
  ];

  const filteredCountries = mockCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredCountries.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedCountries = filteredCountries.slice(startIndex, startIndex + rowsPerPage);

  const handleCreate = () => {
    setSelectedCountry(null);
    setDialogOpen(true);
  };

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setDialogOpen(true);
  };

  const handleDelete = (country: Country) => {
    setSelectedCountry(country);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: Реализовать сохранение через API
    setDialogOpen(false);
    setSelectedCountry(null);
  };

  const handleConfirmDelete = () => {
    // TODO: Реализовать удаление через API
    setDeleteDialogOpen(false);
    setSelectedCountry(null);
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CountryIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={tablePageStyles.title}>
            {t('navigation.countries', 'Страны')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={tablePageStyles.primaryButton}
        >
          Добавить страну
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={tablePageStyles.filtersContainer}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск по названию или коду страны..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {/* Уведомление о разработке */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>В разработке:</strong> Эта страница находится в стадии разработки. 
          Функциональность создания, редактирования и удаления стран будет добавлена в следующих обновлениях.
        </Typography>
      </Alert>

      {/* Таблица */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Код страны</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCountries.map((country) => (
              <TableRow key={country.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {country.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {country.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: country.isActive ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  >
                    {country.isActive ? 'Активна' : 'Неактивна'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(country.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(country)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(country)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={tablePageStyles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={setPage}
          />
        </Box>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCountry ? 'Редактировать страну' : 'Добавить страну'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Название страны"
              variant="outlined"
              defaultValue={selectedCountry?.name || ''}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Код страны (ISO)"
              variant="outlined"
              defaultValue={selectedCountry?.code || ''}
              helperText="Двухбуквенный код страны (например: UA, DE, JP)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedCountry ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить страну "{selectedCountry?.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CountriesPage;