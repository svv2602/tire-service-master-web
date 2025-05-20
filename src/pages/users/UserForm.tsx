import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUserById, createUser, updateUser, clearError } from '../../store/slices/usersSlice';
import { UserRole } from '../../types';

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  password?: string;
  password_confirmation?: string;
}

const initialFormData: UserFormData = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: UserRole.CLIENT,
  is_active: true,
  password: '',
  password_confirmation: ''
};

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const userId = isEditMode ? parseInt(id, 10) : 0;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading, error } = useSelector((state: RootState) => state.users);

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Загрузка данных пользователя при редактировании
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchUserById(userId));
    } else {
      // Сброс формы при создании нового пользователя
      setFormData(initialFormData);
    }
  }, [dispatch, isEditMode, userId]);

  // Заполнение формы данными пользователя
  useEffect(() => {
    if (isEditMode && selectedUser) {
      setFormData({
        email: selectedUser.email || '',
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        phone: selectedUser.phone || '',
        role: selectedUser.role || UserRole.CLIENT,
        is_active: selectedUser.is_active === true,
        password: '',
        password_confirmation: ''
      });
    }
  }, [isEditMode, selectedUser]);

  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });

      // Сброс ошибки при изменении поля
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: ''
        });
      }
    }
  };

  // Обработка изменения полей Select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });

      // Сброс ошибки при изменении поля
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: ''
        });
      }
    }
  };

  // Обработка изменения чекбокса
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный формат email';
    }

    if (!formData.first_name) {
      errors.first_name = 'Имя обязательно';
    }

    if (!formData.last_name) {
      errors.last_name = 'Фамилия обязательна';
    }

    if (!isEditMode && !formData.password) {
      errors.password = 'Пароль обязателен для нового пользователя';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Пароли не совпадают';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Подготовка данных для отправки
    const userData = {
      ...formData
    };

    // Удаляем поля пароля, если они пустые при редактировании
    if (isEditMode && !userData.password) {
      delete userData.password;
      delete userData.password_confirmation;
    }

    try {
      if (isEditMode) {
        await dispatch(updateUser({ id: userId, data: userData })).unwrap();
        navigate('/users');
      } else {
        await dispatch(createUser(userData)).unwrap();
        navigate('/users');
      }
    } catch (error) {
      // Ошибка обрабатывается в slice
    }
  };

  // Отмена и возврат к списку
  const handleCancel = () => {
    dispatch(clearError());
    navigate('/users');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование пользователя' : 'Создание пользователя'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  error={!!formErrors.first_name}
                  helperText={formErrors.first_name}
                  required
                />
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  error={!!formErrors.last_name}
                  helperText={formErrors.last_name}
                  required
                />
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Роль</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    label="Роль"
                  >
                    <MenuItem value={UserRole.CLIENT}>Клиент</MenuItem>
                    <MenuItem value={UserRole.MANAGER}>Менеджер</MenuItem>
                    <MenuItem value={UserRole.PARTNER}>Партнер</MenuItem>
                    <MenuItem value={UserRole.ADMIN}>Администратор</MenuItem>
                  </Select>
                </FormControl>
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Активный пользователь"
                />
              </div>
              
              <div style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isEditMode ? 'Сменить пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
                </Typography>
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  label="Пароль"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required={!isEditMode}
                />
              </div>
              
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  label="Подтверждение пароля"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  error={!!formErrors.password_confirmation}
                  helperText={formErrors.password_confirmation}
                  required={!isEditMode}
                />
              </div>
            </div>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={handleCancel}>
                Отмена
              </Button>
              <Button variant="contained" color="primary" type="submit">
                {isEditMode ? 'Сохранить' : 'Создать'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default UserForm; 