import { useState } from 'react';

export function useUser() {
  const [deviceId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('deviceId', id);
    }
    return id;
  });

  return { deviceId };
}
