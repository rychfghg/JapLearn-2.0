import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import expoconfig from '../expoconfig';
import { useEffect, useState } from 'react';

const folder = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}japlearn-offline-media/` : null;
const inFlight = new Map<string, Promise<string>>();
const absoluteUrl = (value: string) => value.startsWith('http') ? value : `${expoconfig.API_URL}${value}`;
const fileName = (url: string) => {
  let hash = 2166136261;
  for (let i = 0; i < url.length; i += 1) hash = Math.imul(hash ^ url.charCodeAt(i), 16777619);
  const extension = url.split('?')[0].match(/\.(png|jpe?g|webp|gif|mp3|m4a|wav|ogg)$/i)?.[0] || '.bin';
  return `${(hash >>> 0).toString(16)}${extension.toLowerCase()}`;
};

/** Keep downloaded lesson media between app sessions. */
export async function resolveOfflineMediaUri(value?: string): Promise<string> {
  if (!value) return '';
  const url = absoluteUrl(value);
  if (Platform.OS === 'web' || !folder) return url;
  const existing = inFlight.get(url);
  if (existing) return existing;
  const operation = (async () => {
    const destination = `${folder}${fileName(url)}`;
    try {
      const info = await FileSystem.getInfoAsync(destination);
      if (info.exists && (!('size' in info) || !info.size || info.size > 0)) return destination;
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
      const result = await FileSystem.downloadAsync(url, destination);
      if (result.status >= 200 && result.status < 300) return result.uri;
    } catch { /* The online URL remains usable if downloading fails. */ }
    return url;
  })();
  inFlight.set(url, operation);
  try { return await operation; } finally { inFlight.delete(url); }
}

export function useOfflineMediaUri(value?: string): string {
  const [uri, setUri] = useState(value ? absoluteUrl(value) : '');
  useEffect(() => {
    let active = true;
    setUri(value ? absoluteUrl(value) : '');
    void resolveOfflineMediaUri(value).then((resolved) => { if (active) setUri(resolved); });
    return () => { active = false; };
  }, [value]);
  return uri;
}

export async function prefetchContentMedia(data: unknown): Promise<void> {
  if (Platform.OS === 'web' || !folder) return;
  const urls = new Set<string>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (/^(imageUrl|secondaryImageUrl|audioUrl|bgmUrl)$/.test(key) && typeof child === 'string' && child && !child.startsWith('bundled:')) urls.add(child);
      else if (typeof child === 'object') visit(child);
    }
  };
  visit(data);
  const entries = [...urls];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(3, entries.length) }, async () => {
    while (next < entries.length) await resolveOfflineMediaUri(entries[next++]);
  }));
}
