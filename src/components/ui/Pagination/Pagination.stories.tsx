import React, { useState } from "react";
import { Story, Meta } from "@storybook/react";
import { Pagination, PaginationProps } from "./Pagination";
import { Box } from "@mui/material";

export default {
  title: "UI/Pagination",
  component: Pagination,
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "standard"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    shape: {
      control: "select",
      options: ["circular", "rounded"],
    },
    variant: {
      control: "select",
      options: ["text", "outlined"],
    },
  },
} as Meta;

const Template: Story<PaginationProps> = (args) => {
  const [page, setPage] = useState(args.page || 1);
  
  const handleChange = (newPage: number) => {
    setPage(newPage);
  };
  
  return <Pagination {...args} page={page} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  count: 10,
  page: 1,
};

export const WithBoundaryButtons = Template.bind({});
WithBoundaryButtons.args = {
  count: 10,
  page: 5,
  showFirstButton: true,
  showLastButton: true,
};

export const Sizes = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Pagination count={10} page={1} size="small" onChange={() => {}} />
    <Pagination count={10} page={1} size="medium" onChange={() => {}} />
    <Pagination count={10} page={1} size="large" onChange={() => {}} />
  </Box>
);

export const Variants = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Pagination count={10} page={1} variant="text" onChange={() => {}} />
    <Pagination count={10} page={1} variant="outlined" onChange={() => {}} />
  </Box>
);

export const Colors = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Pagination count={10} page={3} color="primary" onChange={() => {}} />
    <Pagination count={10} page={3} color="secondary" onChange={() => {}} />
    <Pagination count={10} page={3} color="standard" onChange={() => {}} />
  </Box>
);

export const Disabled = Template.bind({});
Disabled.args = {
  count: 10,
  page: 1,
  disabled: true,
};