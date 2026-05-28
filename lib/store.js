import { useState, useEffect, useCallback, useRef } from 'react';
import { initialData } from './data';

const LOCAL_KEY = 'tzviair_expo_data';
const SYNC_DELAY = 1200;

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

async function serverLoad() {
  try {
    const res = await fetch('/api/data?code=2141', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function serverSave(data) {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-access-code': '2141' },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function localRead() {
  try {
    const s = localStorage.getItem(LOCAL_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function localWrite(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}

export function useAppData() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('loading'); // 'loading'|'synced'|'syncing'|'local'
  const timer = useRef(null);

  useEffect(() => {
    async function init() {
      // Instant local load
      const local = localRead();
      setData(local ? deepMerge(initialData, local) : initialData);
      setLoaded(true);

      // Background server load
      setSyncStatus('loading');
      const remote = await serverLoad();
      if (remote) {
        const merged = deepMerge(initialData, remote);
        setData(merged);
        localWrite(remote);
        setSyncStatus('synced');
      } else {
        setSyncStatus('local');
      }
    }
    init();
  }, []);

  const save = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localWrite(next);
      setSyncStatus('syncing');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const ok = await serverSave(next);
        setSyncStatus(ok ? 'synced' : 'local');
      }, SYNC_DELAY);
      return next;
    });
  }, []);

  const update = useCallback((path, value) => {
    save((prev) => {
      const keys = path.split('.');
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, [save]);

  const resetToDefaults = useCallback(() => {
    try { localStorage.removeItem(LOCAL_KEY); } catch {}
    setData(initialData);
    serverSave(initialData);
  }, []);

  return { data, loaded, save, update, resetToDefaults, syncStatus };
}
