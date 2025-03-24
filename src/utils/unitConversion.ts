// Basic unit conversion utility for common kitchen units

type UnitCategory = 'weight' | 'volume' | 'count' | 'length';

interface UnitDefinition {
  name: string;
  abbreviation: string;
  category: UnitCategory;
  baseConversion: number; // Conversion to base unit
}

// Base units: gram, milliliter, count, millimeter
const unitDefinitions: Record<string, UnitDefinition> = {
  // Weight units
  'gram': { name: 'Gram', abbreviation: 'g', category: 'weight', baseConversion: 1 },
  'kilogram': { name: 'Kilogram', abbreviation: 'kg', category: 'weight', baseConversion: 1000 },
  'ounce': { name: 'Ounce', abbreviation: 'oz', category: 'weight', baseConversion: 28.35 },
  'pound': { name: 'Pound', abbreviation: 'lb', category: 'weight', baseConversion: 453.59 },

  // Volume units
  'milliliter': { name: 'Milliliter', abbreviation: 'ml', category: 'volume', baseConversion: 1 },
  'liter': { name: 'Liter', abbreviation: 'l', category: 'volume', baseConversion: 1000 },
  'teaspoon': { name: 'Teaspoon', abbreviation: 'tsp', category: 'volume', baseConversion: 4.93 },
  'tablespoon': { name: 'Tablespoon', abbreviation: 'tbsp', category: 'volume', baseConversion: 14.79 },
  'fluid_ounce': { name: 'Fluid Ounce', abbreviation: 'fl oz', category: 'volume', baseConversion: 29.57 },
  'cup': { name: 'Cup', abbreviation: 'cup', category: 'volume', baseConversion: 236.59 },
  'pint': { name: 'Pint', abbreviation: 'pt', category: 'volume', baseConversion: 473.18 },
  'quart': { name: 'Quart', abbreviation: 'qt', category: 'volume', baseConversion: 946.35 },
  'gallon': { name: 'Gallon', abbreviation: 'gal', category: 'volume', baseConversion: 3785.41 },

  // Count units
  'count': { name: 'Count', abbreviation: 'ct', category: 'count', baseConversion: 1 },
  'dozen': { name: 'Dozen', abbreviation: 'doz', category: 'count', baseConversion: 12 },

  // Length units
  'millimeter': { name: 'Millimeter', abbreviation: 'mm', category: 'length', baseConversion: 1 },
  'centimeter': { name: 'Centimeter', abbreviation: 'cm', category: 'length', baseConversion: 10 },
  'inch': { name: 'Inch', abbreviation: 'in', category: 'length', baseConversion: 25.4 },
};

// Get all available units
export const getAllUnits = (): UnitDefinition[] => {
  return Object.values(unitDefinitions);
};

// Get all units of a specific category
export const getUnitsByCategory = (category: UnitCategory): UnitDefinition[] => {
  return Object.values(unitDefinitions).filter(unit => unit.category === category);
};

// Get unit by abbreviation or name
export const getUnit = (unitKey: string): UnitDefinition | undefined => {
  // Try to find by key directly
  if (unitDefinitions[unitKey]) {
    return unitDefinitions[unitKey];
  }

  // Try to find by abbreviation
  return Object.values(unitDefinitions).find(
    unit => unit.abbreviation.toLowerCase() === unitKey.toLowerCase()
  );
};

// Convert a value from one unit to another
export const convertUnits = (
  value: number,
  fromUnit: string,
  toUnit: string
): number | null => {
  const fromUnitDef = getUnit(fromUnit);
  const toUnitDef = getUnit(toUnit);

  // Check if units exist
  if (!fromUnitDef || !toUnitDef) {
    return null;
  }

  // Check if units are of the same category
  if (fromUnitDef.category !== toUnitDef.category) {
    return null;
  }

  // Convert to base unit, then to target unit
  const valueInBaseUnit = value * fromUnitDef.baseConversion;
  return valueInBaseUnit / toUnitDef.baseConversion;
};

// Format a unit value with the appropriate abbreviation
export const formatUnitValue = (
  value: number,
  unit: string,
  precision: number = 2
): string => {
  const unitDef = getUnit(unit);
  if (!unitDef) {
    return `${value.toFixed(precision)} ${unit}`;
  }

  return `${value.toFixed(precision)} ${unitDef.abbreviation}`;
};
