import React, { useState } from 'react';
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
  ExpandMore as ExpandMoreIcon,
  Description as FileIcon,
  Timeline as StatsIcon,
  History as HistoryIcon,
  HelpOutline as HelpIcon,
  Edit as EditIcon,
  DeleteSweep as ClearAllIcon,
  DeleteSweep as DeleteSweepIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Импорт новых API хуков
import {
  useGetTireDataStatsQuery,
  useUploadTireDataFilesMutation,
  useValidateTireDataFilesMutation,
  useImportTireDataMutation,
  useDeleteTireDataVersionMutation,
  useRollbackTireDataVersionMutation,
  useCleanupOldVersionsMutation,
  useCleanupHiddenVersionsMutation,
  type TireDataStats,
  type ValidationResult,
  type ImportResult,
  type UploadResult
} from '../../../api/tireData.api';

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

// Локальные типы (остальные импортированы из API)
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TireDataManagement: React.FC = () => {
  // RTK Query хуки
  const { data: statsData, error: statsError, isLoading: statsLoading, refetch: refetchStats } = useGetTireDataStatsQuery();
  const [uploadFiles, { isLoading: uploading }] = useUploadTireDataFilesMutation();
  const [validateFiles, { isLoading: validating }] = useValidateTireDataFilesMutation();
  const [importData, { isLoading: importing }] = useImportTireDataMutation();
  const [deleteVersionMutation] = useDeleteTireDataVersionMutation();
  const [rollbackVersionMutation] = useRollbackTireDataVersionMutation();
  const [cleanupOldVersions] = useCleanupOldVersionsMutation();
  const [cleanupHiddenVersions] = useCleanupHiddenVersionsMutation();

  // Состояние компонента
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [version, setVersion] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Состояния для обработки ошибок
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Опции импорта
  const [importOptions, setImportOptions] = useState({
    skip_invalid_rows: false,
    fix_suspicious_sizes: true, // Включаем по умолчанию - исправляет критические ошибки типа height=0
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
      label: 'Выбор файлов',
      description: 'Загрузите необходимые CSV файлы и укажите версию данных'
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

  // Функция для обработки ошибок API
  const handleApiError = (error: any, operation: string) => {
    console.error(`Ошибка ${operation}:`, error);
    
    let errorText = `Ошибка при выполнении операции "${operation}"`;
    
    if (error?.data?.message) {
      errorText = error.data.message;
    } else if (error?.data?.error) {
      errorText = error.data.error;
    } else if (error?.message) {
      errorText = error.message;
    } else if (error?.status) {
      switch (error.status) {
        case 400:
          errorText = 'Некорректные данные запроса';
          break;
        case 401:
          errorText = 'Необходима авторизация';
          break;
        case 403:
          errorText = 'Недостаточно прав для выполнения операции';
          break;
        case 404:
          errorText = 'Ресурс не найден';
          break;
        case 422:
          errorText = 'Ошибка валидации данных';
          break;
        case 500:
          errorText = 'Внутренняя ошибка сервера. Попробуйте позже или обратитесь к администратору';
          break;
        default:
          errorText = `Ошибка сервера (${error.status})`;
      }
    }
    
    setErrorMessage(errorText);
    setSuccessMessage(null);
  };

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Функции управления версиями для главного компонента
  const handleVersionRollback = async (version: string) => {
    try {
      await rollbackVersionMutation(version).unwrap();
      alert(`✅ Успешно выполнен откат к версии ${version}`);
      refetchStats();
    } catch (error: any) {
      console.error('Ошибка отката:', error);
      alert(`❌ Ошибка отката к версии ${version}: ${error?.data?.message || error.message}`);
    }
  };

  const handleVersionDelete = async (version: string) => {
    try {
      await deleteVersionMutation(version).unwrap();
      alert(`✅ Версия ${version} успешно удалена`);
      refetchStats();
    } catch (error: any) {
      console.error('Ошибка удаления версии:', error);
      alert(`❌ Ошибка удаления версии ${version}: ${error?.data?.message || error.message}`);
    }
  };

  const goToStep = (step: number) => {
    clearMessages();
    setActiveStep(step);
  };



  // Новые функции с RTK Query
  const handleFileUpload = async () => {
    if (Object.keys(selectedFiles).length === 0) {
      setErrorMessage('Необходимо выбрать файлы для загрузки');
      return;
    }

    try {
      clearMessages();
      const formData = new FormData();
      
      // Добавляем все выбранные файлы в FormData
      Object.entries(selectedFiles).forEach(([key, file]) => {
        formData.append('files[' + key + ']', file);
      });

      const result = await uploadFiles(formData).unwrap();
      setUploadResult(result.data);
      setSuccessMessage(`Файлы успешно загружены: ${Object.keys(result.data.uploaded_files).length} файл(ов)`);
      setActiveStep(1); // Переход к валидации
    } catch (error) {
      handleApiError(error, 'загрузки файлов');
    }
  };

  const handleFileSelection = (fileType: string, file: File | null) => {
    setSelectedFiles(prev => {
      const newFiles = { ...prev };
      if (file) {
        newFiles[fileType] = file;
      } else {
        delete newFiles[fileType];
      }
      return newFiles;
    });
  };

  const handleValidateFiles = async () => {
    if (!uploadResult?.upload_path) {
      setErrorMessage('Файлы не загружены. Сначала загрузите файлы на сервер');
      return;
    }

    try {
      clearMessages();
      const result = await validateFiles({ csv_path: uploadResult.upload_path }).unwrap();
      setValidationResult(result.data);
      
      if (result.status === 'success' || result.status === 'warning') {
        if (result.data.valid) {
          setSuccessMessage('Все файлы успешно прошли валидацию');
          setActiveStep(2); // Переход к импорту
        } else {
          setSuccessMessage('Валидация завершена с предупреждениями. Проверьте опции исправления ошибок');
        }
      }
    } catch (error) {
      handleApiError(error, 'валидации файлов');
    }
  };

  const handleImportData = async () => {
    if (!uploadResult?.upload_path) {
      setErrorMessage('Файлы не загружены. Сначала загрузите и валидируйте файлы');
      return;
    }

    try {
      clearMessages();
      const result = await importData({
        csv_path: uploadResult.upload_path,
        version: version || undefined,
        options: importOptions
      }).unwrap();
      
      setImportResult(result);
      
      if (result.status === 'success' || result.status === 'warning') {
        const hasErrors = result.data?.has_validation_errors;
        const errorCount = result.data?.validation_errors?.length || 0;
        
        if (hasErrors) {
          setSuccessMessage(
            `Импорт завершен с предупреждениями! Версия: ${result.data?.version || 'не указана'}. ` +
            `Пропущено записей с ошибками: ${errorCount}. Проверьте отчет об ошибках ниже.`
          );
        } else {
          setSuccessMessage(`Данные успешно импортированы! Версия: ${result.data?.version || 'не указана'}`);
        }
        
        setActiveStep(3); // Переход к завершению
        refetchStats(); // Обновляем статистику
      } else {
        setErrorMessage(result.message || 'Импорт завершился с ошибкой');
      }
    } catch (error) {
      handleApiError(error, 'импорта данных');
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
            onClick={refetchStats}
            disabled={statsLoading}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {/* Сообщения об ошибках и успехе */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearMessages}>
          <Typography variant="body2">
            {errorMessage}
          </Typography>
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={clearMessages}>
          <Typography variant="body2">
            {successMessage}
          </Typography>
        </Alert>
      )}

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
      {statsData?.data && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Текущее состояние:</strong> {statsData.data.configurations_count} конфигураций,
            версия {statsData.data.current_version}, последнее обновление: {statsData.data.last_update}
          </Typography>
        </Alert>
      )}

      {statsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Ошибка загрузки статистики. Проверьте подключение к серверу.
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
                      label="Версия данных (опционально)"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="2025.2"
                      sx={{ mb: 3 }}
                      helperText="Если не указана, будет создана автоматически"
                    />
                    
                    {/* Загрузка файлов */}
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Загрузите необходимые CSV файлы:
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
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                {file.columns.map((col) => (
                                  <Chip key={col} label={col} size="small" variant="outlined" />
                                ))}
                              </Box>
                              
                              {/* File input */}
                              <input
                                accept=".csv"
                                type="file"
                                id={`file-${file.name}`}
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const selectedFile = e.target.files?.[0];
                                  if (selectedFile && selectedFile.name === file.name) {
                                    handleFileSelection(file.name, selectedFile);
                                  } else if (selectedFile) {
                                    alert(`Пожалуйста, выберите файл с именем ${file.name}`);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <label htmlFor={`file-${file.name}`}>
                                <Button
                                  variant={selectedFiles[file.name] ? "contained" : "outlined"}
                                  component="span"
                                  size="small"
                                  startIcon={selectedFiles[file.name] ? <CheckIcon /> : <UploadIcon />}
                                  color={selectedFiles[file.name] ? "success" : "primary"}
                                  fullWidth
                                >
                                  {selectedFiles[file.name] ? 'Загружен' : 'Выбрать файл'}
                                </Button>
                              </label>
                              
                              {selectedFiles[file.name] && (
                                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                                  {selectedFiles[file.name].name} ({formatFileSize(selectedFiles[file.name].size)})
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleFileUpload}
                        disabled={Object.keys(selectedFiles).length === 0 || uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                      >
                        {uploading ? 'Загрузка файлов...' : 'Загрузить файлы'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {index === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => goToStep(0)}
                      >
                        Назад
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={validating ? <CircularProgress size={20} /> : <CheckIcon />}
                        onClick={handleValidateFiles}
                        disabled={validating || !uploadResult}
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
                                      Обработка размеров шин ⚙️
                                    </Typography>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={importOptions.fix_suspicious_sizes}
                                          onChange={(e) => setImportOptions(prev => ({
                                            ...prev,
                                            fix_suspicious_sizes: e.target.checked
                                          }))}
                                          color="success"
                                        />
                                      }
                                      label={
                                        <Box>
                                          <Typography variant="body2">
                                            Исправлять размеры шин 
                                            <Chip label="Рекомендуется" color="success" size="small" sx={{ ml: 1 }} />
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                    <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                                      <Typography variant="caption">
                                        <strong>Критические ошибки исправляются автоматически:</strong><br/>
                                        • height=0 → height=80 (всегда)<br/>
                                        • Отрицательные значения → разумные минимумы<br/><br/>
                                        <strong>Дополнительные исправления (при включенной опции):</strong><br/>
                                        • Американские дюймовые размеры нормализуются<br/>
                                        • Экстремальные значения приводятся к стандартным
                                      </Typography>
                                    </Alert>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                onClick={() => goToStep(0)}
                              >
                                Назад к настройкам
                              </Button>
                              <Button
                                variant="contained"
                                color="warning"
                                onClick={() => goToStep(2)}
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
                              onClick={() => goToStep(0)}
                            >
                              Назад к настройкам
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => goToStep(2)}
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
                        onClick={() => goToStep(1)}
                        disabled={importing}
                      >
                        Назад
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={importing ? <CircularProgress size={20} /> : <UploadIcon />}
                        onClick={handleImportData}
                        disabled={importing || !uploadResult}
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

                    {/* Отчет об ошибках валидации */}
                    {importResult?.data?.validation_errors && importResult.data.validation_errors.length > 0 && (
                      <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'warning.main' }}>
                          ⚠️ Отчет об ошибках валидации ({importResult.data.validation_errors.length} записей пропущено):
                        </Typography>
                        
                        <TableContainer sx={{ maxHeight: 400 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>№ записи</TableCell>
                                <TableCell>Бренд</TableCell>
                                <TableCell>Модель</TableCell>
                                <TableCell>Размер шин</TableCell>
                                <TableCell>Ошибка</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {importResult.data.validation_errors.map((error, index) => (
                                <TableRow key={index}>
                                  <TableCell>{error.record_index}</TableCell>
                                  <TableCell>{error.brand}</TableCell>
                                  <TableCell>{error.model}</TableCell>
                                  <TableCell>
                                    {error.tire_size ? (
                                      `${error.tire_size.width}/${error.tire_size.height}R${error.tire_size.diameter}`
                                    ) : (
                                      error.tire_size_index ? `#${error.tire_size_index}` : '—'
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="error">
                                      {error.error}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            💡 <strong>Рекомендации:</strong> Проверьте CSV файлы и исправьте указанные ошибки для полного импорта данных. 
                            Записи с ошибками были пропущены, остальные данные успешно импортированы.
                          </Typography>
                        </Alert>
                      </Paper>
                    )}

                    {/* Управление версиями */}
                    {statsData?.data && statsData.data.available_versions.length > 0 && (
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
                              {statsData.data.available_versions.map((ver: any) => (
                                <TableRow key={ver.version}>
                                  <TableCell>{ver.version}</TableCell>
                                  <TableCell>{ver.imported_at}</TableCell>
                                  <TableCell>
                                    {ver.version === statsData.data.current_version && (
                                      <Chip label="Активная" color="primary" size="small" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {ver.version !== statsData.data.current_version && (
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Откатиться к этой версии">
                                          <IconButton
                                            size="small"
                                            onClick={() => setConfirmDialog({
                                              open: true,
                                              title: 'Откат версии',
                                              message: `Вы уверены, что хотите откатиться к версии ${ver.version}?`,
                                              onConfirm: () => handleVersionRollback(ver.version)
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
                                              onConfirm: () => handleVersionDelete(ver.version)
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
                          goToStep(0);
                          setValidationResult(null);
                          setImportResult(null);
                          setUploadResult(null);
                          setSelectedFiles({});
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
          {statsData?.data ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {statsData.data.configurations_count}
                  </Typography>
                  <Typography variant="body2">
                    Всего конфигураций
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {statsData.data.active_configurations}
                  </Typography>
                  <Typography variant="body2">
                    Активных конфигураций
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  <strong>Текущая версия:</strong> {statsData.data.current_version}
                </Typography>
                <Typography variant="body2">
                  <strong>Последнее обновление:</strong> {statsData.data.last_update}
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
          statsData={statsData?.data || null}
          onRefresh={refetchStats}
          cleanupOldVersions={async () => {
            const result = await cleanupOldVersions().unwrap();
            return result;
          }}
          cleanupHiddenVersions={async () => {
            const result = await cleanupHiddenVersions().unwrap();
            return result;
          }}
        />
      </TabPanel>
    </Box>
  );
};

// Компонент для вкладки редактирования
interface TireDataEditingPanelProps {
  statsData: TireDataStats | null;
  onRefresh: () => void;
  cleanupOldVersions: () => Promise<{ message: string }>;
  cleanupHiddenVersions: () => Promise<{ message: string }>;
}

const TireDataEditingPanel: React.FC<TireDataEditingPanelProps> = ({ statsData, onRefresh, cleanupOldVersions, cleanupHiddenVersions }) => {
  // RTK Query хуки для панели редактирования
  const [deleteVersion] = useDeleteTireDataVersionMutation();
  const [rollbackVersion] = useRollbackTireDataVersionMutation();
  const [importData] = useImportTireDataMutation();

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

  // Функции управления версиями (определяем в начале для доступности)
  const handleVersionRollback = async (version: string) => {
    try {
      await rollbackVersion(version).unwrap();
      
      // Закрываем диалог подтверждения
      setConfirmDialog(prev => ({ ...prev, open: false }));
      
      // Обновляем данные
      onRefresh();
      
      alert(`✅ Успешно выполнен откат к версии ${version}`);
    } catch (error: any) {
      // Закрываем диалог подтверждения даже при ошибке
      setConfirmDialog(prev => ({ ...prev, open: false }));
      
      console.error('Ошибка отката:', error);
      alert(`❌ Ошибка отката к версии ${version}: ${error?.data?.message || error.message}`);
    }
  };

  const handleVersionDelete = async (version: string) => {
    try {
      await deleteVersion(version).unwrap();
      
      // Закрываем диалог подтверждения
      setConfirmDialog(prev => ({ ...prev, open: false }));
      
      // Обновляем данные
      onRefresh();
      
      alert(`✅ Версия ${version} успешно удалена`);
    } catch (error: any) {
      // Закрываем диалог подтверждения даже при ошибке
      setConfirmDialog(prev => ({ ...prev, open: false }));
      
      console.error('Ошибка удаления версии:', error);
      alert(`❌ Ошибка удаления версии ${version}: ${error?.data?.message || error.message}`);
    }
  };

  // Обновляем список версий из statsData
  React.useEffect(() => {
    if (statsData?.available_versions) {
      setVersions(statsData.available_versions);
    }
  }, [statsData]);



  // Полная очистка данных
  const handleClearAllData = async () => {
    setClearingData(true);
    try {
      await importData({
        csv_path: '/dev/null', // Заглушка
        options: {
          force_reload: true,
          clear_only: true  // Указываем что это только очистка, без импорта CSV
        }
      }).unwrap();
      
      onRefresh();
      alert('✅ Данные успешно очищены');
    } catch (error: any) {
      console.error('Ошибка очистки:', error);
      
      let errorMessage = 'Произошла ошибка при очистке данных';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.status === 403) {
        errorMessage = 'Полная очистка данных запрещена в продакшене';
      } else if (error?.status === 500) {
        errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setClearingData(false);
    }
  };





  return (
    <Box>
      {/* Текущее состояние */}
      {statsData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Текущее состояние:</strong> {statsData.configurations_count} конфигураций,
            версия {statsData.current_version}, последнее обновление: {statsData.last_update}
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

        {/* Очистка устаревших версий */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DeleteSweepIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Очистка устаревших версий
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Удаляет версии старше 30 дней, которые не активны и не содержат конфигураций.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="warning"
                startIcon={<DeleteSweepIcon />}
                onClick={async () => {
                  try {
                    const result = await cleanupOldVersions();
                    alert(`✅ ${result.message}`);
                    onRefresh();
                  } catch (error: any) {
                    alert(`❌ Ошибка: ${error?.data?.message || error.message}`);
                  }
                }}
              >
                Очистить устаревшие
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Очистка скрытых версий */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <VisibilityOffIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Очистка скрытых версий
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Удаляет версии, которые скрыты после отката (более новые чем активная версия).
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<VisibilityOffIcon />}
                onClick={async () => {
                  try {
                    const result = await cleanupHiddenVersions();
                    alert(`✅ ${result.message}`);
                    onRefresh();
                  } catch (error: any) {
                    alert(`❌ Ошибка: ${error?.data?.message || error.message}`);
                  }
                }}
              >
                Очистить скрытые
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Управление версиями */}
        <Grid item xs={12} md={12}>
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
                                    onConfirm: () => handleVersionRollback(version.version)
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
                                    onConfirm: () => handleVersionDelete(version.version)
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
                onClick={onRefresh}
                disabled={false}
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