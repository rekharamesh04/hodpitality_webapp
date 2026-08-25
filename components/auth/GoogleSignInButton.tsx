'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignInButton({ onCredential, disabled, text = 'continue_with' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const renderButton = () => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredentialRef.current(response.credential),
      cancel_on_tap_outside: true,
    });

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'pill',
      logo_alignment: 'left',
      width: 336,
    });
  };

  useEffect(() => {
    renderButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
        Google sign-in isn&apos;t configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID).
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderButton}
      />
      <div
        ref={buttonRef}
        className={disabled ? 'pointer-events-none opacity-50' : 'flex justify-center'}
      />
    </>
  );
}
