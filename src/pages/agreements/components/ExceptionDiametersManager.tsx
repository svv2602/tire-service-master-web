import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { TireDiameter } from '../../../api/agreementExceptions.api';

interface ExceptionDiametersManagerProps {
  selectedDiameters: string[];
  availableDiameters: TireDiameter[];
  onChange: (diameters: string[]) => void;
  diametersLoading?: boolean;
}

const ExceptionDiametersManager: React.FC<ExceptionDiametersManagerProps> = ({
  selectedDiameters,
  availableDiameters,
  onChange,
  diametersLoading = false
}) => {
  const [newDiameter, setNewDiameter] = useState<string>('');

  const handleAddDiameter = () => {
    if (newDiameter && !selectedDiameters.includes(newDiameter)) {
      onChange([...selectedDiameters, newDiameter]);
      setNewDiameter('');
    }
  };

  const handleRemoveDiameter = (diameterToRemove: string) => {
    onChange(selectedDiameters.filter(d => d !== diameterToRemove));
  };

  const formatDiameter = (diameter: string) => {
    return `${diameter}"`;
  };

  const availableToAdd = availableDiameters.filter(
    diameter => !selectedDiameters.includes(diameter.value)
  );

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Диаметры шин ({selectedDiameters.length})
      </Typography>

      {/* Добавление нового диаметра */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Добавить диаметр</InputLabel>
          <Select
            value={newDiameter}
            onChange={(e) => setNewDiameter(e.target.value)}
            label="Добавить диаметр"
            disabled={diametersLoading || availableToAdd.length === 0}
          >
            {availableToAdd.map((diameter) => (
              <MenuItem key={diameter.value} value={diameter.value}>
                {diameter.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleAddDiameter}
          disabled={!newDiameter || diametersLoading}
        >
          Добавить
        </Button>
      </Box>

      {/* Таблица выбранных диаметров */}
      {selectedDiameters.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Диаметр</TableCell>
                <TableCell width="80" align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedDiameters.map((diameter) => (
                <TableRow key={diameter}>
                  <TableCell>
                    <Chip 
                      label={formatDiameter(diameter)} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveDiameter(diameter)}
                      title="Удалить диаметр"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 3, 
          border: '2px dashed #ddd', 
          borderRadius: 1,
          color: 'text.secondary'
        }}>
          <Typography variant="body2">
            Диаметры не выбраны. Исключение будет применяться ко всем диаметрам.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExceptionDiametersManager;