import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  event: string;
  data: any;
}

interface UseWebSocketProps {
  userId?: number;
  url?: string;
  onMessage?: (event: string, data: any) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (event: string, data: any) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket({
  userId,
  url,
  onMessage
}: UseWebSocketProps = {}): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const webSocket = useRef<WebSocket | null>(null);
  
  // Create connection URL
  const getWsUrl = useCallback(() => {
    if (!userId) return null;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = url || `${protocol}//${window.location.host}/ws`;
    return `${baseUrl}?userId=${userId}`;
  }, [userId, url]);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!userId) return;
    
    const wsUrl = getWsUrl();
    if (!wsUrl) return;
    
    // Close existing connection if any
    if (webSocket.current) {
      webSocket.current.close();
    }
    
    // Create new connection
    webSocket.current = new WebSocket(wsUrl);
    
    webSocket.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connection established');
    };
    
    webSocket.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };
    
    webSocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    webSocket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);
        
        if (onMessage) {
          onMessage(message.event, message.data);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
  }, [userId, getWsUrl, onMessage]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (webSocket.current) {
      webSocket.current.close();
      webSocket.current = null;
      setIsConnected(false);
    }
  }, []);
  
  // Send message through WebSocket
  const sendMessage = useCallback((event: string, data: any) => {
    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      webSocket.current.send(JSON.stringify({ event, data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);
  
  // Connect on mount if userId is available
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);
  
  // Reconnect when userId changes
  useEffect(() => {
    if (userId) {
      disconnect();
      connect();
    }
  }, [userId, connect, disconnect]);
  
  // Setup ping interval to keep connection alive
  useEffect(() => {
    if (!isConnected) return;
    
    const pingInterval = setInterval(() => {
      if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
        sendMessage('ping', {});
      }
    }, 30000); // Send ping every 30 seconds
    
    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, sendMessage]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}
