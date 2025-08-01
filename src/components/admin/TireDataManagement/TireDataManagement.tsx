import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpen as FolderIcon,
  Description as FileIcon,
  Timeline as StatsIcon,
  History as HistoryIcon,
  HelpOutline as HelpIcon,
  Edit as EditIcon,
  DeleteSweep as ClearAllIcon
} from '@mui/icons-material';

// TabPanel компонент
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tire-data-tabpanel-${index}`}
      aria-labelledby={`tire-data-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Типы данных
interface TireDataStats {
  configurations_count: number;
  active_configurations: number;
  current_version: string;
  last_update: string;
  available_versions: Array<{
    version: string;
    imported_at: string;
  }>;
}

interface FileValidation {
  valid: boolean;
  exists: boolean;
  readable: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    rows_count: number;
    columns_count: number;
    file_size: number;
    encoding: string;
    [key: string]: any;
  };
}

interface ValidationResult {
  valid: boolean;
  files: Record<string, FileValidation>;
  errors: string[];
  warnings: string[];
  statistics: Record<string, any>;
}

interface ImportResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    version: string;
    statistics: Record<string, number>;
  };
}

const TireDataManagement: React.FC = () => {
  // Получаем токен аутентификации из Redux
  const authToken = useSelector((state: any) => state.auth?.accessToken);

  // Состояние компонента
  const [activeStep, setActiveStep] = useState(0);
  const [csvPath, setCsvPath] = useState('/home/snisar/mobi_tz/md/auto/auto');
  const [version, setVersion] = useState('');
  const [stats, setStats] = useState<TireDataStats | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Состояния загрузки
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Опции импорта
  const [importOptions, setImportOptions] = useState({
    skip_invalid_rows: false,
    fix_suspicious_sizes: false,
    encoding_fallback: 'utf-8'
  });
  
  // Вкладки
  const [currentTab, setCurrentTab] = useState(0);
  
  // Диалоги
  const [helpDialog, setHelpDialog] = useState(false);
  const [statsDialog, setStatsDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Шаги процесса
  const steps = [
    {
      label: 'Настройка параметров',
      description: 'Укажите путь к CSV файлам и версию данных'
    },
    {
      label: 'Валидация файлов',
      description: 'Проверка структуры и корректности данных'
    },
    {
      label: 'Импорт данных',
      description: 'Загрузка данных в базу'
    },
    {
      label: 'Завершение',
      description: 'Результаты импорта и управление версиями'
    }
  ];

  // Обязательные файлы
  const requiredFiles = [
    {
      name: 'test_table_car2_brand.csv',
      description: 'Справочник брендов автомобилей',
      columns: ['id', 'name']
    },
    {
      name: 'test_table_car2_model.csv',
      description: 'Справочник моделей автомобилей',
      columns: ['id', 'brand', 'name']
    },
    {
      name: 'test_table_car2_kit.csv',
      description: 'Комплектации автомобилей',
      columns: ['id', 'model', 'year_from', 'year_to']
    },
    {
      name: 'test_table_car2_kit_tyre_size.csv',
      description: 'Размеры шин для комплектаций',
      columns: ['kit', 'width', 'height', 'diameter']
    }
  ];

  // Функция для получения заголовков с авторизацией
  const getAuthHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      (headers as any)['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  };

  // Загрузка статистики при монтировании
  useEffect(() => {
    loadStats();
  }, []);

  // API функции
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/tire_data/status', {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateFiles = async () => {
    setValidating(true);
    setValidationResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/tire_data/validate_files', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ csv_path: csvPath })
      });
      
      const data = await response.json();
      setValidationResult(data.data);
      
      if (data.status === 'success') {
        setActiveStep(2); // Переход к импорту
      }
    } catch (error) {
      console.error('Ошибка валидации:', error);
    } finally {
      setValidating(false);
    }
  };

  const importData = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/tire_data/import', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          csv_path: csvPath,
          version: version || undefined,
          ...importOptions
        })
      });
      
      const data = await response.json();
      setImportResult(data);
      
      if (data.status === 'success') {
        setActiveStep(3); // Переход к завершению
        await loadStats(); // Обновляем статистику
      }
    } catch (error) {
      console.error('Ошибка импорта:', error);
    } finally {
      setImporting(false);
    }
  };

  const deleteVersion = async (versionToDelete: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/admin/tire_data/version/${versionToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        await loadStats();
      }
    } catch (error) {
      console.error('Ошибка удаления версии:', error);
    }
  };

  const rollbackToVersion = async (targetVersion: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/admin/tire_data/rollback/${targetVersion}`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        await loadStats();
      }
    } catch (error) {
      console.error('Ошибка отката версии:', error);
    }
  };

  // Функции форматирования
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(1)} КБ`;
  };

  const getStatusIcon = (valid: boolean, hasWarnings: boolean) => {
    if (valid && !hasWarnings) return <CheckIcon color="success" />;
    if (valid && hasWarnings) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Управление данными шин
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => setHelpDialog(true)}
          >
            Справка
          </Button>
          <Button
            variant="outlined"
            startIcon={<StatsIcon />}
            onClick={() => setStatsDialog(true)}
          >
            Статистика
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStats}
            disabled={loading}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Загрузка данных" 
            icon={<UploadIcon />} 
            iconPosition="start"
            id="tire-data-tab-0"
            aria-controls="tire-data-tabpanel-0"
          />
          <Tab 
            label="Редактирование" 
            icon={<EditIcon />} 
            iconPosition="start"
            id="tire-data-tab-1"
            aria-controls="tire-data-tabpanel-1"
          />
        </Tabs>
      </Paper>

      {/* TabPanel для загрузки данных */}
      <TabPanel value={currentTab} index={0}>
        {/* Текущая статистика */}
      {stats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Текущее состояние:</strong> {stats.configurations_count} конфигураций,
            версия {stats.current_version}, последнее обновление: {stats.last_update}
          </Typography>
        </Alert>
      )}

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {index === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Путь к CSV файлам"
                      value={csvPath}
                      onChange={(e) => setCsvPath(e.target.value)}
                      placeholder="/home/user/csv-files"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: <FolderIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Версия данных (опционально)"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="2025.2"
                      sx={{ mb: 3 }}
                      helperText="Если не указана, будет создана автоматически"
                    />
                    
                    {/* Список обязательных файлов */}
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Обязательные файлы:
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {requiredFiles.map((file) => (
                        <Grid item xs={12} md={6} key={file.name}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent sx={{ pb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" fontWeight="bold">
                                  {file.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                {file.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {file.columns.map((col) => (
                                  <Chip key={col} label={col} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(1)}
                        disabled={!csvPath.trim()}
                      >
                        Далее
                      </Button>
                    </Box>
                  </Box>
                )}

                {index === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                      >
                        Назад
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={validating ? <CircularProgress size={20} /> : <CheckIcon />}
                        onClick={validateFiles}
                        disabled={validating}
                      >
                        {validating ? 'Проверка файлов...' : 'Проверить файлы'}
                      </Button>
                    </Box>

                    {validationResult && (
                      <Box>
                        <Alert 
                          severity={validationResult.valid ? 'success' : 'error'} 
                          sx={{ mb: 2 }}
                        >
                          {validationResult.valid 
                            ? 'Все файлы прошли проверку!' 
                            : 'Обнаружены ошибки в файлах'
                          }
                        </Alert>

                        {/* Результаты по файлам */}
                        <Grid container spacing={2}>
                          {Object.entries(validationResult.files).map(([filename, fileResult]) => (
                            <Grid item xs={12} md={6} key={filename}>
                              <Card>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {getStatusIcon(fileResult.valid, fileResult.warnings.length > 0)}
                                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                      {filename}
                                    </Typography>
                                  </Box>
                                  
                                  {fileResult.exists && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Строк: {fileResult.statistics.rows_count} | 
                                        Колонок: {fileResult.statistics.columns_count} | 
                                        Размер: {formatFileSize(fileResult.statistics.file_size)}
                                      </Typography>
                                    </Box>
                                  )}

                                  {fileResult.errors.length > 0 && (
                                    <Alert severity="error" sx={{ mb: 1 }}>
                                      <Typography variant="caption">
                                        {fileResult.errors.join('; ')}
                                      </Typography>
                                    </Alert>
                                  )}

                                  {fileResult.warnings.length > 0 && (
                                    <Alert severity="warning">
                                      <Typography variant="caption">
                                        {fileResult.warnings.join('; ')}
                                      </Typography>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Опции исправления ошибок */}
                        {!validationResult.valid && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Опции исправления ошибок
                            </Typography>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Обработка поврежденных строк
                                    </Typography>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={importOptions.skip_invalid_rows}
                                          onChange={(e) => setImportOptions(prev => ({
                                            ...prev,
                                            skip_invalid_rows: e.target.checked
                                          }))}
                                        />
                                      }
                                      label="Пропускать поврежденные строки"
                                    />
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Строки с ошибками формата CSV будут пропущены
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Обработка размеров шин
                                    </Typography>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={importOptions.fix_suspicious_sizes}
                                          onChange={(e) => setImportOptions(prev => ({
                                            ...prev,
                                            fix_suspicious_sizes: e.target.checked
                                          }))}
                                        />
                                      }
                                      label="Исправлять размеры шин"
                                    />
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                      Автоматическое исправление проблем в размерах:
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                                      • 165/0R13 → 165/80R13 (нулевая высота → 80%)<br/>
                                      • 28/9R15 → сохраняется (американские дюймовые)<br/>
                                      • Экстремальные значения нормализуются
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                onClick={() => setActiveStep(0)}
                              >
                                Назад к настройкам
                              </Button>
                              <Button
                                variant="contained"
                                color="warning"
                                onClick={() => setActiveStep(2)}
                                disabled={!importOptions.skip_invalid_rows && !importOptions.fix_suspicious_sizes}
                              >
                                Импорт с исправлениями
                              </Button>
                            </Box>
                          </Box>
                        )}

                        {validationResult.valid && (
                          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              onClick={() => setActiveStep(0)}
                            >
                              Назад к настройкам
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => setActiveStep(2)}
                            >
                              Продолжить импорт
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                {index === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>Внимание!</strong> Импорт данных может занять несколько минут.
                        Во время импорта не закрывайте страницу.
                      </Typography>
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(1)}
                        disabled={importing}
                      >
                        Назад
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={importing ? <CircularProgress size={20} /> : <UploadIcon />}
                        onClick={importData}
                        disabled={importing}
                        size="large"
                      >
                        {importing ? 'Импорт данных...' : 'Начать импорт'}
                      </Button>
                    </Box>

                    {importing && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Пожалуйста, подождите...
                        </Typography>
                      </Box>
                    )}

                    {importResult && (
                      <Alert 
                        severity={importResult.status === 'success' ? 'success' : 'error'}
                        sx={{ mt: 3 }}
                      >
                        <Typography variant="body2">
                          {importResult.message}
                        </Typography>
                        {importResult.data && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              Версия: {importResult.data.version}
                            </Typography>
                          </Box>
                        )}
                      </Alert>
                    )}
                  </Box>
                )}

                {index === 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        Импорт данных завершен успешно!
                      </Typography>
                    </Alert>

                    {/* Управление версиями */}
                    {stats && stats.available_versions.length > 0 && (
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                          Доступные версии данных:
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Версия</TableCell>
                                <TableCell>Дата импорта</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Действия</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {stats.available_versions.map((ver) => (
                                <TableRow key={ver.version}>
                                  <TableCell>{ver.version}</TableCell>
                                  <TableCell>{ver.imported_at}</TableCell>
                                  <TableCell>
                                    {ver.version === stats.current_version && (
                                      <Chip label="Активная" color="primary" size="small" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {ver.version !== stats.current_version && (
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Откатиться к этой версии">
                                          <IconButton
                                            size="small"
                                            onClick={() => setConfirmDialog({
                                              open: true,
                                              title: 'Откат версии',
                                              message: `Вы уверены, что хотите откатиться к версии ${ver.version}?`,
                                              onConfirm: () => rollbackToVersion(ver.version)
                                            })}
                                          >
                                            <RestoreIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Удалить версию">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => setConfirmDialog({
                                              open: true,
                                              title: 'Удаление версии',
                                              message: `Вы уверены, что хотите удалить версию ${ver.version}? Это действие нельзя отменить.`,
                                              onConfirm: () => deleteVersion(ver.version)
                                            })}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    )}

                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setActiveStep(0);
                          setValidationResult(null);
                          setImportResult(null);
                        }}
                      >
                        Новый импорт
                      </Button>
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Диалог справки */}
      <Dialog open={helpDialog} onClose={() => setHelpDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Справка по импорту данных шин</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Инструкции по подготовке данных:</Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>1. Подготовка CSV файлов</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Кодировка файлов должна быть UTF-8"
                    secondary="Для конвертации используйте текстовые редакторы с поддержкой кодировок"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Первая строка должна содержать заголовки колонок"
                    secondary="Названия колонок должны точно соответствовать требуемым"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Все файлы должны находиться в одной папке"
                    secondary="Укажите полный путь к папке с CSV файлами"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>2. Проверка перед импортом</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Создайте резервную копию текущих данных"
                    secondary="Импорт заменит существующие данные"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Убедитесь в корректности данных"
                    secondary="Проверьте связи между таблицами (ID брендов, моделей и т.д.)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Проверьте размеры файлов"
                    secondary="Большие файлы могут потребовать больше времени на обработку"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>3. Ручной ввод данных</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Для оперативного добавления небольшого количества данных:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Используйте существующие админские страницы"
                    secondary="Бренды авто: /admin/car-brands, Модели: /admin/car-models"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Создайте минимальный CSV файл"
                    secondary="Добавьте только необходимые записи в правильном формате"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Используйте версионирование"
                    secondary="Создавайте новые версии для отслеживания изменений"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог статистики */}
      <Dialog open={statsDialog} onClose={() => setStatsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Статистика данных</DialogTitle>
        <DialogContent>
          {stats ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.configurations_count}
                  </Typography>
                  <Typography variant="body2">
                    Всего конфигураций
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.active_configurations}
                  </Typography>
                  <Typography variant="body2">
                    Активных конфигураций
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  <strong>Текущая версия:</strong> {stats.current_version}
                </Typography>
                <Typography variant="body2">
                  <strong>Последнее обновление:</strong> {stats.last_update}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Отмена
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            color="primary"
            variant="contained"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
      </TabPanel>

      {/* TabPanel для редактирования */}
      <TabPanel value={currentTab} index={1}>
        <TireDataEditingPanel 
          stats={stats}
          onRefresh={loadStats}
          getAuthHeaders={getAuthHeaders}
        />
      </TabPanel>
    </Box>
  );
};

// Компонент для вкладки редактирования
interface TireDataEditingPanelProps {
  stats: TireDataStats | null;
  onRefresh: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const TireDataEditingPanel: React.FC<TireDataEditingPanelProps> = ({ stats, onRefresh, getAuthHeaders }) => {
  const [loading, setLoading] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Загружаем список версий
  const loadVersions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/tire_data/status', {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.status === 'success') {
        setVersions(data.data.available_versions || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки версий:', error);
    }
  };

  // Полная очистка данных
  const handleClearAllData = async () => {
    setClearingData(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/tire_data/import', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          csv_path: '/dev/null', // Заглушка
          force_reload: true,
          clear_only: true // Новый параметр для только очистки
        })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        onRefresh();
        alert('Данные успешно очищены');
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (error) {
      console.error('Ошибка очистки:', error);
      alert('Произошла ошибка при очистке данных');
    } finally {
      setClearingData(false);
    }
  };

  // Удаление версии
  const handleDeleteVersion = async (version: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/admin/tire_data/version/${version}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        await loadVersions();
        onRefresh();
        alert(`Версия ${version} удалена`);
      }
    } catch (error) {
      console.error('Ошибка удаления версии:', error);
    }
  };

  // Откат к версии
  const handleRollbackToVersion = async (version: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/admin/tire_data/rollback/${version}`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        await loadVersions();
        onRefresh();
        alert(`Выполнен откат к версии ${version}`);
      }
    } catch (error) {
      console.error('Ошибка отката:', error);
    }
  };

  React.useEffect(() => {
    loadVersions();
  }, []);

  return (
    <Box>
      {/* Текущее состояние */}
      {stats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Текущее состояние:</strong> {stats.configurations_count} конфигураций,
            версия {stats.current_version}, последнее обновление: {stats.last_update}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Полная очистка данных */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                <ClearAllIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Полная очистка данных
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ⚠️ Удаляет все данные шин, сохраняя бренды и модели, используемые в бронированиях.
                Операция необратима!
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Внимание:</strong> Эта операция запрещена в продакшене и удалит:
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                  <li>Все конфигурации шин</li>
                  <li>Неиспользуемые бренды и модели</li>
                  <li>Все версии данных</li>
                </Box>
              </Alert>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="error"
                startIcon={<ClearAllIcon />}
                onClick={() => setConfirmDialog({
                  open: true,
                  title: 'Подтверждение полной очистки',
                  message: 'Вы действительно хотите удалить все данные шин? Эта операция необратима!',
                  onConfirm: handleClearAllData
                })}
                disabled={clearingData}
              >
                {clearingData ? 'Очистка...' : 'Очистить все данные'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Управление версиями */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Управление версиями
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Просмотр, удаление и откат к предыдущим версиям данных.
              </Typography>
              
              {versions.length > 0 ? (
                <Box>
                  {versions.map((version, index) => (
                    <Paper key={version.version} sx={{ p: 2, mb: 1, bgcolor: index === 0 ? 'action.hover' : 'background.paper' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2">
                            {version.version}
                            {index === 0 && <Chip label="Текущая" size="small" color="primary" sx={{ ml: 1 }} />}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {version.imported_at}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {index !== 0 && (
                            <>
                              <Tooltip title="Откатиться к этой версии">
                                <IconButton
                                  size="small"
                                  onClick={() => setConfirmDialog({
                                    open: true,
                                    title: 'Подтверждение отката',
                                    message: `Откатиться к версии ${version.version}?`,
                                    onConfirm: () => handleRollbackToVersion(version.version)
                                  })}
                                >
                                  <RestoreIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Удалить версию">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setConfirmDialog({
                                    open: true,
                                    title: 'Подтверждение удаления',
                                    message: `Удалить версию ${version.version}?`,
                                    onConfirm: () => handleDeleteVersion(version.version)
                                  })}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет доступных версий
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadVersions}
                disabled={loading}
              >
                Обновить список
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог подтверждения */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Отмена
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            color="primary"
            variant="contained"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TireDataManagement;