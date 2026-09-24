import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INDUSTRY,
  INDUSTRIES,
  AVAILABLE_INDUSTRIES,
  INDUSTRY_OPTIONS,
  isIndustryAvailable,
  INDUSTRY_SLUGS,
  industryAdminLabel,
  industryHasModule,
  industryLabel,
  industryPack,
  isIndustrySlug,
  normalizeIndustry,
} from './industry';
import { badgeTone, badgeToneClass } from './badge-tone';
import { guestCategories, guestCategoryBadgeClass, guestCategoryOptions } from './guest';
import { customerTierOptions, customerTiers, tierBadgeClass } from './customer';
import { roleLabel } from './roles';
import { getNavSections, getVisibleNavSections } from './navigation';

/**
 * The rule these tests defend is that an industry changes what the product
 * CALLS things and never what it stores. Nothing here expects a value written
 * under one industry to be rewritten, dropped or hidden under another.
 */

describe('the registry', () => {
  it('declares every field for every industry', () => {
    for (const slug of INDUSTRY_SLUGS) {
      const pack = INDUSTRIES[slug];
      for (const noun of ['person', 'account', 'visit', 'place'] as const) {
        expect(pack[noun].one, `${slug}.${noun}.one`).toBeTruthy();
        expect(pack[noun].many, `${slug}.${noun}.many`).toBeTruthy();
      }
      expect(pack.org, `${slug}.org`).toBeTruthy();
      expect(pack.categories.length, `${slug}.categories`).toBeGreaterThan(0);
      expect(pack.tiers.length, `${slug}.tiers`).toBeGreaterThan(0);
      expect(pack.services.length, `${slug}.services`).toBeGreaterThan(0);
    }
  });

  it('carries the ten industries from the brief', () => {
    const expected: Record<string, string> = {
      healthcare: 'Patient', hospitality: 'Guest', education: 'Student',
      fitness: 'Member', professional_services: 'Client', retail: 'Customer',
      real_estate: 'Resident', government: 'Citizen', events: 'Attendee',
      transportation: 'Passenger',
    };
    for (const [slug, person] of Object.entries(expected)) {
      expect(industryPack(slug).person.one, slug).toBe(person);
    }
  });

  it('never gives a person and an account the same name in healthcare', () => {
    // Two nav entries both reading "Patients" would be unusable.
    const pack = industryPack('healthcare');
    expect(pack.person.many).not.toBe(pack.account.many);
  });

  it('declares priority values that exist in its own vocabulary', () => {
    // A priority value absent from categories and tiers could never match.
    for (const slug of INDUSTRY_SLUGS) {
      const pack = INDUSTRIES[slug];
      const available = new Set(
        [...pack.categories, ...pack.tiers].map((v) => v.toLowerCase()),
      );
      expect(pack.priority.length, `${slug} has no priority values`).toBeGreaterThan(0);
      for (const value of pack.priority) {
        expect(available, `${slug}: '${value}' matches nothing`).toContain(value.toLowerCase());
      }
    }
  });

  it('offers every module on the default industry', () => {
    // An unclassified tenant must not silently lose a page it already used.
    const all = new Set(INDUSTRY_SLUGS.flatMap((s) => [...INDUSTRIES[s].modules]));
    expect(new Set(INDUSTRIES[DEFAULT_INDUSTRY].modules)).toEqual(all);
  });

  it('keeps a neutral category in every industry', () => {
    // `regular` is what existing rows already hold.
    for (const slug of INDUSTRY_SLUGS) {
      expect(INDUSTRIES[slug].categories, slug).toContain('regular');
    }
  });

  it('lists every industry in the picker, with Other last', () => {
    expect(INDUSTRY_OPTIONS).toHaveLength(INDUSTRY_SLUGS.length);
    expect(INDUSTRY_OPTIONS.at(-1)?.slug).toBe(DEFAULT_INDUSTRY);
  });
});

describe('normalizing an industry', () => {
  it('never throws, whatever the API sends', () => {
    for (const value of [undefined, null, '', '   ', 'nonsense', 42, {}, [], true]) {
      expect(INDUSTRY_SLUGS).toContain(normalizeIndustry(value));
    }
  });

  it('ignores case and surrounding space', () => {
    expect(normalizeIndustry('  HealthCare ')).toBe('healthcare');
  });

  it('falls back to the default for an unknown slug', () => {
    expect(normalizeIndustry('crypto-mining')).toBe(DEFAULT_INDUSTRY);
    expect(isIndustrySlug('crypto-mining')).toBe(false);
  });

  it('labels an unknown industry rather than rendering blank', () => {
    expect(industryLabel('nope')).toBe(INDUSTRIES[DEFAULT_INDUSTRY].label);
  });
});

describe('role labels', () => {
  it('names the admin after the organisation', () => {
    expect(roleLabel('company_admin', 'healthcare')).toBe('Hospital Admin');
    expect(roleLabel('company_admin', 'hospitality')).toBe('Hotel Admin');
    expect(roleLabel('company_admin', 'education')).toBe('School Admin');
  });

  it('renames the clinical roles for a school', () => {
    expect(roleLabel('doctor', 'education')).toBe('Teacher');
    expect(roleLabel('nurse', 'education')).toBe('Assistant');
    expect(roleLabel('doctor', 'healthcare')).toBe('Doctor');
  });

  it('leaves industry-neutral roles alone', () => {
    expect(roleLabel('super_admin', 'education')).toBe('Super Admin');
    expect(roleLabel('receptionist', 'retail')).toBe('Receptionist');
  });

  it('passes through an unknown role instead of hiding it', () => {
    // Legacy rows may hold "manager"; an admin has to be able to see and fix it.
    expect(roleLabel('manager', 'retail')).toBe('manager');
    expect(roleLabel(undefined, 'retail')).toBe('—');
  });
});

describe('badge tones', () => {
  it('keeps the colours rows already have', () => {
    // Data written before industries existed must not change shade.
    expect(badgeTone('VIP', ['VIP', 'Corporate'])).toBe('amber');
    expect(badgeTone('Speaker', [])).toBe('purple');
    expect(badgeTone('Founding', [])).toBe('amber');
  });

  it('renders a value from another industry neutral, never blank', () => {
    const cls = guestCategoryBadgeClass('Speaker', 'healthcare');
    expect(cls).toBeTruthy();
    expect(badgeTone('Inpatient', guestCategories('retail'))).toBe('neutral');
  });

  it('keeps the ordinary case quiet', () => {
    expect(badgeTone('regular', ['VIP', 'regular'])).toBe('neutral');
    expect(badgeTone('Standard', ['Gold', 'Standard'])).toBe('neutral');
  });

  it('always returns a class, even for junk', () => {
    for (const value of [undefined, null, '', 42, {}]) {
      expect(badgeToneClass(value, ['VIP'])).toBeTruthy();
    }
  });
});

describe('category and tier options', () => {
  it('offers the industry vocabulary', () => {
    expect(guestCategories('healthcare')).toContain('Inpatient');
    expect(guestCategories('hospitality')).toContain('VIP');
    expect(customerTiers('transportation')).toContain('Platinum');
  });

  it('keeps a value the record already holds, so a save cannot drop it', () => {
    const options = guestCategoryOptions('healthcare', 'Speaker');
    expect(options).toContain('Speaker');
    expect(options).toContain('Inpatient');
  });

  it('does not duplicate a value already offered', () => {
    const options = guestCategoryOptions('hospitality', 'vip');
    expect(options.filter((o) => o.toLowerCase() === 'vip')).toHaveLength(1);
  });

  it('does the same for tiers', () => {
    expect(customerTierOptions('retail', 'Founding')).toContain('Founding');
    expect(tierBadgeClass('Founding', 'retail')).toBeTruthy();
  });
});

describe('navigation', () => {
  it('labels the directory and the account page differently', () => {
    const people = getNavSections('healthcare').find((s) => s.menuLabel === 'People')!;
    const labels = people.items.map((i) => i.label);
    expect(labels).toContain('Patients');
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('keeps routes stable across industries', () => {
    // Renaming URLs per tenant would break bookmarks and notification links.
    const hrefs = (slug: string) => getNavSections(slug).flatMap((s) => s.items.map((i) => i.href));
    expect(hrefs('healthcare')).toEqual(hrefs('retail'));
  });

  it('hides a module an industry does not include', () => {
    const retail = getVisibleNavSections('company_admin', 'retail').flatMap((s) => s.items.map((i) => i.href));
    expect(retail).not.toContain('/hospitality');
    expect(retail).toContain('/payments');
  });

  it('shows everything to an unclassified tenant', () => {
    const other = getVisibleNavSections('company_admin', 'other').flatMap((s) => s.items.map((i) => i.href));
    expect(other).toContain('/hospitality');
    expect(other).toContain('/registrations');
  });

  it('still hides admin-only entries from a company admin', () => {
    const hrefs = getVisibleNavSections('company_admin', 'other').flatMap((s) => s.items.map((i) => i.href));
    expect(hrefs).not.toContain('/resellers');
    expect(hrefs).toContain('/companies');
  });

  it('drops a section once every item in it is filtered out', () => {
    for (const section of getVisibleNavSections('staff', 'transportation')) {
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it('reports modules consistently with the pack', () => {
    expect(industryHasModule('retail', 'hospitality')).toBe(false);
    expect(industryHasModule('healthcare', 'prescriptions')).toBe(true);
    expect(industryAdminLabel('retail')).toBe('Store Admin');
  });

  it('offers the pharmacy pages to the industries that hold the module', () => {
    for (const slug of ['pharmacy', 'healthcare'] as const) {
      const hrefs = getVisibleNavSections('company_admin', slug).flatMap((s) => s.items.map((i) => i.href));
      expect(hrefs, slug).toContain('/prescriptions');
      expect(hrefs, slug).toContain('/pickup');
    }
  });

  it('hides the pharmacy pages from an industry without the module', () => {
    const hrefs = getVisibleNavSections('company_admin', 'retail').flatMap((s) => s.items.map((i) => i.href));
    expect(hrefs).not.toContain('/prescriptions');
    expect(hrefs).not.toContain('/pickup');
  });

  it('only offers the industries that have screens behind them', () => {
    expect([...AVAILABLE_INDUSTRIES].sort()).toEqual(['hospitality', 'pharmacy', 'wellness']);
    for (const slug of AVAILABLE_INDUSTRIES) expect(isIndustryAvailable(slug)).toBe(true);
    expect(isIndustryAvailable('retail')).toBe(false);
    expect(isIndustryAvailable('other')).toBe(false);
    expect(isIndustryAvailable('nonsense')).toBe(false);
  });

  it('marks every option, and keeps them all listed', () => {
    // Unavailable industries stay visible — the picker shows the roadmap, it
    // just will not let you pick an unbuilt one.
    expect(INDUSTRY_OPTIONS).toHaveLength(INDUSTRY_SLUGS.length);
    expect(INDUSTRY_OPTIONS.filter((o) => o.available)).toHaveLength(AVAILABLE_INDUSTRIES.length);
  });

  it('puts the choosable options first so they are not buried', () => {
    // 'Other' is pinned last, so the ordering rule applies to everything above it.
    const upToOther = INDUSTRY_OPTIONS.slice(0, -1);
    const firstUnavailable = upToOther.findIndex((o) => !o.available);
    const lastAvailable = upToOther.map((o) => o.available).lastIndexOf(true);
    expect(lastAvailable).toBeLessThan(firstUnavailable);
  });

  it('never marks an industry available unless it has a flagship module', () => {
    // The list is hand-maintained, so this is what stops a slug being added to
    // it before the screens that justify it exist.
    const FLAGSHIP = ['prescriptions', 'treatments', 'frontdesk'];
    for (const slug of AVAILABLE_INDUSTRIES) {
      const modules = industryPack(slug).modules as readonly string[];
      expect(modules.some((m) => FLAGSHIP.includes(m)), slug).toBe(true);
    }
  });

  it('gives each demo industry a flagship screen the others do not get', () => {
    // The point of the demo is that one login looks like a different product
    // from the next, so these three must not converge.
    const hrefsFor = (slug: string) =>
      getVisibleNavSections('company_admin', slug).flatMap((s) => s.items.map((i) => i.href));

    const pharmacy = hrefsFor('pharmacy');
    const spa = hrefsFor('wellness');
    const hotel = hrefsFor('hospitality');

    expect(pharmacy).toContain('/prescriptions');
    expect(pharmacy).not.toContain('/treatments');
    expect(pharmacy).not.toContain('/front-desk');

    expect(spa).toContain('/treatments');
    expect(spa).not.toContain('/prescriptions');
    expect(spa).not.toContain('/front-desk');

    expect(hotel).toContain('/front-desk');
    expect(hotel).not.toContain('/prescriptions');
    expect(hotel).not.toContain('/treatments');
  });

  it('labels the treatment board in each industry\u2019s own words', () => {
    // wellness calls a visit a Treatment, so the nav must read "Treatment Board".
    const label = (slug: string) =>
      getVisibleNavSections('company_admin', slug)
        .flatMap((s) => s.items)
        .find((i) => i.href === '/treatments')?.label;
    expect(label('wellness')).toBe('Treatment Board');
    expect(label('other')).toBe('Visit Board');
  });

  it('names a pharmacy after its own roles rather than a hospital\u2019s', () => {
    expect(industryAdminLabel('pharmacy')).toBe('Pharmacy Admin');
    expect(roleLabel('doctor', 'pharmacy')).toBe('Pharmacist');
    expect(roleLabel('nurse', 'pharmacy')).toBe('Technician');
  });
});
