/**
 * Formation型のモックデータ
 */

import type { Formation } from '../../lib/types';

/** 3000+3000編成 */
export const formation3000_3000: Formation = {
  unitA: { cost: 3000, health: 750 },
  unitB: { cost: 3000, health: 750 },
};

/** 3000+2500編成 */
export const formation3000_2500: Formation = {
  unitA: { cost: 3000, health: 750 },
  unitB: { cost: 2500, health: 680 },
};

/** 2500+2500編成 */
export const formation2500_2500: Formation = {
  unitA: { cost: 2500, health: 680 },
  unitB: { cost: 2500, health: 680 },
};

/** 3000+2000編成 */
export const formation3000_2000: Formation = {
  unitA: { cost: 3000, health: 750 },
  unitB: { cost: 2000, health: 580 },
};

/** 2000+2000編成 */
export const formation2000_2000: Formation = {
  unitA: { cost: 2000, health: 580 },
  unitB: { cost: 2000, health: 580 },
};

/** 1500+1500編成 */
export const formation1500_1500: Formation = {
  unitA: { cost: 1500, health: 500 },
  unitB: { cost: 1500, health: 500 },
};
