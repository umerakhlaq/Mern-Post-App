import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../utils/constants';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        console.warn('useSocket must be used within SocketProvider');
        return null;
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Connect to socket server
        const socketUrl = BASE_URL.replace('/api', '');
        const newSocket = io(socketUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            // Emit user-join event with user ID
            newSocket.emit('user-join', user._id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, user }}>
            {children}
        </SocketContext.Provider>
    );
};
