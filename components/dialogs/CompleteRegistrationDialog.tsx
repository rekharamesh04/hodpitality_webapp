'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkflow } from '@/hooks/useWorkflow';
import { QUERY_KEYS } from '@/constants';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { eventService } from '@/services/event.service';
import type { Event } from '@/types';

interface CompleteRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HospitalityRequest {
  type: 'Hotel' | 'Transport' | 'Meal' | 'Airport Pickup' | 'Special Request';
  description: string;
  serviceDate: string;
  cost?: number;
}

export function CompleteRegistrationDialog({ open, onOpenChange }: CompleteRegistrationDialogProps) {
  const { completeRegistration, loading } = useWorkflow();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    if (!open) return;
    eventService.getEvents().then(setEvents).catch(() => {});
  }, [open]);
  
  const emptyForm = {
    guestName: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    category: 'Delegate' as 'VIP' | 'Speaker' | 'Delegate' | 'Staff' | 'Press',
    eventId: '',
    eventTitle: '',
    paymentAmount: 0,
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const [hospitalityRequests, setHospitalityRequests] = useState<HospitalityRequest[]>([]);
  const [includePayment, setIncludePayment] = useState(false);

  const addHospitalityRequest = () => {
    setHospitalityRequests([...hospitalityRequests, {
      type: 'Hotel',
      description: '',
      serviceDate: new Date().toISOString().split('T')[0],
      cost: 0,
    }]);
  };

  const removeHospitalityRequest = (index: number) => {
    setHospitalityRequests(hospitalityRequests.filter((_, i) => i !== index));
  };

  const updateHospitalityRequest = (index: number, field: keyof HospitalityRequest, value: any) => {
    const updated = [...hospitalityRequests];
    updated[index] = { ...updated[index], [field]: value };
    setHospitalityRequests(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await completeRegistration({
      ...formData,
      paymentAmount: includePayment ? formData.paymentAmount : undefined,
      hospitalityRequests: hospitalityRequests.length > 0 ? hospitalityRequests : undefined,
    });

    if (result.success) {
      // completeRegistration() calls the backend directly (via workflowService), bypassing
      // TanStack Query entirely — so the Registrations/Guests lists have no idea new data
      // exists until something tells their queries to refetch. Without this, the new
      // registration only ever shows up after a full page reload.
      qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.HOSPITALITY });
      toast({
        title: 'Registration Complete!',
        description: `${formData.guestName} has been successfully registered with ${hospitalityRequests.length} hospitality services.`,
      });
      onOpenChange(false);
      // Reset form
      setFormData(emptyForm);
      setHospitalityRequests([]);
      setIncludePayment(false);
    } else {
      toast({
        title: 'Registration Failed',
        description: result.error || 'Failed to complete registration',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
          <DialogDescription>
            Register a guest with event enrollment and hospitality services
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Guest Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="guestName">Full Name *</Label>
                  <Input
                    id="guestName"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Speaker">Speaker</SelectItem>
                      <SelectItem value="Delegate">Delegate</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Press">Press</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="eventTitle">Event *</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(val) => {
                    const ev = events.find((e) => (e.id ?? e.PK?.replace('EVENT#', '')) === val);
                    setFormData({ ...formData, eventId: val, eventTitle: ev?.title ?? val });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((ev) => {
                      const id = ev.id ?? ev.PK?.replace('EVENT#', '') ?? '';
                      return (
                        <SelectItem key={id} value={id}>
                          {ev.title}
                        </SelectItem>
                      );
                    })}
                    {events.length === 0 && (
                      <SelectItem value="" disabled>No events found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePayment"
                  checked={includePayment}
                  onCheckedChange={(checked) => setIncludePayment(checked as boolean)}
                />
                <Label htmlFor="includePayment" className="cursor-pointer">
                  Include payment information
                </Label>
              </div>
              
              {includePayment && (
                <div className="grid gap-2">
                  <Label htmlFor="paymentAmount">Registration Fee ($)</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* Hospitality Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Hospitality Services</h3>
                <Button type="button" variant="outline" size="sm" onClick={addHospitalityRequest}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
              
              {hospitalityRequests.map((request, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Service {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHospitalityRequest(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Service Type</Label>
                      <Select
                        value={request.type}
                        onValueChange={(value) => updateHospitalityRequest(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hotel">Hotel</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Meal">Meal</SelectItem>
                          <SelectItem value="Airport Pickup">Airport Pickup</SelectItem>
                          <SelectItem value="Special Request">Special Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Cost ($)</Label>
                      <Input
                        type="number"
                        value={request.cost || ''}
                        onChange={(e) => updateHospitalityRequest(index, 'cost', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={request.description}
                      onChange={(e) => updateHospitalityRequest(index, 'description', e.target.value)}
                      placeholder="Describe the service details..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Service Date</Label>
                    <Input
                      type="date"
                      value={request.serviceDate}
                      onChange={(e) => updateHospitalityRequest(index, 'serviceDate', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}