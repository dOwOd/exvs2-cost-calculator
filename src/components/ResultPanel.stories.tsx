/**
 * ResultPanel ストーリー
 */

import type { Meta, StoryObj } from '@storybook/preact';
import { ResultPanel } from './ResultPanel';
import {
  formation3000_3000,
  formation3000_2500,
  formation2500_2500,
} from '../stories/mocks/formations';
import {
  patterns3000_3000,
  patterns3000_2500,
  patterns2500_2500,
} from '../stories/mocks/patterns';
import { calculateMinimumDefeatHealth } from '../lib/calculator';

const meta = {
  title: 'Components/ResultPanel',
  component: ResultPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResultPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト: 3000+3000編成 */
export const Default: Story = {
  args: {
    patterns: patterns3000_3000,
    formation: formation3000_3000,
    minimumDefeatHealth: calculateMinimumDefeatHealth(formation3000_3000),
  },
};

/** 3000+2500編成 */
export const Formation3000_2500: Story = {
  args: {
    patterns: patterns3000_2500,
    formation: formation3000_2500,
    minimumDefeatHealth: calculateMinimumDefeatHealth(formation3000_2500),
  },
};

/** 2500+2500編成 */
export const Formation2500_2500: Story = {
  args: {
    patterns: patterns2500_2500,
    formation: formation2500_2500,
    minimumDefeatHealth: calculateMinimumDefeatHealth(formation2500_2500),
  },
};

/** パターンなし（空状態） */
export const Empty: Story = {
  args: {
    patterns: [],
    formation: {
      unitA: null,
      unitB: null,
    },
    minimumDefeatHealth: 0,
  },
};
