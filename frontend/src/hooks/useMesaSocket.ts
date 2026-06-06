import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL, tokenStorage } from '@/api/client';
import type { MesaEvento } from '@/types/mesa';

// http://host:8080 -> ws://host:8080/ws ; https://host -> wss://host/ws
const WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;

/**
 * Canal STOMP da mesa. Conecta no /ws mandando o JWT no CONNECT (mesma auth do REST),
 * assina /topic/mesas/{id} e expõe enviarMovimento() pro arraste ao vivo. Auto-reconnect
 * embutido (reconnectDelay) — cobre o spin-down do Render. onEvento recebe cada evento do tópico.
 */
export function useMesaSocket(
  mesaId: string | undefined,
  onEvento: (evento: MesaEvento) => void,
) {
  const clientRef = useRef<Client | null>(null);
  const onEventoRef = useRef(onEvento);
  onEventoRef.current = onEvento;

  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!mesaId || !token) return;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConectado(true);
        client.subscribe(`/topic/mesas/${mesaId}`, (msg) => {
          try {
            onEventoRef.current(JSON.parse(msg.body) as MesaEvento);
          } catch {
            // ignora payloads malformados
          }
        });
      },
      onDisconnect: () => setConectado(false),
      onWebSocketClose: () => setConectado(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      void client.deactivate();
      clientRef.current = null;
      setConectado(false);
    };
  }, [mesaId]);

  const enviarMovimento = useCallback(
    (tokenId: string, x: number, y: number) => {
      const client = clientRef.current;
      if (client?.connected && mesaId) {
        client.publish({
          destination: `/app/mesas/${mesaId}/mover`,
          body: JSON.stringify({ tokenId, x, y }),
        });
      }
    },
    [mesaId],
  );

  /** Régua ao vivo (efêmera): início (x1,y1) → fim (x2,y2). ativa=false limpa nos outros. */
  const enviarRegua = useCallback(
    (cenaId: string, x1: number, y1: number, x2: number, y2: number, ativa: boolean) => {
      const client = clientRef.current;
      if (client?.connected && mesaId) {
        client.publish({
          destination: `/app/mesas/${mesaId}/regua`,
          body: JSON.stringify({ cenaId, x1, y1, x2, y2, ativa }),
        });
      }
    },
    [mesaId],
  );

  return { conectado, enviarMovimento, enviarRegua };
}
