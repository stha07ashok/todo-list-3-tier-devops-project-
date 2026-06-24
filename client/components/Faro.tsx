'use client'; 
import { useEffect } from 'react';
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Faro() {
  useEffect(() => {
    
    if (globalThis.window !== undefined) {
      initializeFaro({
        url: process.env.NEXT_PUBLIC_FARO_URL || '',
        app: { name: 'todo-list-frontend', version: '1.0.0' },
        instrumentations: [
          ...getWebInstrumentations(),
          new TracingInstrumentation(),
        ],
      });
    }
  }, []);

  return null;
}