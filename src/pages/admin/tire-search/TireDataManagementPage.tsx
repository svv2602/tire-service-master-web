import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as CloudUploadIcon,
  Undo as UndoIcon,
  CleaningServices as CleaningServicesIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Типы данных
interface TireDataVersion {
  id: string;
  version: string;
  source_description: string;
  imported_at: string;
  is_active: boolean;
  configurations_count: number;
  brands_count: number;
  models_count: number;
  file_checksums: Record<string, string>;
}

interface TireDataStatistics {
  current_version: string;
  last_updated: string;
  totals: {
    configurations: number;
    brands: number;
    models: number;
    versions: number;
  };
  distributions: {
    years: Record<string, number>;
    diameters: Record<string, number>;
    top_brands: Record<string, number>;
  };
  data_quality: {
    active_configurations: number;
    deprecated_configurations: number;
    configurations_with_aliases: number;
  };
}

const TireDataManagementPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  
  // Состояние компонента
  const [versions, setVersions] = useState<TireDataVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<TireDataVersion | null>(null);
  const [statistics, setStatistics] = useState<TireDataStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Состояние диалогов
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [sourceDescription, setSourceDescription] = useState('');
  const [csvDirectory, setCsvDirectory] = useState('');
  const [keepVersions, setKeepVersions] = useState(5);

  // API базовый URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  // Утилита для API запросов
  const makeApiRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Загрузка данных
  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await makeApiRequest('/admin/tire_data/versions');
      setVersions(data.versions || []);
    } catch (error) {
      setError(`Ошибка загрузки версий: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentVersion = async () => {
    try {
      const data = await makeApiRequest('/admin/tire_data/current_version');
      setCurrentVersion(data.version);
    } catch (error) {
      console.error('Ошибка загрузки текущей версии:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await makeApiRequest('/admin/tire_data/statistics');
      setStatistics(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  // Действия с данными
  const handleUpdateData = async () => {
    if (!sourceDescription.trim()) {
      setError('Введите описание источника данных');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const body: any = { source_description: sourceDescription };
      if (csvDirectory.trim()) {
        body.csv_directory = csvDirectory;
      }

      const result = await makeApiRequest('/admin/tire_data/update', 'POST', body);
      
      setSuccess(`Данные успешно обновлены. Новая версия: ${result.version}`);
      setUpdateDialogOpen(false);
      setSourceDescription('');
      setCsvDirectory('');
      
      // Обновляем данные
      await Promise.all([loadVersions(), loadCurrentVersion(), loadStatistics()]);
      
    } catch (error) {
      setError(`Ошибка обновления данных: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!selectedVersion) {
      setError('Выберите версию для отката');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await makeApiRequest(`/admin/tire_data/rollback?version=${encodeURIComponent(selectedVersion)}`, 'DELETE');
      
      setSuccess(`Успешно выполнен откат к версии ${result.version}`);
      setRollbackDialogOpen(false);
      setSelectedVersion('');
      
      // Обновляем данные
      await Promise.all([loadVersions(), loadCurrentVersion(), loadStatistics()]);
      
    } catch (error) {
      setError(`Ошибка отката версии: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await makeApiRequest('/admin/tire_data/cleanup', 'POST', { keep_versions: keepVersions });
      
      setSuccess(`Очистка завершена. Удалено версий: ${result.deleted_versions}`);
      setCleanupDialogOpen(false);
      
      // Обновляем данные
      await loadVersions();
      
    } catch (error) {
      setError(`Ошибка очистки версий: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    Promise.all([loadVersions(), loadCurrentVersion(), loadStatistics()]);
  }, []);

  // Закрытие уведомлений
  const handleCloseError = () => setError(null);
  const handleCloseSuccess = () => setSuccess(null);

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок страницы */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🔍 Управление данными поиска шин
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Административная панель для управления версиями данных, обновления и мониторинга системы поиска шин
        </Typography>
      </Box>

      {/* Уведомления */}
      {error && (
        <Alert severity="error" onClose={handleCloseError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={handleCloseSuccess} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Индикатор загрузки */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Левая колонка - Основная информация */}
        <Grid item xs={12} md={8}>
          {/* Текущая версия */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Текущая активная версия</Typography>
              </Box>
              
              {currentVersion ? (
                <Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {currentVersion.version}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {currentVersion.source_description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Импортировано: {new Date(currentVersion.imported_at).toLocaleString('ru')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip 
                      label={`${currentVersion.configurations_count} конфигураций`} 
                      color="primary" 
                      size="small" 
                    />
                    <Chip 
                      label={`${currentVersion.brands_count} брендов`} 
                      color="secondary" 
                      size="small" 
                    />
                    <Chip 
                      label={`${currentVersion.models_count} моделей`} 
                      color="info" 
                      size="small" 
                    />
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Активная версия не найдена
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Статистика */}
          {statistics && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Статистика системы</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {statistics.totals.configurations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Конфигураций
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {statistics.totals.brands}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Брендов
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {statistics.totals.models}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Моделей
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {statistics.totals.versions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Версий
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Топ-5 брендов */}
                <Typography variant="subtitle1" gutterBottom>
                  Топ-5 брендов по количеству конфигураций:
                </Typography>
                <List dense>
                  {Object.entries(statistics.distributions.top_brands)
                    .slice(0, 5)
                    .map(([brand, count]) => (
                      <ListItem key={brand} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: 'primary.main' 
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${brand}: ${count} конфигураций`}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Список версий */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">История версий</Typography>
                </Box>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={loadVersions}
                  disabled={loading}
                >
                  Обновить
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Версия</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Дата импорта</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell align="right">Конфигураций</TableCell>
                      <TableCell align="center">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {version.version}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {version.source_description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(version.imported_at).toLocaleDateString('ru')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={version.is_active ? 'Активная' : 'Неактивная'}
                            color={version.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {version.configurations_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {!version.is_active && (
                            <Tooltip title="Откатить к этой версии">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedVersion(version.version);
                                  setRollbackDialogOpen(true);
                                }}
                              >
                                <UndoIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Правая колонка - Действия */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Управление данными
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Обновление данных */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UpdateIcon />}
                  onClick={() => setUpdateDialogOpen(true)}
                  disabled={loading}
                  fullWidth
                >
                  Обновить данные
                </Button>

                {/* Откат версии */}
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<UndoIcon />}
                  onClick={() => setRollbackDialogOpen(true)}
                  disabled={loading || versions.length <= 1}
                  fullWidth
                >
                  Откатить версию
                </Button>

                {/* Очистка старых версий */}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CleaningServicesIcon />}
                  onClick={() => setCleanupDialogOpen(true)}
                  disabled={loading || versions.length <= 2}
                  fullWidth
                >
                  Очистить старые версии
                </Button>

                <Divider />

                {/* Обновление статистики */}
                <Button
                  variant="text"
                  startIcon={<RefreshIcon />}
                  onClick={loadStatistics}
                  disabled={loading}
                  fullWidth
                >
                  Обновить статистику
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог обновления данных */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUploadIcon sx={{ mr: 1 }} />
            Обновление данных поиска шин
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Внимание!</strong> Эта операция может занять длительное время и изменить данные в системе.
          </Alert>
          
          <TextField
            label="Описание источника данных"
            value={sourceDescription}
            onChange={(e) => setSourceDescription(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="Обновление данных из CSV файлов"
          />
          
          <TextField
            label="Путь к CSV файлам (опционально)"
            value={csvDirectory}
            onChange={(e) => setCsvDirectory(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="/path/to/csv/files"
            helperText="Оставьте пустым для использования стандартного пути"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleUpdateData}
            variant="contained"
            disabled={loading || !sourceDescription.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <UpdateIcon />}
          >
            {loading ? 'Обновление...' : 'Обновить данные'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отката версии */}
      <Dialog
        open={rollbackDialogOpen}
        onClose={() => setRollbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UndoIcon sx={{ mr: 1 }} />
            Откат к предыдущей версии
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Осторожно!</strong> Эта операция изменит активную версию данных. 
            Текущая версия станет неактивной.
          </Alert>
          
          <Typography variant="body2" gutterBottom>
            Откат к версии: <strong>{selectedVersion}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleRollback}
            variant="contained"
            color="warning"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <UndoIcon />}
          >
            {loading ? 'Откат...' : 'Откатить версию'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог очистки версий */}
      <Dialog
        open={cleanupDialogOpen}
        onClose={() => setCleanupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CleaningServicesIcon sx={{ mr: 1 }} />
            Очистка старых версий
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Внимание!</strong> Эта операция безвозвратно удалит старые версии данных.
          </Alert>
          
          <TextField
            label="Количество версий для сохранения"
            type="number"
            value={keepVersions}
            onChange={(e) => setKeepVersions(parseInt(e.target.value) || 5)}
            inputProps={{ min: 2, max: 20 }}
            fullWidth
            margin="normal"
            helperText="Минимум 2 версии должно остаться в системе"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Будет удалено версий: {Math.max(0, versions.length - keepVersions)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleCleanup}
            variant="contained"
            color="error"
            disabled={loading || versions.length <= keepVersions}
            startIcon={loading ? <CircularProgress size={20} /> : <CleaningServicesIcon />}
          >
            {loading ? 'Очистка...' : 'Очистить версии'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TireDataManagementPage;