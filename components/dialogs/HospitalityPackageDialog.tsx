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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Hotel, Car, Utensils, Plane, Star } from 'lucide-react';

interface HospitalityPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string;
  guestName: string;
}

const packageOptions = {
  standard: {
    name: 'Standard Package',
    description: 'Essential services for delegates',
    price: 450,
    services: [
      { icon: Hotel, name: 'Standard Hotel', description: 'Double room (2 nights)' },
      { icon: Car, name: 'Shuttle Service', description: 'Hotel to venue transport' },
    ]
  },
  speaker: {
    name: 'Speaker Package',
    description: 'Enhanced services for speakers',
    price: 1100,
    services: [
      { icon: Hotel, name: 'Executive Hotel', description: 'Executive room (2 nights)' },
      { icon: Car, name: 'Premium Transport', description: 'Executive car service' },
      { icon: Utensils, name: 'Meal Package', description: 'All conference meals included' },
    ]
  },
  vip: {
    name: 'VIP Package',
    description: 'Luxury services for VIP guests',
    price: 2350,
    services: [
      { icon: Hotel, name: 'Luxury Suite', description: '5-star hotel - Deluxe suite (3 nights)' },
      { icon: Car, name: 'Chauffeur Service', description: 'Luxury car with personal driver' },
      { icon: Utensils, name: 'VIP Dining', description: 'Exclusive dining experiences' },
      { icon: Plane, name: 'Airport VIP', description: 'VIP lounge & premium pickup' },
      { icon: Star, name: 'Concierge', description: 'Personal concierge service' },
    ]
  }
};

export function HospitalityPackageDialog({ 
  open, 
  onOpenChange, 
  guestId, 
  guestName 
}: HospitalityPackageDialogProps) {
  const { createHospitalityPackage, loading } = useWorkflow();
  const { toast } = useToast();
  
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'speaker' | 'vip'>('standard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createHospitalityPackage(guestId, selectedPackage);

    if (result.success) {
      const packageInfo = packageOptions[selectedPackage];
      toast({
        title: 'Hospitality Package Created!',
        description: `${packageInfo.name} has been created for ${guestName} with ${result.data?.length} services.`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'Package Creation Failed',
        description: result.error || 'Failed to create hospitality package',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Hospitality Package</DialogTitle>
          <DialogDescription>
            Select a hospitality package for {guestName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <RadioGroup
              value={selectedPackage}
              onValueChange={(value) => setSelectedPackage(value as any)}
              className="space-y-4"
            >
              {Object.entries(packageOptions).map(([key, pkg]) => (
                <div key={key} className="relative">
                  <RadioGroupItem
                    value={key}
                    id={key}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={key}
                    className="cursor-pointer"
                  >
                    <Card className="peer-checked:ring-2 peer-checked:ring-primary transition-all hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            <CardDescription>{pkg.description}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-lg font-bold">
                            ${pkg.price}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {pkg.services.map((service, index) => {
                            const IconComponent = service.icon;
                            return (
                              <div key={index} className="flex items-start gap-3">
                                <div className="mt-1">
                                  <IconComponent className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Package Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Package Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Guest:</span>
                <span className="font-medium">{guestName}</span>
              </div>
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-medium">{packageOptions[selectedPackage].name}</span>
              </div>
              <div className="flex justify-between">
                <span>Services:</span>
                <span className="font-medium">{packageOptions[selectedPackage].services.length}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total Cost:</span>
                <span>${packageOptions[selectedPackage].price}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Package...' : 'Create Package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}