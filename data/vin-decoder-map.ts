// Maps for decoding Tesla VINs

export const WMI_MAP: Record<string, string> = {
  '5YJ': 'Tesla, Inc. Passenger Car (Fremont/Austin, USA)',
  '7SA': 'Tesla, Inc. Multipurpose Passenger Vehicle (Austin, USA)',
  '7G2': 'Tesla, Inc. Truck (Reno, USA)',
  'LRW': 'Tesla, Inc. (Shanghai, China)',
  'XP7': 'Tesla, Inc. (Berlin, Germany)',
};

export const MODEL_MAP: Record<string, string> = {
  'S': 'Model S',
  '3': 'Model 3',
  'X': 'Model X',
  'Y': 'Model Y',
  'C': 'Cybertruck',
  'R': 'Roadster',
  'T': 'Semi',
};

export const BODY_TYPE_MAP: Record<string, Record<string, string>> = {
  'S': { 'A': 'Hatchback 5-door, Left Hand Drive' },
  '3': { 'E': 'Sedan 4-door, Left Hand Drive' },
  'X': { 'C': 'Class E MPV, 5-door, Left Hand Drive' },
  'Y': { 'G': 'Class D MPV, 5-door, Left Hand Drive' },
  'T': { 
    'A': 'Day Cab - Short',
    'B': 'Day Cab - Long'
  }
};

export const RESTRAINT_SYSTEM_MAP: Record<string, Record<string, string>> = {
  'S': {
    '1': 'Manual Type 2 Seatbelts with front airbags, PODS, side inflatable restraints, knee airbags'
  },
  '3': {
    '1': 'Manual Type 2 Seatbelts with front airbags, PODS, side inflatable restraints, knee airbags'
  },
  'X': {
    'A': 'Type 2 seatbelts (FR, SR*3, TR*2) with front airbags, PODS, side/knee airbags',
    'B': 'Type 2 seatbelts (FR, SR*2, TR*2) with front airbags, PODS, side/knee airbags',
    'D': 'Type 2 seatbelts (FR, SR*3) with front airbags, PODS, side/knee airbags'
  },
  'Y': {
    'A': 'Type 2 seatbelts (FR, SR*3, TR*2) with front airbags, PODS, side/knee airbags',
    'B': 'Type 2 seatbelts (FR, SR*2, TR*2) with front airbags, PODS, side/knee airbags',
    'D': 'Type 2 seatbelts (FR, SR*3) with front airbags, PODS, side/knee airbags'
  }
};

export const FUEL_TYPE_MAP: Record<string, string> = {
    'E': 'Electric'
};

// Map based on documentation and observed VINs
export const DRIVE_UNIT_MAP: Record<string, Record<string, string>> = {
  'S': { // Model S
    '1': 'Single Motor',
    '2': 'Dual Motor',
    '3': 'Performance Dual Motor',
    '4': 'Performance Dual Motor',
    '5': 'Dual Motor (P2)', // 2023+
    '6': 'Plaid (Tri-Motor, P2)', // 2023+
    'C': 'Base (Dual Motor)', // Legacy Refresh
    'D': 'Plaid (Tri-Motor)', // Legacy Refresh
  },
  'X': { // Model X
    '2': 'Dual Motor',
    '4': 'Performance Dual Motor',
    '5': 'Dual Motor (P2)', // 2023+
    '6': 'Plaid (Tri-Motor, P2)', // 2023+
    'C': 'Base (Dual Motor)', // Legacy Refresh
    'D': 'Plaid (Tri-Motor)', // Legacy Refresh
  },
  '3': { // Model 3
    'A': 'Single Motor – Standard / Performance', // 2023+
    'B': 'Dual Motor – Standard', // 2023+
    'C': 'Dual Motor – Performance', // 2023+
    'F': 'Long Range AWD',
    'J': 'Standard Range RWD (LFP)',
    'R': 'Long Range RWD',
    'G': 'Standard Range RWD',
  },
  'Y': { // Model Y
    'D': 'Single Motor – Standard / Performance', // 2023+
    'E': 'Dual Motor – Standard', // 2023+ / 2026+
    'F': 'Dual Motor – Performance', // 2023+
    'A': 'Standard Range RWD',
    'B': 'Long Range AWD',
    'C': 'Performance AWD',
    'G': 'Standard Range RWD',
    'H': 'Long Range RWD',
  },
  'C': { // Cybertruck
      'D': 'Dual Motor',
      'E': 'Tri Motor (Cyberbeast)',
  },
  'T': { // Semi
      'B': 'Dual Drive Rear Axle, Air Brakes'
  }
};

export const YEAR_MAP: Record<string, number> = {
  'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017,
  'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
  'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026,
};

export const PLANT_MAP: Record<string, string> = {
  'F': 'Fremont, CA, USA',
  'A': 'Austin, TX, USA',
  'C': 'Shanghai, China',
  'B': 'Berlin, Germany',
  'P': 'Palo Alto, CA, USA (Roadster)',
  'N': 'Reno, NV, USA (Semi)',
};
