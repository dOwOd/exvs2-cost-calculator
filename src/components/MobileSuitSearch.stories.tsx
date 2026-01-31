/**
 * MobileSuitSearch ストーリー
 */

import type { Meta, StoryObj } from '@storybook/preact';
import { MobileSuitSearch } from './MobileSuitSearch';

const meta = {
  title: 'Components/MobileSuitSearch',
  component: MobileSuitSearch,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MobileSuitSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト: 基本表示 */
export const Default: Story = {
  args: {
    onSelect: (suit) => {
      console.log('選択された機体:', suit);
    },
  },
};

/** A機用プレースホルダー */
export const WithPlaceholderA: Story = {
  args: {
    placeholder: 'A機を検索...',
    onSelect: (suit) => {
      console.log('A機が選択されました:', suit);
    },
  },
};

/** B機用プレースホルダー */
export const WithPlaceholderB: Story = {
  args: {
    placeholder: 'B機を検索...',
    onSelect: (suit) => {
      console.log('B機が選択されました:', suit);
    },
  },
};
