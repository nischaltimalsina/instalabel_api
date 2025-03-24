import { Tenant } from '../domain/models/tenant';
import { User } from '../domain/models/user';
import { Ingredient } from '../domain/models/ingredient';
import { Recipe } from '../domain/models/recipe';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';

// Sample data
const seedData = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database for seeding');

    // Clear existing data
    await Tenant.deleteMany({});
    await User.deleteMany({});
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // Create a tenant
    const tenant = await Tenant.create({
      name: 'Demo Restaurant',
      subscriptionPlan: 'professional',
      contactInfo: {
        email: 'demo@kitchenlabel.com',
        phone: '123-456-7890',
        address: {
          street: '123 Kitchen St',
          city: 'Culinary City',
          state: 'CA',
          postalCode: '90210',
          country: 'USA'
        }
      },
      whiteLabelSettings: {
        logoUrl: 'https://example.com/logo.png',
        colors: {
          primary: '#FF5722',
          secondary: '#4CAF50',
          accent: '#2196F3'
        }
      }
    });
    console.log('Created tenant:', tenant.name);

    // Create users
    const adminUser = await User.create({
      tenantId: tenant._id,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kitchenlabel.com',
      password: 'Password123!',
      role: 'admin',
      isActive: true
    });

    const managerUser = await User.create({
      tenantId: tenant._id,
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@kitchenlabel.com',
      password: 'Password123!',
      role: 'manager',
      isActive: true
    });

    const staffUser = await User.create({
      tenantId: tenant._id,
      firstName: 'Staff',
      lastName: 'User',
      email: 'staff@kitchenlabel.com',
      password: 'Password123!',
      role: 'staff',
      isActive: true
    });
    console.log('Created users');

    // Create ingredients
    const ingredients = await Ingredient.create([
      {
        tenantId: tenant._id,
        name: 'All-Purpose Flour',
        description: 'Wheat flour for general baking',
        allergens: ['gluten', 'wheat'],
        nutritionalInfo: {
          calories: 364,
          protein: 10.3,
          fat: 1,
          carbs: 76.3
        },
        defaultUnit: 'g'
      },
      {
        tenantId: tenant._id,
        name: 'Butter',
        description: 'Unsalted butter',
        allergens: ['dairy'],
        nutritionalInfo: {
          calories: 717,
          protein: 0.9,
          fat: 81.1,
          carbs: 0.1
        },
        defaultUnit: 'g'
      },
      {
        tenantId: tenant._id,
        name: 'Eggs',
        description: 'Large fresh eggs',
        allergens: ['eggs'],
        nutritionalInfo: {
          calories: 155,
          protein: 12.6,
          fat: 10.6,
          carbs: 1.1
        },
        defaultUnit: 'count'
      },
      {
        tenantId: tenant._id,
        name: 'Sugar',
        description: 'White granulated sugar',
        allergens: [],
        nutritionalInfo: {
          calories: 400,
          protein: 0,
          fat: 0,
          carbs: 100
        },
        defaultUnit: 'g'
      },
      {
        tenantId: tenant._id,
        name: 'Milk',
        description: 'Whole milk',
        allergens: ['dairy'],
        nutritionalInfo: {
          calories: 61,
          protein: 3.2,
          fat: 3.3,
          carbs: 4.8
        },
        defaultUnit: 'ml'
      }
    ]);
    console.log('Created ingredients');

    // Create a recipe
    const recipe = await Recipe.create({
      tenantId: tenant._id,
      name: 'Basic Pancakes',
      description: 'Fluffy American-style pancakes',
      category: 'Breakfast',
      status: 'active',
      ingredients: [
        {
          ingredientId: ingredients[0]._id, // Flour
          quantity: 200,
          unit: 'g',
          preparationNotes: 'Sifted'
        },
        {
          ingredientId: ingredients[1]._id, // Butter
          quantity: 30,
          unit: 'g',
          preparationNotes: 'Melted'
        },
        {
          ingredientId: ingredients[2]._id, // Eggs
          quantity: 2,
          unit: 'count'
        },
        {
          ingredientId: ingredients[3]._id, // Sugar
          quantity: 20,
          unit: 'g'
        },
        {
          ingredientId: ingredients[4]._id, // Milk
          quantity: 300,
          unit: 'ml'
        }
      ],
      allergens: ['gluten', 'wheat', 'dairy', 'eggs'],
      preparationInstructions: 'Mix dry ingredients. Add wet ingredients and stir until just combined.',
      cookingInstructions: 'Cook on medium heat for 2-3 minutes per side.',
      servingSize: 1,
      servingUnit: 'stack',
      yield: 4,
      yieldUnit: 'servings',
      createdBy: adminUser._id
    });
    console.log('Created recipe');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnectFromDatabase();
    console.log('Disconnected from database');
  }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error in seed script:', error);
      process.exit(1);
    });
}

export { seedData };
