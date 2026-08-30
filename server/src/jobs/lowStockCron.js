const cron = require('node-cron');
const { checkLowStock } = require('../services/inventoryService');
const { sendLowStockAlert } = require('../services/emailService');
const Inventory = require('../models/Inventory');

const startLowStockJob = (io) => {
  // Schedule to run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('Running low stock background job...');
      const lowStockItems = await checkLowStock();
      
      if (lowStockItems && lowStockItems.length > 0) {
        console.log(`Found ${lowStockItems.length} low stock items, sending alert...`);
        
        // Send email alert
        await sendLowStockAlert(lowStockItems);
        
        // Update lastNotifiedAt for all these items
        const itemIds = lowStockItems.map(item => item._id);
        await Inventory.updateMany(
          { _id: { $in: itemIds } },
          { $set: { lastNotifiedAt: new Date() } }
        );
        
        console.log('Alert sent and items updated.');
        
        // Optional: emit an alert to admin clients via socket
        if (io) {
          io.to('admin_room').emit('lowStockAlert', { count: lowStockItems.length });
        }
      } else {
        console.log('No low stock items found.');
      }
    } catch (error) {
      console.error('Error in low stock cron job:', error);
    }
  });
};

module.exports = {
  startLowStockJob
};
