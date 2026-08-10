/**
 * Repository Layer Exports
 * 
 * Centralized exports for all repositories
 * Uses lazy initialization to prevent server-side instantiation issues
 */

export { BaseRepository } from './base.repository';

// Lazy getters to avoid instantiating repositories on module load
let _companyRepository: any;
let _locationRepository: any;
let _customerRepository: any;
let _staffRepository: any;
let _roomRepository: any;
let _serviceRepository: any;
let _appointmentRepository: any;
let _userRepository: any;

export const getCompanyRepository = () => {
  if (!_companyRepository) {
    const { companyRepository } = require('./company.repository');
    _companyRepository = companyRepository;
  }
  return _companyRepository;
};

export const getLocationRepository = () => {
  if (!_locationRepository) {
    const { locationRepository } = require('./location.repository');
    _locationRepository = locationRepository;
  }
  return _locationRepository;
};

export const getCustomerRepository = () => {
  if (!_customerRepository) {
    const { customerRepository } = require('./customer.repository');
    _customerRepository = customerRepository;
  }
  return _customerRepository;
};

export const getStaffRepository = () => {
  if (!_staffRepository) {
    const { staffRepository } = require('./staff.repository');
    _staffRepository = staffRepository;
  }
  return _staffRepository;
};

export const getRoomRepository = () => {
  if (!_roomRepository) {
    const { roomRepository } = require('./room.repository');
    _roomRepository = roomRepository;
  }
  return _roomRepository;
};

export const getServiceRepository = () => {
  if (!_serviceRepository) {
    const { serviceRepository } = require('./service.repository');
    _serviceRepository = serviceRepository;
  }
  return _serviceRepository;
};

export const getAppointmentRepository = () => {
  if (!_appointmentRepository) {
    const { appointmentRepository } = require('./appointment.repository');
    _appointmentRepository = appointmentRepository;
  }
  return _appointmentRepository;
};

export const getUserRepository = () => {
  if (!_userRepository) {
    const { userRepository } = require('./user.repository');
    _userRepository = userRepository;
  }
  return _userRepository;
};

// Re-export repository instances for easier access (lazy initialized)
export const repositories = {
  get company() { return getCompanyRepository(); },
  get location() { return getLocationRepository(); },
  get customer() { return getCustomerRepository(); },
  get staff() { return getStaffRepository(); },
  get room() { return getRoomRepository(); },
  get service() { return getServiceRepository(); },
  get appointment() { return getAppointmentRepository(); },
  get user() { return getUserRepository(); },
} as const;