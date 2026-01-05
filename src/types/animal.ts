export type AnimalCategory = 'livestock' | 'poultry' | 'aquatic' | 'other';

export type TrackingFeature = 
  | 'feed'
  | 'health'
  | 'reproduction'
  | 'genetics'
  | 'inventory'
  | 'production';

export interface AnimalTerminology {
  youngName: string;
  maleName: string;
  femaleName: string;
  birthEventName: string;
}

export interface Farm {
  id: string;
  name: string;
  location?: string;
  createdAt: Date;
}

export interface AnimalType {
  id: string;
  farmId: string;
  name: string;
  category: AnimalCategory;
  icon: string;
  measurementUnit: string;
  features: TrackingFeature[];
  terminology: AnimalTerminology;
  createdAt: Date;
  color: string;
}

export interface AnimalRecord {
  id: string;
  animalTypeId: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: Date;
  weight: number;
  status: 'healthy' | 'sick' | 'quarantine' | 'sold' | 'deceased';
  notes?: string;
}

export interface DashboardStats {
  totalCount: number;
  healthyCount: number;
  sickCount: number;
  productionToday: number;
  alertsCount: number;
}

export const CATEGORY_OPTIONS: { value: AnimalCategory; label: string; icon: string }[] = [
  { value: 'livestock', label: 'Livestock', icon: '🐄' },
  { value: 'poultry', label: 'Poultry', icon: '🐔' },
  { value: 'aquatic', label: 'Aquatic', icon: '🐟' },
  { value: 'other', label: 'Other', icon: '🦎' },
];

export const FEATURE_OPTIONS: { value: TrackingFeature; label: string; description: string; icon: string }[] = [
  { value: 'feed', label: 'Feed Management', description: 'Track feeding schedules and consumption', icon: '🌾' },
  { value: 'health', label: 'Health & Vaccinations', description: 'Monitor health records and vaccinations', icon: '💊' },
  { value: 'reproduction', label: 'Reproduction', description: 'Track breeding and birth cycles', icon: '🍼' },
  { value: 'genetics', label: 'Genetics & Breeding', description: 'Manage genetic lines and pedigrees', icon: '🧬' },
  { value: 'inventory', label: 'Inventory & Sales', description: 'Track stock and sales records', icon: '📦' },
  { value: 'production', label: 'Production', description: 'Monitor outputs like milk, eggs, meat', icon: '📊' },
];

export const ANIMAL_ICONS = [
  '🐰', '🐄', '🐑', '🐖', '🐔', '🦆', '🐟', '🦐',
  '🐐', '🦙', '🐎', '🐓', '🦃', '🐇', '🦌', '🐂',
];

export const ANIMAL_COLORS = [
  '#2D5A45', '#4A7C59', '#8B4513', '#CD853F',
  '#708090', '#2F4F4F', '#556B2F', '#6B8E23',
  '#8FBC8F', '#3CB371', '#20B2AA', '#5F9EA0',
];

export const MEASUREMENT_UNITS = ['kg', 'lbs', 'liters', 'gallons', 'pieces', 'units'];