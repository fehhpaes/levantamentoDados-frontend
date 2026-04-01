import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp?: string;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketReturn {
  status: WebSocketStatus;
  lastMessage: WebSocketMessage | null;
  send: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnect = true,
  reconnectInterval = 5000,
  reconnectAttempts = 5,
  heartbeatInterval = 30000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isManualDisconnect = useRef(false);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, heartbeatInterval);
    }
  }, [heartbeatInterval]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isManualDisconnect.current = false;
    setStatus('connecting');

    // Add auth token to WebSocket URL
    const token = localStorage.getItem('access_token');
    const wsUrl = token ? `${url}?token=${token}` : url;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setStatus('connected');
        reconnectCountRef.current = 0;
        startHeartbeat();
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Ignore pong messages
          if (message.type === 'pong') {
            return;
          }
          
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        setStatus('disconnected');
        clearTimers();
        onDisconnect?.();

        // Attempt to reconnect if not manually disconnected
        if (reconnect && !isManualDisconnect.current && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (event) => {
        setStatus('error');
        onError?.(event);
      };
    } catch (err) {
      setStatus('error');
      console.error('WebSocket connection error:', err);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnect, reconnectInterval, reconnectAttempts, startHeartbeat, clearTimers]);

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;
    clearTimers();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('disconnected');
  }, [clearTimers]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }, []);

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    lastMessage,
    send,
    connect,
    disconnect,
  };
}

// Specialized hook for live match updates
interface LiveMatchUpdate {
  match_id: number;
  home_score: number;
  away_score: number;
  status: string;
  minute?: number;
  events?: Array<{
    type: string;
    minute: number;
    player?: string;
    team: 'home' | 'away';
  }>;
}

export function useLiveMatches(onUpdate?: (update: LiveMatchUpdate) => void) {
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/matches/live`;
  
  return useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      if (message.type === 'live_update' && onUpdate) {
        onUpdate(message.data as LiveMatchUpdate);
      }
    },
  });
}

// Specialized hook for odds updates
interface OddsUpdate {
  match_id: number;
  bookmaker_id: number;
  market_type: string;
  odds: {
    home?: number;
    draw?: number;
    away?: number;
    over?: number;
    under?: number;
    line?: number;
  };
  is_value_bet?: boolean;
  value_percentage?: number;
}

export function useOddsUpdates(matchId?: number, onUpdate?: (update: OddsUpdate) => void) {
  const wsUrl = matchId
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/odds/${matchId}`
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/odds`;
  
  return useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      if (message.type === 'odds_update' && onUpdate) {
        onUpdate(message.data as OddsUpdate);
      }
    },
  });
}

// Specialized hook for value bet alerts
interface ValueBetAlert {
  match_id: number;
  match_info: {
    home_team: string;
    away_team: string;
    league: string;
    match_date: string;
  };
  market: string;
  selection: string;
  bookmaker: string;
  odds: number;
  predicted_prob: number;
  edge_percentage: number;
  confidence: number;
  expected_value: number;
}

export function useValueBetAlerts(onAlert?: (alert: ValueBetAlert) => void) {
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/value-bets`;
  
  return useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      if (message.type === 'value_bet_alert' && onAlert) {
        onAlert(message.data as ValueBetAlert);
      }
    },
  });
}

// Specialized hook for system notifications
interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action_url?: string;
  created_at: string;
}

export function useSystemNotifications(onNotification?: (notification: SystemNotification) => void) {
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/notifications`;
  
  return useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      if (message.type === 'notification' && onNotification) {
        onNotification(message.data as SystemNotification);
      }
    },
  });
}
