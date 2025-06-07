import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Pagination } from '../../../../components/ui/Pagination';

export const PaginationSection = () => {
  const [page, setPage] = useState(1);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Пагинация
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Pagination
          page={page}
          count={10}
          onChange={(newPage) => setPage(newPage)}
        />
        
        <Pagination
          page={page}
          count={10}
          onChange={(newPage) => setPage(newPage)}
          color="secondary"
          variant="outlined"
        />
        
        <Pagination
          page={page}
          count={10}
          onChange={(newPage) => setPage(newPage)}
          size="small"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default PaginationSection; 