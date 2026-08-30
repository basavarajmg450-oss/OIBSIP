import React, { createContext, useEffect, useState, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinRoom', { userId: user._id || user.id });
    });

    socket.on('orderStatusUpdated', (data) => {
      setOrderUpdates(prev => [...prev, { ...data, receivedAt: new Date() }]);
    });

    socket.on('disconnect', () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  const joinOrderRoom = (orderId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', { orderId });
    }
  };

  const leaveOrderRoom = (orderId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', { orderId });
    }
  };

  const clearUpdates = () => setOrderUpdates([]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, isConnected, orderUpdates,
      joinOrderRoom, leaveOrderRoom, clearUpdates
    }}>
      {children}
    </SocketContext.Provider>
  );
};
