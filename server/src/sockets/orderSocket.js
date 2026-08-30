const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinRoom', ({ userId, orderId }) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
      }
      if (orderId) {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined room order_${orderId}`);
      }
    });

    socket.on('leaveRoom', ({ userId, orderId }) => {
      if (userId) {
        socket.leave(`user_${userId}`);
        console.log(`Socket ${socket.id} left room user_${userId}`);
      }
      if (orderId) {
        socket.leave(`order_${orderId}`);
        console.log(`Socket ${socket.id} left room order_${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const emitOrderUpdate = (io, orderId, userId, data) => {
  if (!io) return;
  
  // Emit to order specific room
  if (orderId) {
    io.to(`order_${orderId}`).emit('orderStatusUpdated', data);
  }
  
  // Emit to user specific room
  if (userId) {
    io.to(`user_${userId}`).emit('orderStatusUpdated', data);
  }
};

module.exports = {
  setupSocket,
  emitOrderUpdate
};
