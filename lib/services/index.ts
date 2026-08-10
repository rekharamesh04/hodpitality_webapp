/**
 * Service Layer Exports
 * 
 * Centralized exports for all services
 */

import { companyService } from './company.service';
import { locationService } from './location.service';
import { customerService } from './customer.service';
import { staffService } from './staff.service';
import { roomService } from './room.service';
import { serviceService } from './service.service';
import { appointmentService } from './appointment.service';
import { dashboardService } from './dashboard.service';

export { companyService, locationService, customerService, staffService, roomService, serviceService, appointmentService, dashboardService };

// Re-export service instances for easier access
export const services = {
  company: companyService,
  location: locationService,
  customer: customerService,
  staff: staffService,
  room: roomService,
  service: serviceService,
  appointment: appointmentService,
  dashboard: dashboardService,
} as const;