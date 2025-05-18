import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Временные данные для демонстрации
const mockClients = [
  { 
    id: 1, 
    first_name: 'Иван', 
    last_name: 'Иванов', 
    email: 'ivan@example.com', 
    phone: '+7 (900) 123-45-67',
    cars_count: 2,
    bookings_count: 5,
    verified: true
  },
  { 
    id: 2, 
    first_name: 'Мария', 
    last_name: 'Петрова', 
    email: 'maria@example.com', 
    phone: '+7 (900) 222-33-44',
    cars_count: 1,
    bookings_count: 3,
    verified: true
  },
  { 
    id: 3, 
    first_name: 'Алексей', 
    last_name: 'Смирнов', 
    email: 'alex@example.com', 
    phone: '+7 (900) 555-66-77',
    cars_count: 3,
    bookings_count: 8,
    verified: false
  },
];

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(mockClients);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(mockClients.length);

  const loadClients = useCallback(() => {
    setLoading(true);
    
    // Имитация загрузки данных с сервера
    setTimeout(() => {
      // Фильтрация по поисковому запросу (в реальном приложении это должно делаться на сервере)
      const filteredClients = mockClients.filter(client => 
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)
      );
      
      setClients(filteredClients);
      setTotalItems(filteredClients.length);
      setLoading(false);
    }, 500);
  }, [searchQuery]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSearch = () => {
    setPage(1);
    loadClients();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewClient = (id: number) => {
    navigate(`/clients/${id}`);
  };

  const handleAddClient = () => {
    navigate('/clients/create');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Клиенты</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Добавить клиента
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            placeholder="Имя, email или телефон"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Поиск
          </Button>
        </Box>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="clients table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Автомобили</TableCell>
                    <TableCell>Бронирования</TableCell>
                    <TableCell>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      }}
                      onClick={() => handleViewClient(client.id)}
                    >
                      <TableCell component="th" scope="row">
                        {client.id}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          {`${client.first_name} ${client.last_name}`}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                          {client.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                          {client.phone}
                        </Box>
                      </TableCell>
                      <TableCell>{client.cars_count}</TableCell>
                      <TableCell>{client.bookings_count}</TableCell>
                      <TableCell>
                        <Chip 
                          label={client.verified ? "Подтвержден" : "Не подтвержден"} 
                          color={client.verified ? "success" : "warning"} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(totalItems / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ClientsPage; 