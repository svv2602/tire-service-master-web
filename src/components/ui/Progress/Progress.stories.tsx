import React from "react";
import { Story, Meta } from "@storybook/react";
import { Progress, ProgressProps } from "./Progress";

export default {
  title: "UI/Progress",
  component: Progress,
} as Meta;

const Template: Story<ProgressProps> = (args) => <Progress {...args} />;

export const Linear = Template.bind({});
Linear.args = {
  variant: "linear",
  value: 60,
};

export const Circular = Template.bind({});
Circular.args = {
  variant: "circular",
  value: 60,
};