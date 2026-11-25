import type { Metadata } from 'next';
import Link from 'next/link';
import { FACE_NOTICE_VERSION } from '@/constants/face-notice';

export const metadata: Metadata = {
  title: 'Biometric Data Policy — EntryFlow',
  description: 'How face check-in data is collected, used, kept and destroyed.',
};

/**
 * The public, written biometric policy the kiosk and the enrolment notice point to. Readable
 * without signing in (middleware `openRoutes`).
 *
 * Every statement describes what the code does; see constants/face-notice.ts for where each one
 * is enforced. Change this page together with that behaviour, and bump FACE_NOTICE_VERSION.
 */
export default function BiometricPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <article className="mx-auto max-w-3xl space-y-8 text-[15px] leading-relaxed">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">EntryFlow · Version {FACE_NOTICE_VERSION}</p>
          <h1 className="text-3xl font-bold tracking-tight">Biometric Data Policy: face check-in</h1>
          <p className="text-muted-foreground">
            EntryFlow is software that hospitals, clinics and other organisations use to check in their patients and
            visitors. Some of them offer check-in by face. This policy explains how that face data is collected, used,
            kept and destroyed. The organisation where you registered decides whether to offer face check-in and is
            responsible for it; EntryFlow processes the data on its behalf.
          </p>
        </header>

        <Section title="What is collected">
          <ul className="list-disc space-y-1 pl-5">
            <li>A photo of your face, taken when you register for face check-in.</li>
            <li>
              A face template: a set of numbers describing your facial features, made from that photo by Amazon
              Rekognition. It is what a new picture is compared with.
            </li>
            <li>At each face check-in, the picture taken by the kiosk or desk camera.</li>
          </ul>
          <p>No fingerprints, voiceprints, or iris or retina scans are collected.</p>
        </Section>

        <Section title="Why it is used">
          <p>
            Only to recognise you when you check in or out at the organisation where you registered, and to find your
            existing record so you are not registered there twice. It is not used for marketing or profiling, and your
            face is not analysed for age, emotion or any other characteristic.
          </p>
        </Section>

        <Section title="Your consent">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Your face is enrolled only after you (or, for a child or someone unable to agree, a parent or guardian)
              have been shown the notice and agreed.
            </li>
            <li>The organisation records that you agreed, who agreed, when, and which version of the notice you were shown.</li>
            <li>Each time you use the kiosk, the notice is shown again before the camera starts.</li>
            <li>Face check-in is optional. Checking in with your phone number works the same way at every visit.</li>
          </ul>
        </Section>

        <Section title="How matching works">
          <p>
            Each organisation&rsquo;s faces are kept in their own separate collection. A picture taken at check-in is
            compared only with the people registered for face check-in at that organisation. Other organisations that
            use EntryFlow cannot search or see them.
          </p>
        </Section>

        <Section title="Who processes it">
          <p>
            EntryFlow, the organisation&rsquo;s software provider, using Amazon Web Services (Amazon Rekognition and
            Amazon S3) in the United States (AWS US East, Ohio region).
          </p>
          <p>
            Biometric data is never sold, leased or traded, or otherwise used for profit. It is not disclosed to anyone
            else unless you agree, or the law requires it (for example, a warrant or subpoena).
          </p>
        </Section>

        <Section title="How long it is kept, and when it is destroyed">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 font-semibold">Data</th>
                  <th className="py-2 font-semibold">Destroyed</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b">
                  <td className="py-2 pr-4">Picture taken at check-in</td>
                  <td className="py-2">
                    Right after the comparison, whether or not you are found. A picture whose comparison did not finish
                    (for example, the kiosk lost its connection) is deleted within 24 hours.
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Registration photo and face template</td>
                  <td className="py-2">
                    <ul className="list-disc space-y-1 pl-4">
                      <li>when you ask at the reception desk to stop using face check-in;</li>
                      <li>when your record is deleted;</li>
                      <li>when the organisation&rsquo;s EntryFlow account is closed;</li>
                      <li>when a new photo replaces it (the old one is deleted);</li>
                      <li>automatically, once it has gone one year without being used to check you in.</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Consent records</td>
                  <td className="py-2">
                    Kept as proof that you agreed or withdrew. They contain no photo or face template.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            If a deletion cannot be completed at once (for example, a temporary service fault), it is retried every
            night until it succeeds.
          </p>
        </Section>

        <Section title="How it is protected">
          <ul className="list-disc space-y-1 pl-5">
            <li>Sent only over encrypted connections (HTTPS).</li>
            <li>Photos are stored encrypted (Amazon S3 server-side encryption) in a private storage bucket.</li>
            <li>
              Only the organisation&rsquo;s signed-in staff, and the EntryFlow administrators and account managers
              responsible for that organisation, can see a registration photo.
            </li>
          </ul>
        </Section>

        <Section title="Your choices and questions">
          <p>
            You can stop using face check-in and have your face data deleted at any time: ask at the reception desk of
            the organisation where you registered. They can also answer questions about this policy or give you a
            printed copy.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes, the version at the top changes, and the notice shown before enrolment shows the new
            wording.
          </p>
        </Section>

        <footer className="border-t pt-6 text-sm text-muted-foreground">
          <Link href="/" className="underline underline-offset-4">EntryFlow</Link>
        </footer>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
