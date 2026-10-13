'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBillingSettings, useUpdateBillingSettings } from '@/hooks/usePharmacies';

/** Must match BILLING_CURRENCIES in the API. */
const CURRENCIES = ['USD', 'INR', 'GBP', 'EUR', 'AED', 'SGD', 'AUD', 'CAD'] as const;

/**
 * The standard visit fee: what checkout — the reception kiosk or the desk — charges for a visit
 * that has no fee of its own. A fixed fee, as a small practice charges; insurance and itemised
 * pricing are not calculated here.
 */
export function BillingSettingsCard() {
  const { data, isLoading } = useBillingSettings();
  const save = useUpdateBillingSettings();
  const [fee, setFee] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setFee(String(data.standardVisitFee));
    setCurrency(data.currency || 'USD');
  }, [data]);

  function handleSave() {
    const n = Number(fee);
    if (fee.trim() === '' || !Number.isFinite(n) || n < 0) {
      setError('Enter a fee of 0 or more');
      return;
    }
    setError(null);
    save.mutate({ standardVisitFee: n, currency });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout &amp; billing</CardTitle>
        <CardDescription>
          The fee checkout charges for a visit with no fee of its own — at the reception kiosk or the desk.
          Insurance is not calculated yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="standard-fee">Standard visit fee</Label>
            <Input
              id="standard-fee"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={fee}
              onChange={(e) => { setFee(e.target.value); setError(null); }}
              disabled={isLoading || save.isPending}
              aria-invalid={!!error}
            />
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : data?.isDefault ? (
              <p className="text-xs text-muted-foreground">Not set yet — checkout uses the default of 100.</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billing-currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency} disabled={isLoading || save.isPending}>
              <SelectTrigger id="billing-currency"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} loading={save.isPending}>Save fee</Button>
      </CardContent>
    </Card>
  );
}
