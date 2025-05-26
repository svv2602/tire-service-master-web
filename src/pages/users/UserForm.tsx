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
import { 
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../api';
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
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { 
    data: userData,
    isLoading: isLoadingUser,
    error: userError 
  } = useGetUserByIdQuery(userId, {
    skip: !isEditMode
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isLoading = isLoadingUser || isCreating || isUpdating;
  const error = userError;

  // Заполнение формы данными пользователя
  useEffect(() => {
    if (isEditMode && userData?.data) {
      const user = userData.data;
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || UserRole.CLIENT,
        is_active: user.is_active === true,
        password: '',
        password_confirmation: ''
      });
    }
  }, [isEditMode, userData]);

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
        await updateUser({ id: userId, data: userData }).unwrap();
      } else {
        await createUser(userData).unwrap();
      }
      navigate('/users');
    } catch (error) {
      console.error('Ошибка при сохранении пользователя:', error);
    }
  };

  // Отмена и возврат к списку
  const handleCancel = () => {
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.toString()}
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
                  <InputLabel>Роль</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    label="Роль"
                  >
                    <MenuItem value={UserRole.ADMIN}>Администратор</MenuItem>
                    <MenuItem value={UserRole.MANAGER}>Менеджер</MenuItem>
                    <MenuItem value={UserRole.OPERATOR}>Оператор</MenuItem>
                    <MenuItem value={UserRole.CLIENT}>Клиент</MenuItem>
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
                  label="Активен"
                />
              </div>
            </div>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              {isEditMode ? 'Изменить пароль' : 'Пароль'}
            </Typography>

            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
              <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Пароль"
                  name="password"
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
                  type="password"
                  label="Подтверждение пароля"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  error={!!formErrors.password_confirmation}
                  helperText={formErrors.password_confirmation}
                  required={!isEditMode}
                />
              </div>
            </div>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleCancel}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
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