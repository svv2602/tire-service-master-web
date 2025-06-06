import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useGetClientByIdQuery } from '../../api/clients.api';
import { useGetClientCarsQuery, useDeleteClientCarMutation } from '../../api/clients.api';
import { Client, ClientCar } from '../../types/client';
import { FlexBox, CenteredBox, StyledAlert } from '../../components/styled/CommonComponents';

const ClientCarsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  // Состояние для диалогов
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<ClientCar | null>(null);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId || '');
  const { data: cars, isLoading: isLoadingCars } = useGetClientCarsQuery(clientId || '');
  const [deleteCar, { isLoading: isDeleting }] = useDeleteClientCarMutation();

  const isLoading = isLoadingClient || isLoadingCars || isDeleting;

  // Обработчики событий
  const handleDeleteClick = (car: ClientCar) => {
    setSelectedCar(car);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCar && clientId) {
      try {
        await deleteCar({ clientId, carId: selectedCar.id.toString() }).unwrap();
        setDeleteDialogOpen(false);
        setSelectedCar(null);
      } catch (error) {
        console.error('Ошибка при удалении автомобиля:', error);
      }
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCar(null);
  };

  // Отображение состояний загрузки и ошибок
  if (isLoading) {
    return (
      <CenteredBox minHeight="400px">
        <CircularProgress />
      </CenteredBox>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <StyledAlert severity="error">
          Клиент не найден
        </StyledAlert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <FlexBox justifyContent="space-between" alignItems="center" my={3}>
        <Typography variant="h4">
          Автомобили клиента {client.first_name} {client.last_name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/clients/${clientId}/cars/new`)}
        >
          Добавить автомобиль
        </Button>
      </FlexBox>

      {/* Таблица автомобилей */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Марка</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Год</TableCell>
              <TableCell>Гос. номер</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars?.map((car: ClientCar) => (
              <TableRow key={car.id}>
                <TableCell>
                  <FlexBox alignItems="center" gap={1}>
                    <CarIcon />
                    <Typography>
                      {car.brand}
                    </Typography>
                  </FlexBox>
                </TableCell>
                <TableCell>{car.model}</TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell>{car.license_plate}</TableCell>
                <TableCell align="right">
                  <FlexBox justifyContent="flex-end" gap={1}>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/clients/${clientId}/cars/${car.id}/edit`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDeleteClick(car)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </FlexBox>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить автомобиль {selectedCar?.brand} {selectedCar?.model}?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientCarsPage; 