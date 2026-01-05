import type { Meta, StoryObj } from '@storybook/nextjs';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator } from './stepper';

const meta: Meta<typeof Stepper> = {
  title: 'UI/Stepper',
  component: Stepper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Horizontal: Story = {
  render: () => (
    <Stepper defaultValue={1} className="w-[500px]">
      <StepperItem step={0} completed>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Step 1</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={1}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Step 2</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Step 3</StepperTitle>
        </StepperTrigger>
      </StepperItem>
    </Stepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Stepper defaultValue={1} orientation="vertical">
      <StepperItem step={0} completed>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Account</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={1}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Profile</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Complete</StepperTitle>
        </StepperTrigger>
      </StepperItem>
    </Stepper>
  ),
};
