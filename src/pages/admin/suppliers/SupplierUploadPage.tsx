import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  TextFields as TextFieldsIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import { useDropzone } from 'react-dropzone';
import { 
  useGetSupplierByIdQuery,
  useUploadSupplierPriceMutation,
  type UploadPriceResponse,
} from '../../../api/suppliers.api';
import { getTablePageStyles } from '../../../styles/tablePageStyles';
import { useTheme } from '@mui/material/styles';
import AdminPageWrapper from '../../../components/admin/AdminPageWrapper';
import NormalizationStats from '../../../components/admin/NormalizationStats';
import NormalizationProgress from '../../../components/admin/NormalizationProgress';

const SupplierUploadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Состояние страницы
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [xmlContent, setXmlContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadPriceResponse | null>(null);
  const [showXmlExample, setShowXmlExample] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const supplierId = parseInt(id || '0');

  // API хуки
  const { 
    data: supplierResponse, 
    isLoading: isLoadingSupplier,
    error: supplierError
  } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId,
  });

  const [uploadPrice, { isLoading: isUploading }] = useUploadSupplierPriceMutation();

  const supplier = supplierResponse?.supplier;

  // Обработчик для выбора файлов
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  // Обработчики событий
  const handleUpload = async () => {
    if (!supplier) return;

    setUploadResult(null);
    setUploadError(null);

    try {
      const result = await uploadPrice({
        supplier_id: supplier.id,
        file: uploadMethod === 'file' ? uploadedFile || undefined : undefined,
        xml_content: uploadMethod === 'text' ? xmlContent : undefined,
      }).unwrap();

      setUploadResult(result);
      
      if (result.success) {
        // Очистить форму после успешной загрузки
        setUploadedFile(null);
        setXmlContent('');
      }
    } catch (error: any) {
      console.error('Ошибка загрузки прайса:', error);
      
      // Обработка ошибки слишком большого файла
      if (error?.status === 413 || error?.data?.file_size_mb) {
        const fileSize = error?.data?.file_size_mb || 'неизвестен';
        const maxSize = error?.data?.max_size_mb || 25;
        const suggestion = error?.data?.suggestion || '';
        
        setUploadError(
          `Файл слишком большой (${fileSize}MB). Максимальный размер: ${maxSize}MB. ${suggestion}`
        );
      } else {
        setUploadError(error?.data?.error || 'Произошла ошибка при загрузке прайса');
      }
    }
  };

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadMethod(event.target.value as 'file' | 'text');
    setUploadResult(null);
    setUploadError(null);
    setUploadedFile(null);
    setXmlContent('');
  };

  const canUpload = () => {
    if (uploadMethod === 'file') {
      return uploadedFile !== null;
    } else {
      return xmlContent.trim().length > 0;
    }
  };

  if (isLoadingSupplier) {
    return (
      <AdminPageWrapper>
        <Box sx={tablePageStyles.pageContainer}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Загрузка информации о поставщике...</Typography>
        </Box>
      </AdminPageWrapper>
    );
  }

  if (supplierError || !supplier) {
    return (
      <AdminPageWrapper>
        <Box sx={tablePageStyles.pageContainer}>
          <Alert severity="error">
            Поставщик не найден или произошла ошибка при загрузке
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/suppliers')}
            sx={{ mt: 2 }}
          >
            Назад к списку
          </Button>
        </Box>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <Box sx={tablePageStyles.pageContainer}>
        {/* Заголовок страницы */}
        <Box sx={tablePageStyles.headerContainer}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/admin/suppliers/${supplier.id}`)}
              sx={{ mb: 1 }}
            >
              Назад к поставщику
            </Button>
            <Typography variant="h4" component="h1" sx={tablePageStyles.pageTitle}>
              <UploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Загрузка прайса
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {supplier.name} (Firm ID: {supplier.firm_id})
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Основная форма загрузки */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Загрузить прайс-лист
                </Typography>

                {/* Выбор метода загрузки */}
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Способ загрузки</FormLabel>
                  <RadioGroup
                    row
                    value={uploadMethod}
                    onChange={handleMethodChange}
                  >
                    <FormControlLabel
                      value="file"
                      control={<Radio />}
                      label="Загрузить файл"
                    />
                    <FormControlLabel
                      value="text"
                      control={<Radio />}
                      label="Вставить XML"
                    />
                  </RadioGroup>
                </FormControl>

                {/* Загрузка файла */}
                {uploadMethod === 'file' && (
                  <Box>
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                        mb: 2,
                      }}
                    >
                      <input
                        type="file"
                        accept=".xml,application/xml,text/xml"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        id="xml-file-input"
                      />
                      <label htmlFor="xml-file-input">
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, display: 'block' }} />
                        <Button variant="outlined" component="span" sx={{ mb: 2 }}>
                          Выбрать XML файл
                        </Button>
                      </label>
                      <Typography variant="body2" color="text.secondary">
                        Поддерживаются файлы .xml размером до 25MB
                      </Typography>
                    </Paper>

                    {uploadedFile && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Выбран файл: <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Размер: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Ввод XML текста */}
                {uploadMethod === 'text' && (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={12}
                      placeholder="Вставьте XML содержимое прайс-листа здесь..."
                      value={xmlContent}
                      onChange={(e) => setXmlContent(e.target.value)}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      InputProps={{
                        sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Вставьте полное XML содержимое прайс-листа в формате hotline.xml
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Кнопка загрузки */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleUpload}
                    disabled={!canUpload() || isUploading}
                    size="large"
                  >
                    {isUploading ? 'Загружается...' : 'Загрузить прайс'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setUploadedFile(null);
                      setXmlContent('');
                      setUploadResult(null);
                      setUploadError(null);
                    }}
                    disabled={isUploading}
                  >
                    Очистить
                  </Button>
                </Box>

                {/* Прогресс загрузки */}
                {isUploading && (
                  <NormalizationProgress stage="processing" />
                )}

                {/* Результат загрузки */}
                {uploadResult && (
                  <>
                    <Alert 
                      severity={uploadResult.success ? 'success' : 'error'} 
                      sx={{ mt: 2 }}
                      icon={uploadResult.success ? <CheckCircleIcon /> : undefined}
                    >
                      <Typography variant="body2">
                        {uploadResult.message}
                      </Typography>
                      {uploadResult.version && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Версия: {uploadResult.version}
                        </Typography>
                      )}
                      {uploadResult.processing_started && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Обработка запущена в фоновом режиме
                        </Typography>
                      )}
                    </Alert>

                    {/* Статистика обработки */}
                    {uploadResult.success && uploadResult.statistics && (
                      <Card sx={{ mt: 2 }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <StatsIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="h6">
                              Статистика обработки
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Всего товаров
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {uploadResult.statistics.total_items.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Обработано
                              </Typography>
                              <Typography variant="h6" color="success.main">
                                {uploadResult.statistics.processed_items.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Создано новых
                              </Typography>
                              <Typography variant="h6" color="info.main">
                                {uploadResult.statistics.created_items.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Обновлено
                              </Typography>
                              <Typography variant="h6" color="warning.main">
                                {uploadResult.statistics.updated_items.toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                          {uploadResult.statistics.error_items > 0 && (
                            <Box mt={2}>
                              <Typography variant="body2" color="error.main">
                                Ошибок обработки: {uploadResult.statistics.error_items}
                              </Typography>
                            </Box>
                          )}
                          <Box mt={2}>
                            <Typography variant="body2" color="text.secondary">
                              Время обработки: {(uploadResult.statistics.processing_time_ms / 1000).toFixed(2)}с
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {/* Статистика нормализации */}
                    {uploadResult.success && uploadResult.normalization && (
                      <NormalizationStats stats={uploadResult.normalization} />
                    )}
                  </>
                )}

                {/* Ошибка загрузки */}
                {uploadError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {uploadError}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Информация и инструкции */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TextFieldsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Инструкции
                </Typography>

                <Typography variant="body2" paragraph>
                  <strong>Формат файла:</strong> XML в формате hotline.xml
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CodeIcon />}
                  endIcon={showXmlExample ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowXmlExample(!showXmlExample)}
                  sx={{ mb: 2 }}
                >
                  {showXmlExample ? 'Скрыть пример XML' : 'Показать пример XML файла'}
                </Button>

                {showXmlExample && (
                  <Paper 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                      maxHeight: 300,
                      overflow: 'auto',
                      mb: 2
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.7rem',
                        whiteSpace: 'pre-wrap',
                        color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.primary'
                      }}
                    >
{`<?xml version="1.0" encoding="UTF-8"?>
<price>
  <date>2025-08-03 10:00</date>
  <firmName>Ваше название компании</firmName>
  <firmId>${supplier.firm_id}</firmId>
  <categories>
    <category>
      <id>1</id>
      <name>Автошины</name>
    </category>
  </categories>
  <items>
    <item>
      <id>12345</id>
      <categoryId>1</categoryId>
      <vendor>Michelin</vendor>
      <name>Michelin CrossClimate (195/65R15 91H)</name>
      <description>Высококачественные всесезонные шины</description>
      <url>https://example.com/michelin-crossclimate</url>
      <image>https://example.com/images/michelin.jpg</image>
      <priceRUAH>2500</priceRUAH>
      <stock>В наявності</stock>
      <param name="Тип">Всесезонні шини</param>
      <param name="Ширина профілю шины, мм">195</param>
      <param name="Висота профілю шины, %">65</param>
      <param name="Внутрішній діаметр покришки, дюйми">15</param>
      <param name="Вантажопідйомність, кг">91</param>
      <param name="Швидкість максимальна, км/г">H</param>
      <param name="Країна виготовлення">Франция</param>
      <param name="Рік виготовлення">24р 15тиж</param>
      <condition>0</condition>
    </item>
  </items>
</price>`}
                    </Typography>
                  </Paper>
                )}

                <Typography variant="body2" paragraph>
                  <strong>Обязательные поля:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  <li>
                    <Typography variant="body2"><code>firmId</code> - должен быть <strong>{supplier.firm_id}</strong></Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>name</code> - полное название шины с размером</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>priceRUAH</code> - цена в гривнах</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>stock</code> - наличие ("В наявності" или "Немає в наявності")</Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Параметры шин (param name):</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  <li>
                    <Typography variant="body2"><code>Тип</code> - "Зимові шини", "Літні шини", "Всесезонні шини"</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>Ширина профілю шины, мм</code> - ширина (195, 205, 215...)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>Висота профілю шины, %</code> - высота (65, 55, 45...)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>Внутрішній діаметр покришки, дюйми</code> - диаметр (15, 16, 17...)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>Вантажопідйомність, кг</code> - индекс нагрузки (91, 95, 104...)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2"><code>Швидкість максимальна, км/г</code> - индекс скорости (H, V, W...)</Typography>
                  </li>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    После загрузки прайс будет обработан в фоновом режиме. 
                    Вы можете отслеживать прогресс на странице поставщика.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* API информация на всю ширину */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API загрузка
            </Typography>
            <Typography variant="body2" paragraph>
              Для автоматической загрузки используйте:
            </Typography>
            <Paper 
              sx={{ 
                p: 2, 
                backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                borderColor: 'divider',
                overflow: 'auto'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.primary',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word'
                }}
              >
                {`# Загрузка прайса администратором:
curl -X POST http://localhost:8000/api/v1/suppliers/${supplier.id}/admin_upload_price \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "file=@your_price_file.xml"

# Или с XML в теле запроса:
curl -X POST http://localhost:8000/api/v1/suppliers/${supplier.id}/admin_upload_price \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"xml_content": "<hotline>...</hotline>"}'

# Для поставщиков (с API ключом):
curl -X POST http://localhost:8000/api/v1/suppliers/upload_price \\
  -H "X-API-Key: ${supplier.api_key}" \\
  -F "file=@your_price_file.xml"

# Пример с XML в теле запроса (для поставщиков):
curl -X POST http://localhost:8000/api/v1/suppliers/upload_price \\
  -H "X-API-Key: ${supplier.api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{"xml_content": "<hotline>...</hotline>"}'`}
              </Typography>
            </Paper>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Для администраторов:</strong> Используйте первый пример с JWT токеном. 
                Замените <code>YOUR_JWT_TOKEN</code> на ваш токен авторизации и 
                <code>your_price_file.xml</code> на путь к файлу.
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                {`# Получение токена:
curl -X POST http://localhost:8000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"auth":{"email":"admin@test.com","password":"admin123"}}'`}
              </Typography>
            </Alert>
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Для поставщиков:</strong> Последние два примера с API ключом предназначены 
                для поставщиков, загружающих прайсы самостоятельно через endpoint 
                <code>/api/v1/suppliers/upload_price</code>. Используйте <code>@</code> 
                перед путем к файлу при использовании <code>-F</code>.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </AdminPageWrapper>
  );
};

export default SupplierUploadPage;