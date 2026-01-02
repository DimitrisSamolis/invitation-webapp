export interface Invitation {
  _id?: string;
  title: string;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'party' | 'other';
  eventDate: Date;
  eventTime: string;
  venue: string;
  venueAddress: string;
  venueMapUrl?: string;
  description: string;
  theme: string;
  selectedThemeId?: string;
  spotifyPlaylistUrl?: string;
  customStyles?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    backgroundImage?: string;
    animation?: 'confetti' | 'hearts' | 'balloons' | 'sparkles' | 'stars' | 'fireworks' | 'none';
  };
  hostName: string;
  hostContact?: string;
  hostEmail?: string;
  rsvpDeadline?: Date;
  maxGuests?: number;
  dressCode?: string;
  additionalInfo?: string;
  isActive: boolean;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Guest {
  _id?: string;
  invitationId: string | { _id: string; title: string };
  name: string;
  email: string;
  phone?: string;
  numberOfGuests: number;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  dietaryRestrictions?: string;
  message?: string;
  respondedAt?: Date;
  createdAt?: Date;
}

export interface Theme {
  _id?: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundImage?: string;
  isDefault: boolean;
  createdAt?: Date;
}

export interface User {
  _id?: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalInvitations: number;
  activeInvitations: number;
  totalGuests: number;
  confirmedGuests: number;
  pendingResponses: number;
  declinedGuests: number;
}
