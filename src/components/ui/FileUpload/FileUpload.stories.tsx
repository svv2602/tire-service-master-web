import React from 'react';
import { Story, Meta } from '@storybook/react';
import FileUpload from './FileUpload';
import { FileUploadProps } from './types';

export default {
  title: 'UI/FileUpload',
  component: FileUpload,
  argTypes: {
    accept: {
      control: 'text',
      description: 'Разрешенные типы файлов',
    },
    maxSize: {
      control: 'number',
      description: 'Максимальный размер файла в байтах',
    },
    multiple: {
      control: 'boolean',
      description: 'Разрешить выбор нескольких файлов',
    },
    dropzoneText: {
      control: 'text',
      description: 'Текст для зоны перетаскивания',
    },
  },
} as Meta;

const Template: Story<FileUploadProps> = (args) => <FileUpload {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithImageRestrictions = Template.bind({});
WithImageRestrictions.args = {
  accept: '.jpg,.jpeg,.png',
  maxSize: 5 * 1024 * 1024, // 5MB
  dropzoneText: 'Перетащите изображения или нажмите для выбора',
};

export const MultipleFiles = Template.bind({});
MultipleFiles.args = {
  multiple: true,
  dropzoneText: 'Выберите несколько файлов',
};

export const DocumentUpload = Template.bind({});
DocumentUpload.args = {
  accept: '.pdf,.doc,.docx',
  maxSize: 10 * 1024 * 1024, // 10MB
  dropzoneText: 'Загрузите документы',
}; 