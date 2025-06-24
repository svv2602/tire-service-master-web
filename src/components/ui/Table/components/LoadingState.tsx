import React from 'react';
import { 
  TableBody, 
  TableRow, 
  TableCell, 
  Skeleton, 
  Box 
} from '@mui/material';
import { Column } from '../Table';

interface LoadingStateProps {
  columns: Column[];
  rows?: number;
}

/**
 * Компонент для отображения состояния загрузки в таблице
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  columns, 
  rows = 5 
}) => {
  return (
    <TableBody>
      {Array.from({ length: rows }, (_, index) => (
        <TableRow key={`loading-${index}`}>
          {columns.map((column) => (
            <TableCell key={`loading-${column.id}-${index}`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton 
                  variant="text" 
                  width={
                    column.minWidth 
                      ? `${Math.min(column.minWidth * 0.8, 200)}px`
                      : '80%'
                  }
                  height={20}
                  animation="wave"
                />
              </Box>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default LoadingState; 