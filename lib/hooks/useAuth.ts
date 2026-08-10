/**
 * Authentication Hooks
 * 
 * Hooks for managing user authentication and authorization
 */

'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { getUserRepository } from '@/lib/repositories';
import type { User, UserRole, DataScope } from '@/types/entities';
import { getUserScope } from '@/types/entities';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  getScope: () => DataScope;
  hasPermission: (permission: string) => boolean;
  canAccessLocation: (locationId: string) => boolean;
  canAccessCompany: (companyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication hook
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication provider implementation
 */
export function useAuthProvider(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('hospitality-admin-user');
        if (savedUser) {
          const user: User = JSON.parse(savedUser);
          
          // Verify user still exists in database
          const userRepository = getUserRepository();
          const userResponse = await userRepository.getById(user.id);
          if (userResponse.success && userResponse.data) {
            setState({
              user: userResponse.data,
              loading: false,
              error: null,
            });
          } else {
            localStorage.removeItem('hospitality-admin-user');
            setState({
              user: null,
              loading: false,
              error: null,
            });
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // In a real app, this would verify credentials against an API
      // For now, we'll just check if the user exists
      const userRepository = getUserRepository();
      const userResponse = await userRepository.getByEmail(email);
      
      if (userResponse.success && userResponse.data) {
        const user = userResponse.data;
        
        // Store user in localStorage
        localStorage.setItem('hospitality-admin-user', JSON.stringify(user));
        
        setState({
          user,
          loading: false,
          error: null,
        });
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Invalid email or password',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Login failed. Please try again.',
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hospitality-admin-user');
    setState({
      user: null,
      loading: false,
      error: null,
    });
  };

  const setCurrentUser = (user: User) => {
    localStorage.setItem('hospitality-admin-user', JSON.stringify(user));
    setState(prev => ({
      ...prev,
      user,
    }));
  };

  const getScope = (): DataScope => {
    if (!state.user) {
      return { role: 'viewer', companyIds: [], locationIds: [] };
    }
    return getUserScope(state.user);
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    const permissions = getRolePermissions(state.user.role);
    return permissions.includes(permission) || permissions.includes('*');
  };

  const canAccessLocation = (locationId: string): boolean => {
    if (!state.user) return false;

    const scope = getScope();
    
    // Reseller admin can access everything
    if (scope.role === 'reseller-admin') return true;
    
    // Location staff can only access their own location
    if (scope.locationIds?.includes(locationId)) return true;
    
    return false;
  };

  const canAccessCompany = (companyId: string): boolean => {
    if (!state.user) return false;

    const scope = getScope();
    
    // Reseller admin can access everything
    if (scope.role === 'reseller-admin') return true;
    
    // Company admin and location staff can access their company
    if (scope.companyIds?.includes(companyId)) return true;
    
    return false;
  };

  return {
    ...state,
    login,
    logout,
    setCurrentUser,
    getScope,
    hasPermission,
    canAccessLocation,
    canAccessCompany,
  };
}

/**
 * Get permissions for a user role
 */
function getRolePermissions(role: UserRole): string[] {
  switch (role) {
    case 'reseller-admin':
      return ['*']; // All permissions
    
    case 'company-admin':
      return [
        'company.read',
        'company.update',
        'location.create',
        'location.read',
        'location.update',
        'location.delete',
        'customer.create',
        'customer.read',
        'customer.update',
        'customer.delete',
        'staff.create',
        'staff.read',
        'staff.update',
        'staff.delete',
        'appointment.create',
        'appointment.read',
        'appointment.update',
        'appointment.cancel',
        'room.create',
        'room.read',
        'room.update',
        'room.delete',
        'service.create',
        'service.read',
        'service.update',
        'service.delete',
      ];
    
    case 'location-staff':
      return [
        'customer.create',
        'customer.read',
        'customer.update',
        'appointment.create',
        'appointment.read',
        'appointment.update',
        'appointment.cancel',
        'appointment.checkin',
        'appointment.complete',
        'staff.read',
        'room.read',
        'service.read',
      ];
    
    case 'viewer':
      return [
        'company.read',
        'location.read',
        'customer.read',
        'staff.read',
        'appointment.read',
        'room.read',
        'service.read',
      ];
    
    default:
      return [];
  }
}

/**
 * Hook for role-based access control
 */
export function usePermissions() {
  const { hasPermission, canAccessLocation, canAccessCompany, getScope } = useAuth();

  return {
    hasPermission,
    canAccessLocation,
    canAccessCompany,
    getScope,
    can: {
      createCompany: () => hasPermission('company.create'),
      updateCompany: () => hasPermission('company.update'),
      deleteCompany: () => hasPermission('company.delete'),
      
      createLocation: () => hasPermission('location.create'),
      updateLocation: () => hasPermission('location.update'),
      deleteLocation: () => hasPermission('location.delete'),
      
      createCustomer: () => hasPermission('customer.create'),
      updateCustomer: () => hasPermission('customer.update'),
      deleteCustomer: () => hasPermission('customer.delete'),
      
      createStaff: () => hasPermission('staff.create'),
      updateStaff: () => hasPermission('staff.update'),
      deleteStaff: () => hasPermission('staff.delete'),
      
      createAppointment: () => hasPermission('appointment.create'),
      updateAppointment: () => hasPermission('appointment.update'),
      cancelAppointment: () => hasPermission('appointment.cancel'),
      checkInAppointment: () => hasPermission('appointment.checkin'),
      completeAppointment: () => hasPermission('appointment.complete'),
      
      createRoom: () => hasPermission('room.create'),
      updateRoom: () => hasPermission('room.update'),
      deleteRoom: () => hasPermission('room.delete'),
      
      createService: () => hasPermission('service.create'),
      updateService: () => hasPermission('service.update'),
      deleteService: () => hasPermission('service.delete'),
    },
  };
}

/**
 * Hook for getting scoped data
 */
export function useScopedData() {
  const { getScope } = useAuth();

  const scope = getScope();

  return {
    scope,
    getScopedFilter: (baseFilter: any = {}) => {
      const filter = { ...baseFilter };

      if (scope.locationIds?.length) {
        filter.locationId = scope.locationIds[0]; // For single location users
      } else if (scope.companyIds?.length) {
        // For company admins, we might want to include all their locations
        // This would require additional logic to fetch locations by company
      }

      return filter;
    },
    isLocationScoped: () => !!scope.locationIds?.length,
    isCompanyScoped: () => !!scope.companyIds?.length && !scope.locationIds?.length,
    isResellerAdmin: () => scope.role === 'reseller-admin',
  };
}

export { AuthContext };