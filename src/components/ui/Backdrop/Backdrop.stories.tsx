import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import Button from '@mui/material/Button';
import { Backdrop } from './Backdrop';
import { BackdropProps } from './types';

const meta = {
  title: 'Components/Backdrop',
  component: Backdrop,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Backdrop>;

export default meta;
type Story = StoryFn<BackdropProps>;

// Компонент-обертка для демонстрации
const BasicDemo: React.FC<{ args: BackdropProps }> = ({ args }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Открыть Backdrop</Button>
      <Backdrop {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

/**
 * Базовый пример использования Backdrop
 */
export const Basic: Story = (args) => <BasicDemo args={args} />;
Basic.args = {
  open: true,
};

// Компонент-обертка для демонстрации с загрузкой
const LoadingDemo: React.FC<{ args: BackdropProps }> = ({ args }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Показать загрузку</Button>
      <Backdrop {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

/**
 * Backdrop с индикатором загрузки
 */
export const WithLoading: Story = (args) => <LoadingDemo args={args} />;
WithLoading.args = {
  open: true,
  spinner: true,
  message: 'Загрузка...',
};

// Компонент-обертка для демонстрации с кастомным контентом
const CustomContentDemo: React.FC<{ args: BackdropProps }> = ({ args }) => {
  const [open, setOpen] = React.useState(false);
  
  const customContent = (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center'
    }}>
      <h3>Кастомный контент</h3>
      <Button variant="contained" onClick={() => setOpen(false)}>
        Закрыть
      </Button>
    </div>
  );
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Открыть с контентом</Button>
      <Backdrop 
        {...args} 
        open={open} 
        onClose={() => setOpen(false)} 
        customContent={customContent}
      />
    </>
  );
};

/**
 * Backdrop с кастомным контентом
 */
export const WithCustomContent: Story = (args) => <CustomContentDemo args={args} />;
WithCustomContent.args = {
  open: true,
}; 