import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

export const ModalSection: React.FC = () => {
  const [simpleModalOpen, setSimpleModalOpen] = React.useState(false);
  const [complexModalOpen, setComplexModalOpen] = React.useState(false);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Модальные окна
      </Typography>

      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSimpleModalOpen(true)}
          >
            Простое модальное окно
          </Button>

          <Modal
            open={simpleModalOpen}
            onClose={() => setSimpleModalOpen(false)}
            title="Простое модальное окно"
            actions={
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSimpleModalOpen(false)}
              >
                Закрыть
              </Button>
            }
          >
            <Typography>
              Это простое модальное окно с одной кнопкой действия.
            </Typography>
          </Modal>
        </Grid>

        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setComplexModalOpen(true)}
          >
            Сложное модальное окно
          </Button>

          <Modal
            open={complexModalOpen}
            onClose={() => setComplexModalOpen(false)}
            title="Сложное модальное окно"
            actions={
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setComplexModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setComplexModalOpen(false)}
                >
                  Подтвердить
                </Button>
              </>
            }
          >
            <Typography>
              Это сложное модальное окно с несколькими кнопками действий.
            </Typography>
          </Modal>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModalSection;