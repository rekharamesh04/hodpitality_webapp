/**
 * The face check-in notice: one wording for the kiosk, the enrolment screens and the public
 * policy page, so what a patient is told is the same everywhere.
 *
 * Every sentence here describes what the system actually does. Change the wording only together
 * with the behaviour it describes, and then change FACE_NOTICE_VERSION: each consent record stores
 * the version the person was shown.
 *
 *   - compared only within this organisation   → one Rekognition collection per organisation
 *   - the scan is deleted right after the check → backend deletes it in `finally`; a stray one is
 *                                                  deleted by the nightly sweep within a day
 *   - deleted on request / after a year unused  → DELETE …/face; nightly FACE_RETENTION_DAYS (365);
 *                                                  an organisation's faces go when it is deleted
 *   - processed by EntryFlow on AWS, never sold → no export, sale or sharing exists in the code
 */
export const FACE_NOTICE_VERSION = '2026-11-25';
export const BIOMETRIC_POLICY_PATH = '/biometric-policy';

export type FaceNoticeContext = 'kiosk' | 'enrol';
export type FaceNoticeTopic = 'compare' | 'delete' | 'retention' | 'processor' | 'optional' | 'withdraw';

export interface FaceNoticePoint {
  topic: FaceNoticeTopic;
  text: string;
}

/** `org` is the industry's word for the organisation ("hospital", "clinic"…), lower case. */
export function faceNoticePoints(org: string, context: FaceNoticeContext): FaceNoticePoint[] {
  const here = `this ${org || 'organisation'}`;
  const first: FaceNoticePoint[] = context === 'kiosk'
    ? [
        {
          topic: 'compare',
          text: `Your face is compared only with the registration photos of people who signed up for face check-in at ${here}, to find your record and check you in. It is not used for anything else.`,
        },
        {
          topic: 'delete',
          text: 'The image captured now is deleted right after the check, whether or not you are found.',
        },
      ]
    : [
        {
          topic: 'compare',
          text: `${capitalise(here)} keeps your photo and a face template made from it, only to recognise you when you check in here. Other organisations cannot search it, and it is not used for anything else.`,
        },
        {
          topic: 'delete',
          text: `At check-in your face is compared only with people registered for face check-in at ${here}. The picture taken then is deleted right after the check.`,
        },
      ];
  return [
    ...first,
    {
      topic: 'retention',
      text: 'Your registration photo and face data are deleted when you ask, and automatically after one year without use.',
    },
    {
      topic: 'processor',
      text: `They are processed for ${here} by its software provider, EntryFlow, on Amazon Web Services. They are never sold, and never shared with anyone else unless the law requires it.`,
    },
    {
      topic: 'optional',
      text: 'Face check-in is optional. Your phone number works the same way at every visit.',
    },
    {
      topic: 'withdraw',
      text: 'To stop using face check-in and have your face data deleted, ask at the reception desk.',
    },
  ];
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
