import { InventoryItemService } from './inventoryItemService';
import { InventoryItemDocument } from '../models/inventoryItem';
import { TenantService } from './tenantService';
import { UserService } from './userService';


export type AlertLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ExpiryAlertItem {
  inventoryItemId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  alertLevel: AlertLevel;
}

export interface ExpiryAlertReport {
  tenant: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
  date: Date;
  expiringSoon: ExpiryAlertItem[];
  alreadyExpired: ExpiryAlertItem[];
}

export interface ExpiryAlertFilterOptions {
  locationId?: string;
  includeExpired?: boolean;
  daysThreshold?: number;
  alertLevel?: AlertLevel[];
}
export class ExpiryAlertService {
  private inventoryItemService: InventoryItemService;
  private tenantService: TenantService;
  private userService: UserService;

  constructor() {
    this.inventoryItemService = new InventoryItemService();
    this.tenantService = new TenantService();
    this.userService = new UserService();
  }

  async generateExpiryAlerts(tenantId: string, days: number = 3): Promise<ExpiryAlertItem[]> {
    // Get items expiring soon
    const expiringItems = await this.inventoryItemService.getExpiringItems(tenantId, days);

    // Transform to alert items
    const alertItems: ExpiryAlertItem[] = [];

    for (const item of expiringItems) {
      const ingredient = await this.inventoryItemService.getIngredientForInventoryItem(item);

      alertItems.push({
        inventoryItemId: item._id.toString(),
        ingredientName: ingredient.name,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        daysUntilExpiry: this.calculateDaysUntilExpiry(item.expiryDate),
        alertLevel: this.getAlertLevel(item.expiryDate)
      });
    }

    // Sort by days until expiry (ascending)
    return alertItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  async generateExpiredAlerts(tenantId: string): Promise<ExpiryAlertItem[]> {
    // Get expired items
    const expiredItems = await this.inventoryItemService.getExpiredItems(tenantId);

    // Transform to alert items
    const alertItems: ExpiryAlertItem[] = [];

    for (const item of expiredItems) {
      const ingredient = await this.inventoryItemService.getIngredientForInventoryItem(item);

      alertItems.push({
        inventoryItemId: item._id.toString(),
        ingredientName: ingredient.name,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        daysUntilExpiry: this.calculateDaysUntilExpiry(item.expiryDate),
        alertLevel: 'critical'
      });
    }

    // Sort by days until expiry (ascending)
    return alertItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  private calculateDaysUntilExpiry(expiryDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getAlertLevel(expiryDate: Date): AlertLevel {
    const daysUntilExpiry = this.calculateDaysUntilExpiry(expiryDate);

    if (daysUntilExpiry < 0) {
      return 'critical';
    } else if (daysUntilExpiry === 0) {
      return 'high';
    } else if (daysUntilExpiry <= 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }

// Add another method to generate comprehensive reports
async generateExpiryAlertReport(tenantId: string, options: ExpiryAlertFilterOptions = {}): Promise<ExpiryAlertReport> {
  // Set default options
  const {
    locationId,
    includeExpired = true,
    daysThreshold = 3,
    alertLevel = ['low', 'medium', 'high', 'critical']
  } = options;

  // Get tenant details
  const tenant = await this.tenantService.getTenantById(tenantId);

  // Get location details if provided
  let location = undefined;
  if (locationId) {
    // This would require a LocationService - we'll assume it exists
    // location = await this.locationService.getLocationById(tenantId, locationId);
  }

  // Get expiring items
  let expiringSoon = await this.generateExpiryAlerts(tenantId, daysThreshold);

  // Filter by location if provided
  if (locationId) {
    expiringSoon = expiringSoon.filter(item => {
      // This would require accessing the inventory item to check its locationId
      // We'll leave this as a TODO for now
      return true;
    });
  }

  // Filter by alert level
  expiringSoon = expiringSoon.filter(item => alertLevel.includes(item.alertLevel));

  // Get expired items if requested
  let alreadyExpired: ExpiryAlertItem[] = [];
  if (includeExpired) {
    alreadyExpired = await this.generateExpiredAlerts(tenantId);

    // Filter by location if provided
    if (locationId) {
      alreadyExpired = alreadyExpired.filter(item => {
        // This would require accessing the inventory item to check its locationId
        // We'll leave this as a TODO for now
        return true;
      });
    }
  }

  // Generate the report
  return {
    tenant: {
      id: tenantId,
      name: tenant.name
    },
    location: location ? {
      id: locationId as string,
      name: (location as any).name
    } : undefined,
    date: new Date(),
    expiringSoon,
    alreadyExpired
  };
}
}
