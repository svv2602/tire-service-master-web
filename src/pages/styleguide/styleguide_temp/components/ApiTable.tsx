import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

export interface ApiProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface ApiTableProps {
  props: ApiProp[];
}

/**
 * Компонент для отображения API документации компонентов
 */
const ApiTable: React.FC<ApiTableProps> = ({ props }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Свойство</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>По умолчанию</TableCell>
            <TableCell>Описание</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell component="th" scope="row">
                <code>{prop.name}</code>
              </TableCell>
              <TableCell><code>{prop.type}</code></TableCell>
              <TableCell>{prop.default ? <code>{prop.default}</code> : '—'}</TableCell>
              <TableCell>{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApiTable;