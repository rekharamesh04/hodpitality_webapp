/**
 * Service Integration Layer
 * All services call the real AWS Lambda backend.
 * Base URL and API key are configured via .env.local (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_LAMBDA_API_KEY).
 */

export { authService }        from './auth.service';
export { guestService }       from './guest.service';
export { customerService }    from './customer.service';
export { checkInService }     from './checkin.service';
export { eventService }       from './event.service';
export { venueService }       from './venue.service';
export { staffService }       from './staff.service';
export { appointmentService } from './appointment.service';
export { calendarService }    from './calendar.service';
export { hospitalityService } from './hospitality.service';
export { registrationService } from './registration.service';
export { reportService }      from './report.service';
export { notificationService } from './notification.service';
export { settingsService }    from './settings.service';
export { resellerService }    from './reseller.service';
export { companyService }     from './company.service';
export { paymentService }     from './payment.service';
export { uploadService }      from './upload.service';

export { workflowService } from './workflowService';

export type * from '@/types';