import { useState, useEffect, useCallback } from 'react';
import { initialData } from './data';

const STORAGE_KEY = 'tzviair_expo_data';

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function useAppData() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge stored data with initial data to pick up new fields
        setData(deepMerge(initialData, parsed));
      } else {
        setData(initialData);
      }
    } catch {
      setData(initialData);
    }
    setLoaded(true);
  }, []);

  const save = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Update a specific path in data
  const update = useCallback(
    (path, value) => {
      save((prev) => {
        const keys = path.split('.');
        const next = JSON.parse(JSON.stringify(prev)); // deep clone
        let obj = next;
        for (let i = 0; i < keys.length - 1; i++) {
          if (obj[keys[i]] === undefined) obj[keys[i]] = {};
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        return next;
      });
    },
    [save]
  );

  const resetToDefaults = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setData(initialData);
  }, []);

  return { data, loaded, save, update, resetToDefaults };
}
