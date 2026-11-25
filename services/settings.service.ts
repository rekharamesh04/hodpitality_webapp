import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { User, Settings } from '@/types';

/** True `isDefault` means never set: the backend then uses Asia/Kolkata. */
export interface OrgTimezone {
  timezone: string;
  isDefault: boolean;
}

/**
 * One approved network: a public IP address or range in CIDR form (`cidr`, "203.0.113.7/32"), or a
 * dynamic-DNS hostname (`host`, "clinic.ddns.net") for a clinic whose address changes. Exactly one is set.
 */
export interface ApprovedNetwork {
  cidr?: string;
  host?: string;
  label: string;
}

/** A desk sign-in the server refused, kept two weeks so an administrator can approve the address. */
export interface NetworkRefusal {
  ip: string;
  email: string;
  role: string;
  count: number;
  firstAt: string;
  lastAt: string;
  /** "network", or why the location check refused ("location_far", "location_denied", …). */
  reason?: string;
  /** For a location refusal: the nearest clinic, and how far away (metres). */
  site?: string;
  distance?: number | null;
}

/**
 * One clinic. Staff get in on its own networks, or — when it has a pin — on a device whose
 * location is within `radius` metres of it (a phone on mobile data, whose address changes).
 */
export interface ClinicSite {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  radius?: number;
  networks: ApprovedNetwork[];
}

/** Someone who may sign in only at some clinics. Everyone else may use every clinic. */
export interface SiteAssignment {
  email: string;
  sites: string[];
}

/** An address staff used while their location placed them at a clinic. Never added by itself. */
export interface NetworkSuggestion {
  ip: string;
  siteId: string;
  siteName: string;
  people: string[];
  count: number;
  firstAt: string;
  lastAt: string;
}

/** Approved networks for the organisation. `yourAddress` is the address the server sees now. */
export interface NetworkSettings {
  mode: 'on' | 'off';
  networks: ApprovedNetwork[];
  /** What each listed hostname points at right now. */
  hostAddresses?: Record<string, string[]>;
  /** People (emails) who may sign in from anywhere. */
  exempt?: string[];
  refusals?: NetworkRefusal[];
  sites?: ClinicSite[];
  assignments?: SiteAssignment[];
  suggestions?: NetworkSuggestion[];
  yourAddress: string;
  yourAddressAllowed: boolean;
  /** Your address is on the every-clinic list. */
  yourAddressEverywhere?: boolean;
  /** The clinics whose own lists include your address. */
  yourAddressSites?: string[];
  limits?: { minRadius: number; maxRadius: number; defaultRadius: number; maxSites: number };
  appliesTo: string[];
  updated_at?: string;
  updated_by?: string;
}

export interface NetworkSettingsInput {
  mode: 'on' | 'off';
  networks: ApprovedNetwork[];
  exempt?: string[];
  sites?: ClinicSite[];
  assignments?: SiteAssignment[];
}

export const settingsService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.SETTINGS.PROFILE);
    return data;
  },

  async updateProfile(input: Partial<User>): Promise<User> {
    const { data } = await api.put<User>(API_ENDPOINTS.SETTINGS.PROFILE, input);
    return data;
  },

  async updateOrganisation(input: Partial<Settings['organization']>): Promise<Settings['organization']> {
    const { data } = await api.put<Settings['organization']>(API_ENDPOINTS.SETTINGS.ORGANISATION, input);
    return data;
  },

  async updateNotificationPreferences(prefs: Partial<Settings['notifications']>): Promise<Settings['notifications']> {
    const { data } = await api.put<Settings['notifications']>(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, prefs);
    return data;
  },

  async getTimezone(): Promise<OrgTimezone> {
    const { data } = await api.get<OrgTimezone>(API_ENDPOINTS.SETTINGS.TIMEZONE);
    return data;
  },

  async updateTimezone(timezone: string): Promise<OrgTimezone> {
    const { data } = await api.put<OrgTimezone>(API_ENDPOINTS.SETTINGS.TIMEZONE, { timezone });
    return data;
  },

  async getNetworkSettings(): Promise<NetworkSettings> {
    const { data } = await api.get<NetworkSettings>(API_ENDPOINTS.SETTINGS.NETWORK);
    return data;
  },

  async updateNetworkSettings(input: NetworkSettingsInput): Promise<NetworkSettings> {
    const { data } = await api.put<NetworkSettings>(API_ENDPOINTS.SETTINGS.NETWORK, input);
    return data;
  },

  /** Forget one refused address (`ip`), or all of them. */
  async dismissNetworkRefusals(ip?: string): Promise<NetworkSettings> {
    const { data } = await api.delete<NetworkSettings>(`${API_ENDPOINTS.SETTINGS.NETWORK}/refusals`, {
      params: ip ? { ip } : undefined,
    });
    return data;
  },

  /** Forget a new address seen at a clinic (`ip` + `site`), or all of them. */
  async dismissNetworkSuggestions(ip?: string, site?: string): Promise<NetworkSettings> {
    const { data } = await api.delete<NetworkSettings>(`${API_ENDPOINTS.SETTINGS.NETWORK}/suggestions`, {
      params: ip ? { ip, ...(site ? { site } : {}) } : undefined,
    });
    return data;
  },

  /** `mfaCode` is needed once two-factor is on: the backend signs in again to change the password. */
  async changePassword(payload: { currentPassword: string; newPassword: string; mfaCode?: string }): Promise<{ message: string }> {
    // Sent like every other request. The backend checks the current password for the signed-in
    // email and gets the access token Cognito's change_password needs itself — login never hands
    // one out, so asking for it here always failed.
    const { data } = await api.put<{ message: string }>(API_ENDPOINTS.SETTINGS.PASSWORD, payload);
    return data;
  },
};
