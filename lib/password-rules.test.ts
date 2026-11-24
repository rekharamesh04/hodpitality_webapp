import { describe, expect, it } from 'vitest';
import { passwordProblem } from './password-rules';

describe('passwordProblem', () => {
  it('accepts a strong password', () => {
    expect(passwordProblem('Clinic#Desk2026')).toBeNull();
  });
  it('names the first thing that is missing', () => {
    expect(passwordProblem('Short1!')).toMatch(/12 characters/);
    expect(passwordProblem('alllowercase1!')).toMatch(/uppercase/);
    expect(passwordProblem('ALLUPPERCASE1!')).toMatch(/lowercase/);
    expect(passwordProblem('NoNumbersHere!')).toMatch(/number/);
    expect(passwordProblem('NoSymbolHere12')).toMatch(/symbol/);
  });
});
