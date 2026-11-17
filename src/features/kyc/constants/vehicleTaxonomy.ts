export interface VehicleTypeItem {
  id: string;
  name: string;
  covCode: string; // Official RTO COV Code (e.g. "CEV", "HGV / HGMV", "HGV / CEV")
  covDescription: string;
  category?: string;
}

export interface VehicleCategoryItem {
  id: string;
  name: string;
  fullName: string;
  covCode: string;
  types: VehicleTypeItem[];
}

/**
 * 13 Heavy Equipment Vehicle Types mapped strictly to statutory RTO COV (Class of Vehicle) codes.
 * Generator has been removed as it is non-registered stationary / trailer equipment without a standard RTO COV code.
 */
export const ALL_13_VEHICLE_TYPES: VehicleTypeItem[] = [
  // 1. CEV - Construction Equipment Vehicle (11 Fleet Types)
  {
    id: 'mini-excavator',
    name: 'Mini Excavator',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'small-excavator',
    name: 'Small Excavator',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'medium-excavator',
    name: 'Medium Excavator',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'backhoe',
    name: 'Backhoe (JCB 3DX)',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'wheel-loader',
    name: 'Wheel Loader',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'hydra-crane',
    name: 'Hydra Crane',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle / Mobile Crane',
  },
  {
    id: 'self-loading-mixer',
    name: 'Self-Loading Mixer',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'concrete-pump',
    name: 'Concrete Pump',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle',
  },
  {
    id: 'soil-compactor',
    name: 'Soil Compactor',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle / Road Roller',
  },
  {
    id: 'tandem-roller',
    name: 'Tandem Roller',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle / Road Roller',
  },
  {
    id: 'pneumatic-roller',
    name: 'Pneumatic Roller',
    covCode: 'CEV',
    covDescription: 'Construction Equipment Vehicle / Road Roller',
  },

  // 2. Heavy Goods Commercial Vehicles (2 Fleet Types)
  {
    id: 'tipper',
    name: 'Tipper Dump Truck',
    covCode: 'HGV / HGMV',
    covDescription: 'Heavy Goods Commercial Vehicle (HGV/HGMV)',
  },
  {
    id: 'transit-mixer',
    name: 'Transit Mixer',
    covCode: 'HGV / CEV',
    covDescription: 'Heavy Commercial Goods Vehicle (HGV/CEV)',
  },
];

/**
 * Backward compatibility alias
 */
export const ALL_14_VEHICLE_TYPES = ALL_13_VEHICLE_TYPES;

export interface FlatVehicleTypeOption extends VehicleTypeItem {
  category: string;
  categoryFullName: string;
  rtoClass: string;
  rtoClassDescription: string;
}

/**
 * Flattened options with RTO COV mappings
 */
export const VEHICLE_OPTIONS: FlatVehicleTypeOption[] = ALL_13_VEHICLE_TYPES.map((t) => ({
  ...t,
  category: t.covCode,
  categoryFullName: t.covDescription,
  rtoClass: t.covCode,
  rtoClassDescription: t.covDescription,
}));

/**
 * RTO COV Groups for filter chips
 */
export const RTO_COV_GROUPS = [
  { id: 'ALL', name: 'All (13)', code: 'ALL' },
  { id: 'CEV', name: 'CEV (11)', code: 'CEV' },
  { id: 'HGV', name: 'HGV / HGMV (2)', code: 'HGV' },
];

/**
 * Grouped categories for backward compatibility
 */
export const VEHICLE_CATEGORIES: VehicleCategoryItem[] = [
  {
    id: 'cov-cev',
    name: 'CEV',
    fullName: 'Construction Equipment Vehicle (CEV)',
    covCode: 'CEV',
    types: ALL_13_VEHICLE_TYPES.filter((t) => t.covCode === 'CEV'),
  },
  {
    id: 'cov-hgv',
    name: 'HGV / HGMV',
    fullName: 'Heavy Goods Commercial Vehicle (HGV/HGMV)',
    covCode: 'HGV',
    types: ALL_13_VEHICLE_TYPES.filter((t) => t.covCode.includes('HGV')),
  },
];

/**
 * Helper to find RTO COV Code for a given vehicle type name
 */
export function findRtoClassForType(typeName: string): string | null {
  if (!typeName) return null;
  const lower = typeName.toLowerCase();
  const found = ALL_13_VEHICLE_TYPES.find(
    (t) =>
      t.name.toLowerCase() === lower ||
      lower.includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(lower)
  );
  return found ? found.covCode : 'CEV';
}

/**
 * Helper to find exact Surepass / RTO COV Category code for a given vehicle type name
 */
export function findCategoryForType(typeName: string): string {
  if (!typeName) return 'CEV';
  const lower = typeName.toLowerCase();
  const found = ALL_13_VEHICLE_TYPES.find(
    (t) =>
      t.name.toLowerCase() === lower ||
      lower.includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(lower)
  );
  if (found) return found.covCode;
  if (lower.includes('truck') || lower.includes('tipper') || lower.includes('dumper')) {
    return 'HGV / HGMV';
  }
  return 'CEV';
}
