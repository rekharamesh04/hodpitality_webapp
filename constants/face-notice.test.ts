import { describe, expect, it } from 'vitest';
import { FACE_NOTICE_VERSION, faceNoticePoints } from './face-notice';

describe('face check-in notice', () => {
  it('covers every topic, on the kiosk and at enrolment', () => {
    for (const context of ['kiosk', 'enrol'] as const) {
      expect(faceNoticePoints('hospital', context).map((p) => p.topic)).toEqual(
        ['compare', 'delete', 'retention', 'processor', 'optional', 'withdraw'],
      );
    }
  });

  it('says the comparison stays within this organisation', () => {
    const compare = faceNoticePoints('clinic', 'kiosk')[0].text;
    expect(compare).toContain('at this clinic');
    // The old wording promised a one-to-one comparison with your own photo, which is not how
    // face search works: it looks through everyone registered at the organisation.
    expect(compare).not.toMatch(/only with the photo(graph)? you/i);
  });

  it('says the scan is deleted whether or not there is a match', () => {
    expect(faceNoticePoints('clinic', 'kiosk')[1].text).toMatch(/whether or not/);
  });

  it('names who processes the data and that it is never sold', () => {
    const text = faceNoticePoints('clinic', 'kiosk').find((p) => p.topic === 'processor')!.text;
    expect(text).toContain('Amazon Web Services');
    expect(text).toMatch(/never sold/);
  });

  it('has a dated version for the consent record', () => {
    expect(FACE_NOTICE_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
