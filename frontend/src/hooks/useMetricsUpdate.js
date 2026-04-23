import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export const useMetricsUpdate = (onMetricsChange) => {
    const { socket } = useSocket() || {};
    const callbackRef = useRef(onMetricsChange);

    useEffect(() => {
        callbackRef.current = onMetricsChange;
    }, [onMetricsChange]);

    useEffect(() => {
        if (!socket) return;

        const metricsHandler = (data) => {
            // console.log('Metrics update received:', data);
            if (callbackRef.current) {
                callbackRef.current(data);
            }
        };

        socket.on('metrics-update', metricsHandler);

        return () => {
            socket.off('metrics-update', metricsHandler);
        };
    }, [socket]);
};
