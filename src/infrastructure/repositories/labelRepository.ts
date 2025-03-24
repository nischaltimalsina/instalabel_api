import { Label, LabelDocument } from '../../domain/models/label';
import { ILabel, LabelType } from '../../domain/interfaces/label.interface';
import { AppError } from '../../api/middlewares/errorHandler';

export class LabelRepository {
  async create(labelData: ILabel): Promise<LabelDocument> {
    try {
      return await Label.create(labelData);
    } catch (error: unknown) {
      throw error;
    }
  }

  async findById(id: string, tenantId: string): Promise<LabelDocument | null> {
    return Label.findOne({ _id: id, tenantId, isActive: true })
      .populate('recipeId', 'name allergens')
      .populate('inventoryItemId', 'expiryDate')
      .populate('createdBy', 'firstName lastName')
      .populate('printedBy', 'firstName lastName');
  }

  async findByTenant(tenantId: string, query: any = {}): Promise<LabelDocument[]> {
    const filter = { tenantId, isActive: true, ...query };
    return Label.find(filter)
      .populate('recipeId', 'name allergens')
      .populate('inventoryItemId', 'expiryDate')
      .populate('createdBy', 'firstName lastName')
      .populate('printedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByType(tenantId: string, labelType: LabelType): Promise<LabelDocument[]> {
    return Label.find({ tenantId, labelType, isActive: true })
      .populate('recipeId', 'name allergens')
      .populate('inventoryItemId', 'expiryDate')
      .populate('createdBy', 'firstName lastName')
      .populate('printedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByRecipe(tenantId: string, recipeId: string): Promise<LabelDocument[]> {
    return Label.find({ tenantId, recipeId, isActive: true })
      .populate('recipeId', 'name allergens')
      .populate('createdBy', 'firstName lastName')
      .populate('printedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByInventoryItem(tenantId: string, inventoryItemId: string): Promise<LabelDocument[]> {
    return Label.find({ tenantId, inventoryItemId, isActive: true })
      .populate('inventoryItemId', 'expiryDate')
      .populate('createdBy', 'firstName lastName')
      .populate('printedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async update(id: string, tenantId: string, labelData: Partial<ILabel>): Promise<LabelDocument | null> {
    return Label.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      labelData,
      { new: true, runValidators: true }
    )
    .populate('recipeId', 'name allergens')
    .populate('inventoryItemId', 'expiryDate')
    .populate('createdBy', 'firstName lastName')
    .populate('printedBy', 'firstName lastName');
  }

  async markPrinted(id: string, tenantId: string, userId: string): Promise<LabelDocument | null> {
    return Label.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      {
        printedBy: userId,
        printedDate: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('recipeId', 'name allergens')
    .populate('inventoryItemId', 'expiryDate')
    .populate('createdBy', 'firstName lastName')
    .populate('printedBy', 'firstName lastName');
  }

  async delete(id: string, tenantId: string): Promise<LabelDocument | null> {
    // Soft delete
    return Label.findOneAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true }
    );
  }
}
