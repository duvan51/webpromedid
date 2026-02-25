
// Add missing React import to resolve the 'Cannot find namespace React' error.
import React from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
}

export interface Location {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
  slots_total: number;
  slots_booked: number;
  banner_url?: string;
  video_url?: string;
  map_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
}

export interface Treatment {
  title: string;
  description: string;
}