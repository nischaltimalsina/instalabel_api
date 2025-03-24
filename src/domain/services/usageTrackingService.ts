import { UserRepository } from '../../infrastructure/repositories/userRepository';
import { RecipeRepository } from '../../infrastructure/repositories/recipeRepository';
import { LabelRepository } from '../../infrastructure/repositories/labelRepository';
import { SubscriptionService } from './subscriptionService';

export class UsageTrackingService {
  private userRepository: UserRepository;
  private recipeRepository: RecipeRepository;
  private labelRepository: LabelRepository;
  private subscriptionService: SubscriptionService;

  constructor() {
    this.userRepository = new UserRepository();
    this.recipeRepository = new RecipeRepository();
    this.labelRepository = new LabelRepository();
    this.subscriptionService = new SubscriptionService();
  }

  async checkUserLimit(tenantId: string): Promise<boolean> {
    const users = await this.userRepository.findByTenant(tenantId);
    const userCount = users.length;

    return this.subscriptionService.checkSubscriptionLimits(tenantId, 'maxUsers', userCount);
  }

  async checkRecipeLimit(tenantId: string): Promise<boolean> {
    const recipes = await this.recipeRepository.findByTenant(tenantId);
    const recipeCount = recipes.length;

    return this.subscriptionService.checkSubscriptionLimits(tenantId, 'maxRecipes', recipeCount);
  }

  async checkLabelLimit(tenantId: string): Promise<boolean> {
    // Get current month's labels
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const labels = await this.labelRepository.findByTenant(tenantId, {
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const labelCount = labels.length;

    return this.subscriptionService.checkSubscriptionLimits(tenantId, 'maxLabelsPerMonth', labelCount);
  }

  async checkFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    return this.subscriptionService.checkSubscriptionLimits(tenantId, feature as any, 0);
  }

  async getUsageSummary(tenantId: string): Promise<any> {
    const subscription = await this.subscriptionService.getSubscription(tenantId);

    // Current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const users = await this.userRepository.findByTenant(tenantId);
    const recipes = await this.recipeRepository.findByTenant(tenantId);
    const labels = await this.labelRepository.findByTenant(tenantId, {
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    return {
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      },
      usage: {
        users: {
          current: users.length,
          limit: subscription.features.maxUsers
        },
        recipes: {
          current: recipes.length,
          limit: subscription.features.maxRecipes
        },
        labels: {
          current: labels.length,
          limit: subscription.features.maxLabelsPerMonth
        }
      },
      features: {
        whiteLabeling: subscription.features.whiteLabeling,
        inventoryManagement: subscription.features.inventoryManagement,
        advancedReporting: subscription.features.advancedReporting,
        apiAccess: subscription.features.apiAccess
      }
    };
  }
}
