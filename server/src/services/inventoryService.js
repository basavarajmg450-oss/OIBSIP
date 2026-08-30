const Inventory = require('../models/Inventory');

const checkInventory = async (items) => {
  const insufficientItems = [];
  let available = true;

  // Assuming items array looks like: [{ product, quantity, size, customizations: { base, sauce, cheese, veggies, meat } }]
  // For simplicity, we'll check inventory if items provide specific ingredient names/IDs
  // A production app would likely map product IDs to recipe ingredients.
  
  // Here we'll do a simple mock check since the detailed implementation depends heavily on the schema structure 
  // passed from the controller. We expect the caller to aggregate required inventory items.
  
  // Example expected format for checking: [{ inventoryId/name, requiredQuantity }]
  for (const item of items) {
    if (!item.inventoryId && !item.name) continue;
    
    const query = item.inventoryId ? { _id: item.inventoryId } : { name: item.name };
    const invItem = await Inventory.findOne(query);
    
    if (!invItem || invItem.quantity < item.requiredQuantity) {
      available = false;
      insufficientItems.push({
        name: invItem ? invItem.name : item.name,
        requested: item.requiredQuantity,
        available: invItem ? invItem.quantity : 0
      });
    }
  }

  return { available, insufficientItems };
};

const deductInventory = async (items) => {
  // Expected items: [{ inventoryId/name, requiredQuantity }]
  const operations = [];

  for (const item of items) {
    if (!item.inventoryId && !item.name) continue;
    
    const filter = item.inventoryId ? { _id: item.inventoryId } : { name: item.name };
    
    operations.push({
      updateOne: {
        filter,
        update: { $inc: { quantity: -item.requiredQuantity } }
      }
    });
  }

  if (operations.length > 0) {
    await Inventory.bulkWrite(operations);
  }
};

const checkLowStock = async () => {
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  
  // Find items where quantity <= threshold AND (lastNotifiedAt is null OR lastNotifiedAt < 12 hours ago)
  const lowStockItems = await Inventory.find({
    $expr: { $lte: ['$quantity', '$threshold'] },
    $or: [
      { lastNotifiedAt: { $type: 10 } }, // null
      { lastNotifiedAt: { $exists: false } },
      { lastNotifiedAt: { $lt: twelveHoursAgo } }
    ]
  });

  return lowStockItems;
};

module.exports = {
  checkInventory,
  deductInventory,
  checkLowStock
};
