export type DogSex = 'macho' | 'femea';

export interface Dog {
  id: number;
  name: string;
  breed: string;
  sex: DogSex;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface DogInput {
  name: string;
  breed: string;
  sex: DogSex;
}

export interface DogListResponse {
  count: number;
  rows: Dog[];
}

export interface DogWalkLocation {
  id: number;
  title: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface DogWalkLocationInput {
  title: string;
  address: string;
}

export interface DogWalkLocationListResponse {
  count: number;
  rows: DogWalkLocation[];
}

export interface DogWalk {
  id: number;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  locationId: number;
  location?: DogWalkLocation | null;
  dogs?: Dog[];
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface DogWalkInput {
  dogIds: number[];
  locationId: number;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface DogWalkListResponse {
  count: number;
  rows: DogWalk[];
}

export interface DogWeight {
  id: number;
  dogId: number;
  value: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface DogWeightInput {
  dogId: number;
  value: number;
  date: string;
}

export interface DogWeightListResponse {
  count: number;
  rows: DogWeight[];
}

/** Contagem por cão ou por local (dashboard). */
export interface DogDashboardCount {
  id: number;
  label: string;
  count: number;
}

export interface DogDashboardDog {
  id: number;
  name: string;
  latestWeight: number | null;
  weighedThisMonth: boolean;
}

export interface DogDashboard {
  totalWalks: number;
  walksThisWeek: number;
  walksThisMonth: number;
  avgWalksPerWeek: number;
  avgDurationSeconds: number | null;
  lastWalkAt: string | null;
  perDog: DogDashboardCount[];
  perLocation: DogDashboardCount[];
  dogs: DogDashboardDog[];
  needsWeighing: boolean;
}
