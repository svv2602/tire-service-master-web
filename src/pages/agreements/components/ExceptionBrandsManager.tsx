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
import { TireBrand } from '../../../api/agreementExceptions.api';

interface ExceptionBrandsManagerProps {
  selectedBrandIds: number[];
  availableBrands: TireBrand[];
  onChange: (brandIds: number[]) => void;
  brandsLoading?: boolean;
}

const ExceptionBrandsManager: React.FC<ExceptionBrandsManagerProps> = ({
  selectedBrandIds,
  availableBrands,
  onChange,
  brandsLoading = false
}) => {
  const [newBrandId, setNewBrandId] = useState<string>('');

  const handleAddBrand = () => {
    const brandId = parseInt(newBrandId);
    if (brandId && !selectedBrandIds.includes(brandId)) {
      onChange([...selectedBrandIds, brandId]);
      setNewBrandId('');
    }
  };

  const handleRemoveBrand = (brandIdToRemove: number) => {
    onChange(selectedBrandIds.filter(id => id !== brandIdToRemove));
  };

  const getBrandName = (brandId: number) => {
    return availableBrands.find(brand => brand.id === brandId)?.name || `ID: ${brandId}`;
  };

  const availableToAdd = availableBrands.filter(
    brand => !selectedBrandIds.includes(brand.id)
  );

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Бренды шин ({selectedBrandIds.length})
      </Typography>

      {/* Добавление нового бренда */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Добавить бренд</InputLabel>
          <Select
            value={newBrandId}
            onChange={(e) => setNewBrandId(e.target.value)}
            label="Добавить бренд"
            disabled={brandsLoading || availableToAdd.length === 0}
          >
            {availableToAdd.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleAddBrand}
          disabled={!newBrandId || brandsLoading}
        >
          Добавить
        </Button>
      </Box>

      {/* Таблица выбранных брендов */}
      {selectedBrandIds.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Бренд</TableCell>
                <TableCell width="80" align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedBrandIds.map((brandId) => (
                <TableRow key={brandId}>
                  <TableCell>
                    <Chip 
                      label={getBrandName(brandId)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveBrand(brandId)}
                      title="Удалить бренд"
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
            Бренды не выбраны. Исключение будет применяться ко всем брендам.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExceptionBrandsManager;