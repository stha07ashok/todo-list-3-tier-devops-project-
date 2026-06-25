'use client'; 
import { useEffect } from 'react';
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Faro() {
  useEffect(() => {
    
    const faroUrl = process.env.NEXT_PUBLIC_FARO_URL;
    if (!faroUrl) return;

    if (globalThis.window !== undefined) {
      initializeFaro({
        url: faroUrl,
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