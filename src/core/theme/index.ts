import { tokens } from './tokens';
import { typography } from './typography';

export const theme = {
  ...tokens,
  typography,
} as const;

export type Theme = typeof theme;
export { tokens, typography };
export default theme;

