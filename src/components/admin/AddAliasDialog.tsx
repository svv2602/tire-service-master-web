import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface AddAliasDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (aliasData: AliasData) => void;
  originalValue: string;
  aliasType: 'brand' | 'country' | 'model';
}

interface AliasData {
  type: 'brand' | 'country' | 'model';
  originalValue: string;
  targetName: string;
  newAliases: string[];
}

interface ReferenceOption {
  id: number;
  name: string;
  aliases?: string[];
}

const AddAliasDialog: React.FC<AddAliasDialogProps> = ({
  open,
  onClose,
  onSave,
  originalValue,
  aliasType,
}) => {
  const [targetName, setTargetName] = useState('');
  const [newAliases, setNewAliases] = useState<string[]>([originalValue]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Моковые данные для демонстрации (в реальном приложении будут API запросы)
  const mockReferenceData: Record<string, ReferenceOption[]> = {
    brand: [
      { id: 1, name: 'Michelin', aliases: ['MICHELIN', 'michelin', 'Мишлен'] },
      { id: 2, name: 'Bridgestone', aliases: ['BRIDGESTONE', 'bridgestone', 'Бриджстоун'] },
      { id: 3, name: 'Continental', aliases: ['CONTINENTAL', 'continental', 'Континенталь'] },
    ],
    country: [
      { id: 1, name: 'Германия', aliases: ['Germany', 'DE', 'Deutschland'] },
      { id: 2, name: 'Франция', aliases: ['France', 'FR', 'Frankrijk'] },
      { id: 3, name: 'Япония', aliases: ['Japan', 'JP', 'Nihon'] },
    ],
    model: [
      { id: 1, name: 'Pilot Sport 4', aliases: ['PILOT SPORT 4', 'PS4'] },
      { id: 2, name: 'ContiSportContact 5', aliases: ['CSC5', 'SportContact 5'] },
    ],
  };

  const referenceOptions = mockReferenceData[aliasType] || [];

  const handleSave = () => {
    if (!targetName.trim()) return;

    const aliasData: AliasData = {
      type: aliasType,
      originalValue,
      targetName: targetName.trim(),
      newAliases: newAliases.filter(alias => alias.trim()),
    };

    onSave(aliasData);
    handleClose();
  };

  const handleClose = () => {
    setTargetName('');
    setNewAliases([originalValue]);
    setIsCreatingNew(false);
    onClose();
  };

  const handleAddAlias = (newAlias: string) => {
    if (newAlias.trim() && !newAliases.includes(newAlias.trim())) {
      setNewAliases(prev => [...prev, newAlias.trim()]);
    }
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setNewAliases(prev => prev.filter(alias => alias !== aliasToRemove));
  };

  const getTypeLabel = () => {
    switch (aliasType) {
      case 'brand': return 'бренда';
      case 'country': return 'страны';
      case 'model': return 'модели';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AddIcon sx={{ mr: 1 }} />
          Добавить алиас для {getTypeLabel()}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Оригинальное значение:</strong> "{originalValue}"
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Выберите существующую запись из справочника или создайте новую
          </Typography>
        </Alert>

        {/* Выбор существующей записи или создание новой */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            fullWidth
            options={[...referenceOptions, { id: -1, name: '+ Создать новую запись' }]}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <li {...props} style={{ fontStyle: option.id === -1 ? 'italic' : 'normal' }}>
                {option.name}
                {option.aliases && option.aliases.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (алиасы: {option.aliases.join(', ')})
                  </Typography>
                )}
              </li>
            )}
            onChange={(_, value) => {
              if (value) {
                if (value.id === -1) {
                  setIsCreatingNew(true);
                  setTargetName('');
                } else {
                  setIsCreatingNew(false);
                  setTargetName(value.name);
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Выберите ${getTypeLabel()}`}
                placeholder={`Найти существующую запись или создать новую`}
              />
            )}
          />
        </Box>

        {/* Поле для создания новой записи */}
        {isCreatingNew && (
          <TextField
            fullWidth
            label={`Название нового ${getTypeLabel()}`}
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder={`Введите название для нового ${getTypeLabel()}`}
            sx={{ mb: 3 }}
          />
        )}

        {/* Управление алиасами */}
        <Typography variant="h6" gutterBottom>
          Алиасы (альтернативные названия)
        </Typography>

        <Box sx={{ mb: 2 }}>
          {newAliases.map((alias, index) => (
            <Chip
              key={index}
              label={alias}
              onDelete={newAliases.length > 1 ? () => handleRemoveAlias(alias) : undefined}
              color={alias === originalValue ? 'primary' : 'default'}
              variant={alias === originalValue ? 'filled' : 'outlined'}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Добавить новый алиас"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              handleAddAlias(input.value);
              input.value = '';
            }
          }}
          helperText="Нажмите Enter для добавления алиаса"
        />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Важно:</strong> Алиасы помогают системе находить правильные соответствия. 
            Добавьте все возможные варианты написания этого {getTypeLabel()}.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<CloseIcon />}
          onClick={handleClose}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!targetName.trim() || newAliases.length === 0}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAliasDialog;