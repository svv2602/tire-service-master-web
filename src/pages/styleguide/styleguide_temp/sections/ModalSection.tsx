import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Modal } from '../../../../components/ui/Modal';

export const ModalSection = () => {
  const [simpleModalOpen, setSimpleModalOpen] = useState(false);
  const [complexModalOpen, setComplexModalOpen] = useState(false);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Модальные окна
      </Typography>
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={() => setSimpleModalOpen(true)}
        >
          Простое модальное окно
        </Button>

        <Button
          variant="contained"
          onClick={() => setComplexModalOpen(true)}
        >
          Сложное модальное окно
        </Button>

        <Modal
          open={simpleModalOpen}
          onClose={() => setSimpleModalOpen(false)}
          title="Простое модальное окно"
        >
          <Typography>
            Это простое модальное окно с базовым содержимым.
          </Typography>
        </Modal>

        <Modal
          open={complexModalOpen}
          onClose={() => setComplexModalOpen(false)}
          title="Сложное модальное окно"
          maxWidth={800}
          fullWidth
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography>
              Это сложное модальное окно с дополнительными элементами управления и форматированием.
            </Typography>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setComplexModalOpen(false)}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={() => setComplexModalOpen(false)}
              >
                Подтвердить
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default ModalSection;