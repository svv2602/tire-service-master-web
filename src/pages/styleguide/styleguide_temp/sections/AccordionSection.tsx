import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Accordion } from '../../../../components/ui/Accordion';

const AccordionSection = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Аккордеон (Accordion)
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовый аккордеон
          </Typography>
          <Accordion
            title="Раздел 1"
            expanded={expanded === 'panel1'}
            onChange={handleChange('panel1')}
          >
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </Accordion>
          <Accordion
            title="Раздел 2"
            expanded={expanded === 'panel2'}
            onChange={handleChange('panel2')}
          >
            <Typography>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
              Aliquam eget maximus est, id dignissim quam.
            </Typography>
          </Accordion>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Отключенный аккордеон
          </Typography>
          <Accordion
            title="Недоступный раздел"
            disabled
          >
            <Typography>
              Это содержимое недоступно для просмотра.
            </Typography>
          </Accordion>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Кастомный заголовок
          </Typography>
          <Accordion
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography color="primary">Специальный заголовок</Typography>
                <Typography variant="caption" color="text.secondary">
                  (с дополнительной информацией)
                </Typography>
              </Box>
            }
          >
            <Typography>
              Аккордеон с кастомным компонентом в заголовке.
            </Typography>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default AccordionSection; 