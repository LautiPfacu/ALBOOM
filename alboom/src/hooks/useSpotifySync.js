// Al entrar a la app, si tenés Spotify conectado y pasaron más de 30 minutos desde la última
// lectura, vuelve a leer lo que escuchaste. Se usa una sola vez, en el Layout.
// Si Spotify falla, no rompe nada: solo queda la información de la vez anterior.

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { syncSpotify } from '../services/spotifyUser';
import { useSpotify } from './useSpotify';

const SYNC_EVERY_MS = 30 * 60 * 1000;

export function useSpotifySync() {
  const { user } = useAuth();
  const { connected, settings, lastSync, refreshToken } = useSpotify();
  const triedRef = useRef(false); // una sola vez por visita

  const lastSyncMs = typeof lastSync?.toMillis === 'function' ? lastSync.toMillis() : 0;

  useEffect(() => {
    if (!connected || !refreshToken || triedRef.current) return;
    if (Date.now() - lastSyncMs < SYNC_EVERY_MS) return;
    triedRef.current = true;
    syncSpotify(user.uid, settings, refreshToken).catch(() => {});
  }, [connected, refreshToken, lastSyncMs, settings, user.uid]);
}
