'use client';

import { useState } from 'react';
import { useWorkflow } from '@/hooks/useWorkflow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { QrCode, UserCheck } from 'lucide-react';

interface QuickCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId?: string;
}

export function QuickCheckInDialog({ open, onOpenChange, guestId }: QuickCheckInDialogProps) {
  const { processCheckIn, loading } = useWorkflow();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<'QR' | 'Manual'>('Manual');
  const [qrCode, setQrCode] = useState('');
  const [venue, setVenue] = useState('');
  const [printBadge, setPrintBadge] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await processCheckIn({
      method,
      venue,
      qrCode: method === 'QR' ? qrCode : undefined,
      guestId: method === 'Manual' ? guestId : undefined,
      printBadge,
    });

    if (result.success) {
      toast({
        title: 'Check-in Successful',
        description: `${result.data?.guest.name} has been checked in${printBadge && result.data?.badgePrinted ? ' and badge printed' : ''}`,
      });
      onOpenChange(false);
      setQrCode('');
    } else {
      toast({
        title: 'Check-in Failed',
        description: result.error || 'Failed to check in guest',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Quick Check-in</DialogTitle>
          <DialogDescription>
            Check in a guest using QR code or manual entry
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label>Check-in Method</Label>
              <RadioGroup value={method} onValueChange={(value) => setMethod(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="QR" id="qr" />
                  <Label htmlFor="qr" className="flex items-center gap-2 cursor-pointer">
                    <QrCode className="h-4 w-4" />
                    QR Code Scan
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Manual" id="manual" />
                  <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
                    <UserCheck className="h-4 w-4" />
                    Manual Entry
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {method === 'QR' && (
              <div className="grid gap-2">
                <Label htmlFor="qrCode">QR Code</Label>
                <Input
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Scan or enter QR code"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Scan the guest's QR code or enter it manually
                </p>
              </div>
            )}

            {method === 'Manual' && !guestId && (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  Please select a guest from the list first, or use QR code scan
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Main Hall"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="printBadge"
                checked={printBadge}
                onCheckedChange={(checked) => setPrintBadge(checked as boolean)}
              />
              <Label
                htmlFor="printBadge"
                className="text-sm font-medium cursor-pointer"
              >
                Print badge after check-in
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (method === 'Manual' && !guestId)}
            >
              {loading ? 'Checking in...' : 'Check In'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}