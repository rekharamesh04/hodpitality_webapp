import { describe, expect, it } from 'vitest';
import { AVAILABLE_INDUSTRIES, industryPack, type IndustryModule } from './industry';
import { getNavSections, getVisibleNavSections } from './navigation';
import { getWorkflow, workflowStepIndex } from './workflow';

const hrefsOf = (slug: string) => getWorkflow(slug).map((s) => s.href);

describe('the workflow', () => {
  it('exists for every industry that can be chosen, and no other', () => {
    for (const slug of AVAILABLE_INDUSTRIES) expect(getWorkflow(slug).length, slug).toBeGreaterThan(2);
    expect(getWorkflow('retail')).toEqual([]);
    expect(getWorkflow('other')).toEqual([]);
    expect(getWorkflow(undefined)).toEqual([]);
  });

  it('starts by registering the person and ends at payments', () => {
    for (const slug of AVAILABLE_INDUSTRIES) {
      const hrefs = hrefsOf(slug);
      expect(hrefs[0], slug).toBe('/guests');
      expect(hrefs[hrefs.length - 1], slug).toBe('/payments');
    }
  });

  it('runs each industry through its own flagship screen in order', () => {
    expect(hrefsOf('pharmacy')).toEqual(['/guests', '/calendar', '/prescriptions', '/pickup', '/payments']);
    expect(hrefsOf('wellness')).toEqual(['/guests', '/calendar', '/check-ins', '/treatments', '/hospitality', '/payments']);
    expect(hrefsOf('hospitality')).toEqual(['/guests', '/calendar', '/front-desk', '/hospitality', '/payments']);
  });

  it('never repeats a page, so "which step am I on" has one answer', () => {
    for (const slug of AVAILABLE_INDUSTRIES) {
      const hrefs = hrefsOf(slug);
      expect(new Set(hrefs).size, slug).toBe(hrefs.length);
    }
  });

  it('only includes steps whose module the industry is offered', () => {
    for (const slug of AVAILABLE_INDUSTRIES) {
      const modules = industryPack(slug).modules as readonly IndustryModule[];
      for (const step of getWorkflow(slug)) {
        if (step.module) expect(modules, `${slug} ${step.href}`).toContain(step.module);
      }
    }
  });

  it('speaks the tenant vocabulary', () => {
    expect(getWorkflow('pharmacy')[0].label).toBe('Register patient');
    expect(getWorkflow('wellness')[1].label).toBe('Book treatment');
    expect(getWorkflow('hospitality')[1].label).toBe('Take booking');
  });

  it('finds the current step from a page or one of its detail pages', () => {
    const steps = getWorkflow('pharmacy');
    expect(workflowStepIndex(steps, '/prescriptions')).toBe(2);
    expect(workflowStepIndex(steps, '/prescriptions/rx-1')).toBe(2);
    expect(workflowStepIndex(steps, '/guests/g-1')).toBe(0);
    expect(workflowStepIndex(steps, '/reports')).toBe(-1);
    // A prefix that is not a path segment is a different page.
    expect(workflowStepIndex(steps, '/paymentsx')).toBe(-1);
  });
});

describe('navigation with a workflow', () => {
  it('lists Operations in workflow order, numbered from 1', () => {
    for (const slug of AVAILABLE_INDUSTRIES) {
      const ops = getVisibleNavSections('company_admin', slug).find((s) => s.menuLabel === 'Operations')!;
      const steps = ops.items.filter((i) => i.step);
      expect(steps.map((i) => i.href), slug).toEqual(hrefsOf(slug));
      expect(steps.map((i) => i.step), slug).toEqual(steps.map((_, i) => i + 1));
      // Tools outside the flow come after it, never between steps.
      const firstExtra = ops.items.findIndex((i) => !i.step);
      if (firstExtra >= 0) expect(ops.items.slice(firstExtra).every((i) => !i.step), slug).toBe(true);
    }
  });

  it('lists every page exactly once', () => {
    for (const slug of AVAILABLE_INDUSTRIES) {
      const hrefs = getNavSections(slug).flatMap((s) => s.items.map((i) => i.href));
      expect(new Set(hrefs).size, slug).toBe(hrefs.length);
    }
  });

  it('keeps every page reachable that the grouped navigation offered', () => {
    const grouped = new Set(getNavSections('other').flatMap((s) => s.items.map((i) => i.href)));
    for (const slug of AVAILABLE_INDUSTRIES) {
      for (const href of getNavSections(slug).flatMap((s) => s.items.map((i) => i.href))) {
        expect(grouped, `${slug} ${href}`).toContain(href);
      }
      expect(getNavSections(slug).flatMap((s) => s.items.map((i) => i.href)), slug).toContain('/staff');
    }
  });

  it('leaves the navigation of industries without a workflow unnumbered', () => {
    for (const item of getNavSections('retail').flatMap((s) => s.items)) expect(item.step).toBeUndefined();
  });
});
