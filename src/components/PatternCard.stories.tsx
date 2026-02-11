/**
 * PatternCard ストーリー
 */

import type { ComponentProps } from 'preact';
import type { Meta, StoryObj } from '@storybook/preact';
import { PatternCard } from './PatternCard';
import {
  formation3000_3000,
  formation3000_2500,
  formation2500_2500,
} from '../stories/mocks/formations';
import {
  topPatterns3000_3000,
  topPatterns3000_2500,
  exAvailablePattern,
  exFailurePattern,
  overCostPattern,
} from '../stories/mocks/patterns';

type Props = ComponentProps<typeof PatternCard>;

const meta: Meta<Props> = {
  title: 'Components/PatternCard',
  component: PatternCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Props>;

/** デフォルト: 通常のパターン表示 */
export const Default: Story = {
  args: {
    pattern: topPatterns3000_3000[0],
    rank: 1,
    maxTotalHealth: topPatterns3000_3000[0].totalHealth,
    formation: formation3000_3000,
  },
};

/** EXオーバーリミット発動可能 */
export const EXActivationAvailable: Story = {
  args: {
    pattern: exAvailablePattern,
    rank: 1,
    maxTotalHealth: topPatterns3000_3000[0].totalHealth,
    formation: formation3000_3000,
  },
};

/** EXオーバーリミット不発 */
export const EXActivationFailure: Story = {
  args: {
    pattern: exFailurePattern,
    rank: 1,
    maxTotalHealth: exFailurePattern.totalHealth,
    formation: formation3000_2500,
  },
};

/** コストオーバー状態を含む */
export const WithCostOver: Story = {
  args: {
    pattern: overCostPattern,
    rank: 1,
    maxTotalHealth: overCostPattern.totalHealth,
    formation: formation2500_2500,
  },
};

/** ランク2位のパターン */
export const Rank2: Story = {
  args: {
    pattern: topPatterns3000_3000[1] || topPatterns3000_3000[0],
    rank: 2,
    maxTotalHealth: topPatterns3000_3000[0].totalHealth,
    formation: formation3000_3000,
  },
};
