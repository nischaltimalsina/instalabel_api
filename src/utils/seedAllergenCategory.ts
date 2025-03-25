import mongoose from 'mongoose';
import { Allergen } from '../domain/models/allergen';
import { Category } from '../domain/models/category';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';

// Define the allergen data
const allergens = [
  { name: "Celery", description: "Includes celery stalks, leaves, seeds and celeriac", relatedIngredients: ["Celery", "Celeriac", "Celery Salt"] },
  { name: "Cereals containing gluten", description: "Wheat, rye, barley and oats are often found in foods with flour", relatedIngredients: ["Wheat", "Barley", "Rye", "Oats", "Spelt", "Kamut"] },
  { name: "Crustaceans", description: "Includes crabs, lobster, prawns and scampi", relatedIngredients: ["Prawns", "Crab", "Lobster", "Shrimp", "Crayfish"] },
  { name: "Eggs", description: "Found in many foods including cakes, some meat products, mayonnaise", relatedIngredients: ["Egg", "Mayonnaise", "Meringue", "Omelettes"] },
  { name: "Fish", description: "Found in some fish sauces, pizzas, relishes, salad dressings", relatedIngredients: ["Salmon", "Tuna", "Cod", "Haddock", "Anchovy", "Fish Sauce"] },
  { name: "Lupin", description: "Lupin flour and seeds can be found in some types of bread, pastries", relatedIngredients: ["Lupin Flour", "Lupin Seeds"] },
  { name: "Milk", description: "Found in butter, cheese, cream, milk powders and yoghurt", relatedIngredients: ["Milk", "Cheese", "Butter", "Yogurt", "Cream"] },
  { name: "Molluscs", description: "Includes mussels, land snails, squid and whelks", relatedIngredients: ["Mussels", "Oysters", "Squid", "Scallops", "Snails"] },
  { name: "Mustard", description: "Liquid mustard, mustard powder and mustard seeds", relatedIngredients: ["Mustard", "Mustard Powder", "Mustard Seeds"] },
  { name: "Nuts", description: "Not to be confused with peanuts which are legumes", relatedIngredients: ["Almonds", "Hazelnuts", "Walnuts", "Cashews", "Pistachios", "Brazil Nuts"] },
  { name: "Peanuts", description: "Found in many foods including biscuits, cakes, curries, desserts", relatedIngredients: ["Peanuts", "Peanut Butter", "Peanut Oil"] },
  { name: "Sesame seeds", description: "Found in bread, breadsticks, hummus, sesame oil and tahini", relatedIngredients: ["Sesame Seeds", "Tahini", "Sesame Oil"] },
  { name: "Soya", description: "Found in bean curd, edamame beans, miso paste, soya flour", relatedIngredients: ["Soybeans", "Soy Sauce", "Tofu", "Edamame"] },
  { name: "Sulphur dioxide", description: "Often used as a preservative in dried fruits, meat products", relatedIngredients: ["Dried Fruits", "Wine", "Beer", "Pickles", "Vinegar"] },
];

// Define the category data
const categories = [
  { name: "Dairy", description: "Milk-based products" },
  { name: "Meat", description: "All meat products" },
  { name: "Seafood", description: "Fish and shellfish products" },
  { name: "Vegetables", description: "Fresh and processed vegetables" },
  { name: "Fruits", description: "Fresh and processed fruits" },
  { name: "Frozen", description: "Frozen food items" },
  { name: "Canned", description: "Preserved food in cans" },
  { name: "Sauces & Condiments", description: "Flavor enhancers and toppings" },
  { name: "Grains & Bread", description: "Cereal grains and bread products" },
  { name: "Beverages", description: "Drinks and liquid refreshments" },
  { name: "Spices & Herbs", description: "Flavor-enhancing seasonings" },
  { name: "Oils & Fats", description: "Cooking oils and fats" },
  { name: "Baking Ingredients", description: "Items used in baking" },
  { name: "Snacks & Ready-to-Eat", description: "Pre-prepared foods" },
  { name: "Miscellaneous", description: "Other food items not categorized elsewhere" },
];

const seedAllergens = async () => {
  try {
    // Clear existing allergens
    await Allergen.deleteMany({});
    console.log("✅ Cleared existing allergens");

    // Get a superadmin user ID (or create a dummy one for seed purposes)
    const dummyCreatorId = new mongoose.Types.ObjectId();
    
    // Create the allergens
    const allergenPromises = allergens.map(allergen => {
      return Allergen.create({
        name: allergen.name,
        description: allergen.description,
        isSystemLevel: true, // These are system-level allergens
        createdBy: dummyCreatorId, // Use the dummy ID for seed purposes
        relatedIngredients: allergen.relatedIngredients
      });
    });
    
    await Promise.all(allergenPromises);
    console.log("✅ UK Standard Allergens Seeded!");
  } catch (err) {
    console.error("❌ Error seeding allergens:", err);
  }
};

const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log("✅ Cleared existing categories");
    
    // Create the categories
    const categoryPromises = categories.map(category => {
      return Category.create({
        name: category.name,
        description: category.description,
        tenantId: null, // Explicitly set to null for system-wide categories
        isActive: true
      });
    });
    
    await Promise.all(categoryPromises);
    console.log("✅ Categories seeded successfully!");
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
  }
};

// Main function to run both seeders
const seedAllergensAndCategories = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database for seeding');

    // Seed allergens and categories
    await seedAllergens();
    await seedCategories();

    console.log('✅ Allergens and Categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error in seed script:', error);
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
    console.log('Disconnected from database');
  }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedAllergensAndCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error in seed script:', error);
      process.exit(1);
    });
}

export { seedAllergensAndCategories, seedAllergens, seedCategories }; 