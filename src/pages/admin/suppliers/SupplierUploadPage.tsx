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
      setUploadError(error?.data?.error || 'Произошла ошибка при загрузке прайса');
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
                        Поддерживаются файлы .xml размером до 50MB
                      </Typography>
                    </Paper>

                    {uploadedFile && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Выбран файл: <strong>{uploadedFile.name}</strong>
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
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Загрузка и обработка прайс-листа...
                    </Typography>
                  </Box>
                )}

                {/* Результат загрузки */}
                {uploadResult && (
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

                <Typography variant="body2" paragraph>
                  <strong>Обязательные поля:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  <li>
                    <Typography variant="body2">firmId - должен совпадать с {supplier.firm_id}</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Название товара (name)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Цена (priceRUAH)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Наличие (stock)</Typography>
                  </li>
                </Box>

                <Typography variant="body2" paragraph>
                  <strong>Параметры шин:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                  <li>
                    <Typography variant="body2">Тип (сезонность)</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Ширина профиля</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Высота профиля</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Диаметр</Typography>
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

            {/* API информация */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API загрузка
                </Typography>
                <Typography variant="body2" paragraph>
                  Для автоматической загрузки используйте:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    POST /api/v1/suppliers/upload_price<br/>
                    Authorization: Bearer {supplier.api_key.substring(0, 20)}...
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminPageWrapper>
  );
};

export default SupplierUploadPage;