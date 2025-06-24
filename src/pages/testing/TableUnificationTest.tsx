import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormGroup, 
  FormControlLabel, 
  Switch,
  Divider
} from '@mui/material';
import { Table, Column } from '../../components/ui/Table/Table';
import { getTablePageStyles } from '../../styles/components';
import { useTheme } from '@mui/material/styles';

interface TestData {
  id: number;
  name: string;
  email: string;
  longUrl: string;
  status: string;
  description: string;
  date: string;
}

const generateTestData = (count: number = 10): TestData[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Пользователь ${index + 1}`,
    email: `user${index + 1}@example-very-long-domain-name.com`,
    longUrl: `https://very-long-domain-name-for-testing-word-wrap.com/api/v1/users/${index + 1}/profile/settings`,
    status: index % 3 === 0 ? 'Активен' : index % 3 === 1 ? 'Заблокирован' : 'Ожидает подтверждения',
    description: `Очень длинное описание пользователя ${index + 1} которое должно корректно переноситься по словам без разбиения слов на отдельные символы`,
    date: new Date(2025, 0, index + 1).toLocaleDateString('ru-RU')
  }));
};

export const TableUnificationTest: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  const [testData, setTestData] = useState<TestData[]>(generateTestData(10));
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [responsive, setResponsive] = useState(true);

  const columns: Column[] = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 50,
      maxWidth: 80,
      align: 'center',
      sticky: true,
    },
    {
      id: 'name',
      label: 'Имя',
      minWidth: 120,
      wrap: true,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
      maxWidth: 250,
      ellipsis: true,
      hideOnMobile: true,
    },
    {
      id: 'longUrl',
      label: 'Длинный URL',
      minWidth: 200,
      maxWidth: 300,
      wrap: true,
      hideOnMobile: true,
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      format: (value) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'medium',
            textAlign: 'center',
            backgroundColor: 
              value === 'Активен' ? 'success.light' :
              value === 'Заблокирован' ? 'error.light' : 'warning.light',
            color: 
              value === 'Активен' ? 'success.dark' :
              value === 'Заблокирован' ? 'error.dark' : 'warning.dark',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Описание',
      minWidth: 300,
      wrap: true,
    },
    {
      id: 'date',
      label: 'Дата',
      minWidth: 100,
      align: 'center',
    },
  ];

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleEmptyTest = () => {
    setShowEmpty(!showEmpty);
    setTestData(showEmpty ? generateTestData(10) : []);
  };

  const handleRowClick = (row: TestData) => {
    alert(`Клик по строке: ${row.name} (${row.email})`);
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🧪 Тестирование унификации таблиц
      </Typography>

      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Настройки тестирования
        </Typography>
        
        <FormGroup row sx={{ gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={responsive} onChange={(e) => setResponsive(e.target.checked)} />}
            label="Адаптивность"
          />
          <Button variant="outlined" onClick={handleLoadingTest} disabled={loading}>
            {loading ? 'Загрузка...' : 'Тест загрузки'}
          </Button>
          <Button variant="outlined" onClick={handleEmptyTest}>
            {showEmpty ? 'Показать данные' : 'Тест пустого состояния'}
          </Button>
          <Button variant="outlined" onClick={() => setTestData(generateTestData(50))}>
            Много данных (50 строк)
          </Button>
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Тестируемые возможности:
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>✅ <strong>Перенос слов:</strong> колонка "Длинный URL" и "Описание" с wrap: true</li>
          <li>✅ <strong>Многоточие:</strong> колонка "Email" с ellipsis: true</li>
          <li>✅ <strong>Фиксированная колонка:</strong> колонка "ID" с sticky: true</li>
          <li>✅ <strong>Скрытие на мобильных:</strong> "Email" и "URL" с hideOnMobile: true</li>
          <li>✅ <strong>Ограничение ширины:</strong> maxWidth для разных колонок</li>
          <li>✅ <strong>Форматирование:</strong> колонка "Статус" с цветными метками</li>
          <li>✅ <strong>Состояние загрузки:</strong> скелетон анимация</li>
          <li>✅ <strong>Пустое состояние:</strong> иконка и сообщение</li>
          <li>✅ <strong>Клик по строке:</strong> обработчик onRowClick</li>
          <li>✅ <strong>Адаптивность:</strong> скрытие колонок на мобильных</li>
        </Typography>
      </Box>

      <Table
        columns={columns}
        rows={testData}
        loading={loading}
        responsive={responsive}
        onRowClick={handleRowClick}
        stickyHeader
        maxHeight={600}
      />

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Инструкции по тестированию:</strong><br />
          1. Измените размер окна браузера для проверки адаптивности<br />
          2. Прокрутите таблицу горизонтально для проверки фиксированной колонки ID<br />
          3. Кликните на любую строку для проверки обработчика событий<br />
          4. Используйте кнопки выше для тестирования состояний загрузки и пустых данных
        </Typography>
      </Box>
    </Box>
  );
};

export default TableUnificationTest; 