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
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Circle as TireBrandIcon,
  Search as SearchIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTablePageStyles } from '../../styles';
import Pagination from '../../components/ui/Pagination/Pagination';

// Временные типы данных (позже заменить на реальные API)
interface TireBrand {
  id: number;
  name: string;
  logo?: string; // URL логотипа
  countryId: number;
  countryName: string;
  description?: string;
  isActive: boolean;
  modelsCount: number; // Количество моделей шин этого бренда
  createdAt: string;
}

const TireBrandsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<TireBrand | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Временные данные (заменить на API)
  const mockBrands: TireBrand[] = [
    {
      id: 1,
      name: 'Michelin',
      countryId: 2,
      countryName: 'Франция',
      isActive: true,
      modelsCount: 15,
      createdAt: '2025-01-01',
      description: 'Французский производитель шин премиум класса'
    },
    {
      id: 2,
      name: 'Continental',
      countryId: 1,
      countryName: 'Германия',
      isActive: true,
      modelsCount: 12,
      createdAt: '2025-01-01',
      description: 'Немецкий бренд высококачественных шин'
    },
    {
      id: 3,
      name: 'Bridgestone',
      countryId: 3,
      countryName: 'Япония',
      isActive: true,
      modelsCount: 18,
      createdAt: '2025-01-01',
      description: 'Крупнейший японский производитель шин'
    },
    {
      id: 4,
      name: 'Pirelli',
      countryId: 4,
      countryName: 'Италия',
      isActive: true,
      modelsCount: 10,
      createdAt: '2025-01-01',
      description: 'Итальянский бренд спортивных шин'
    },
    {
      id: 5,
      name: 'Nokian',
      countryId: 5,
      countryName: 'Финляндия',
      isActive: true,
      modelsCount: 8,
      createdAt: '2025-01-01',
      description: 'Специалист по зимним шинам'
    },
  ];

  const filteredBrands = mockBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.countryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredBrands.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, startIndex + rowsPerPage);

  const handleCreate = () => {
    setSelectedBrand(null);
    setDialogOpen(true);
  };

  const handleEdit = (brand: TireBrand) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  };

  const handleDelete = (brand: TireBrand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: Реализовать сохранение через API
    setDialogOpen(false);
    setSelectedBrand(null);
  };

  const handleConfirmDelete = () => {
    // TODO: Реализовать удаление через API
    setDeleteDialogOpen(false);
    setSelectedBrand(null);
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TireBrandIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={tablePageStyles.title}>
            {t('navigation.tireBrands', 'Шинные бренды')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={tablePageStyles.primaryButton}
        >
          Добавить бренд
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={tablePageStyles.filtersContainer}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск по названию бренда или стране..."
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
          Функциональность создания, редактирования и удаления шинных брендов будет добавлена в следующих обновлениях.
        </Typography>
      </Alert>

      {/* Таблица */}
      <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Логотип</TableCell>
              <TableCell>Название бренда</TableCell>
              <TableCell>Страна</TableCell>
              <TableCell>Моделей</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBrands.map((brand) => (
              <TableRow key={brand.id} hover>
                <TableCell>
                  <Avatar
                    sx={{ width: 40, height: 40 }}
                    src={brand.logo}
                  >
                    <ImageIcon />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Stack>
                    <Typography variant="body1" fontWeight={600}>
                      {brand.name}
                    </Typography>
                    {brand.description && (
                      <Typography variant="caption" color="text.secondary">
                        {brand.description}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {brand.countryName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${brand.modelsCount} моделей`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: brand.isActive ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  >
                    {brand.isActive ? 'Активен' : 'Неактивен'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(brand)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(brand)}
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
          {selectedBrand ? 'Редактировать бренд' : 'Добавить бренд'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Название бренда"
              variant="outlined"
              defaultValue={selectedBrand?.name || ''}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Описание"
              variant="outlined"
              multiline
              rows={3}
              defaultValue={selectedBrand?.description || ''}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="URL логотипа"
              variant="outlined"
              defaultValue={selectedBrand?.logo || ''}
              helperText="Ссылка на изображение логотипа бренда"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedBrand ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить бренд "{selectedBrand?.name}"?
            Это действие также удалит все связанные модели шин. Действие нельзя отменить.
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

export default TireBrandsPage;