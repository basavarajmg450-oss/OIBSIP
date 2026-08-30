require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');

const seedDB = async (shouldExit = true) => {
  try {
    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crustcraft.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          name: process.env.ADMIN_NAME || 'CrustCraft Admin',
          email: adminEmail,
          passwordHash: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true
        }
      },
      { upsert: true }
    );
    console.log('✅ Admin user seeded.');

    // 2. Seed Pizzas
    const pizzas = [
      {
        name: 'Margherita',
        description: 'Classic delight with 100% real mozzarella cheese',
        category: 'Veg',
        basePrice: 199,
        image: '',
        ingredients: ['Classic Tomato', 'Mozzarella'],
        available: true
      },
      {
        name: 'Farmhouse',
        description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom',
        category: 'Veg',
        basePrice: 349,
        image: '',
        ingredients: ['Classic Tomato', 'Mozzarella', 'Mushrooms', 'Red Onions', 'Bell Peppers'],
        available: true
      },
      {
        name: 'Pepperoni',
        description: 'Loaded with double pepperoni, real mozzarella cheese and classic tomato sauce',
        category: 'Non-Veg',
        basePrice: 499,
        image: '',
        ingredients: ['Classic Tomato', 'Mozzarella', 'Pepperoni'],
        available: true
      },
      {
        name: 'Veggie Supreme',
        description: 'Black olives, capsicum, onion, grilled mushroom, sweet corn, tomato, jalapeno',
        category: 'Veg',
        basePrice: 399,
        image: '',
        ingredients: ['Classic Tomato', 'Mozzarella', 'Mushrooms', 'Red Onions', 'Bell Peppers', 'Black Olives', 'Sweet Corn'],
        available: true
      },
      {
        name: 'Cheese Burst',
        description: 'Crust filled with warm melted cheese and mozzarella toppings',
        category: 'Veg',
        basePrice: 249,
        image: '',
        ingredients: ['Classic Tomato', 'Mozzarella', 'Cheddar'],
        available: true
      },
      {
        name: 'Spicy Paneer',
        description: 'Spicy paneer chunks with capsicum, onion & red paprika',
        category: 'Veg',
        basePrice: 349,
        image: '',
        ingredients: ['Spicy Peri Peri', 'Mozzarella', 'Red Onions', 'Bell Peppers'],
        available: true
      },
      {
        name: 'BBQ Chicken',
        description: 'Pepper barbecue chicken & onion with smoky BBQ sauce',
        category: 'Non-Veg',
        basePrice: 449,
        image: '',
        ingredients: ['BBQ Smoky', 'Mozzarella', 'BBQ Chicken', 'Red Onions'],
        available: true
      }
    ];

    const pizzaOps = pizzas.map(pizza => ({
      updateOne: {
        filter: { name: pizza.name },
        update: { $set: pizza },
        upsert: true
      }
    }));
    await Pizza.bulkWrite(pizzaOps);
    console.log('✅ Pizzas seeded.');

    // 3. Seed Inventory Items
    const inventoryItems = [
      // Bases
      { name: 'Thin Crust', category: 'Base', quantity: 100, threshold: 20, price: 50 },
      { name: 'Thick Crust', category: 'Base', quantity: 100, threshold: 20, price: 60 },
      { name: 'Cheese Burst', category: 'Base', quantity: 80, threshold: 15, price: 120 },
      { name: 'Pan', category: 'Base', quantity: 100, threshold: 20, price: 70 },
      { name: 'Wheat Thin', category: 'Base', quantity: 50, threshold: 10, price: 80 },
      { name: 'Gluten-Free', category: 'Base', quantity: 30, threshold: 5, price: 100 },
      
      // Sauces
      { name: 'Classic Tomato', category: 'Sauce', quantity: 150, threshold: 30, price: 30 },
      { name: 'BBQ Smoky', category: 'Sauce', quantity: 100, threshold: 20, price: 40 },
      { name: 'Spicy Peri Peri', category: 'Sauce', quantity: 80, threshold: 15, price: 40 },
      { name: 'Garlic Cream', category: 'Sauce', quantity: 60, threshold: 10, price: 50 },
      { name: 'Basil Pesto', category: 'Sauce', quantity: 50, threshold: 10, price: 60 },
      { name: 'Buffalo Hot', category: 'Sauce', quantity: 40, threshold: 10, price: 45 },
      
      // Cheeses
      { name: 'Mozzarella', category: 'Cheese', quantity: 200, threshold: 40, price: 40 },
      { name: 'Cheddar', category: 'Cheese', quantity: 100, threshold: 20, price: 50 },
      { name: 'Parmesan', category: 'Cheese', quantity: 80, threshold: 15, price: 70 },
      { name: 'Gouda', category: 'Cheese', quantity: 60, threshold: 10, price: 60 },
      
      // Veggies
      { name: 'Mushrooms', category: 'Veggies', quantity: 120, threshold: 25, price: 30 },
      { name: 'Black Olives', category: 'Veggies', quantity: 80, threshold: 15, price: 40 },
      { name: 'Bell Peppers', category: 'Veggies', quantity: 100, threshold: 20, price: 25 },
      { name: 'Jalapeños', category: 'Veggies', quantity: 70, threshold: 15, price: 35 },
      { name: 'Sweet Corn', category: 'Veggies', quantity: 100, threshold: 20, price: 30 },
      { name: 'Red Onions', category: 'Veggies', quantity: 150, threshold: 30, price: 25 },
      
      // Meat
      { name: 'Pepperoni', category: 'Meat', quantity: 80, threshold: 15, price: 80 },
      { name: 'Chicken Tikka', category: 'Meat', quantity: 90, threshold: 20, price: 70 },
      { name: 'BBQ Chicken', category: 'Meat', quantity: 90, threshold: 20, price: 70 },
      { name: 'Sausage', category: 'Meat', quantity: 70, threshold: 15, price: 60 }
    ];

    const invOps = inventoryItems.map(item => ({
      updateOne: {
        filter: { name: item.name },
        update: { $set: item },
        upsert: true
      }
    }));
    await Inventory.bulkWrite(invOps);
    console.log('✅ Inventory items seeded.');

    console.log('🎉 Seeding completed successfully!');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (shouldExit) process.exit(1);
  }
};

// Check if run directly
if (require.main === module) {
  connectDB().then(() => {
    seedDB(true);
  });
}

module.exports = seedDB;
