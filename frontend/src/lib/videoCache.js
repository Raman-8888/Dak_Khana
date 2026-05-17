/**
 * videoCache.js
 *
 * Preloads all videos using HTMLVideoElement (reliable across all browsers/dev servers).
 * The browser's HTTP cache means subsequent visits get 304 responses (near-zero latency).
 */

const videoModules = import.meta.glob('../assets/videos/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const ALL_VIDEO_URLS = Object.values(videoModules);

// Keep blob URLs alive so the browser holds the file entirely in memory
const _videoCache = new Map();
let _preloadStarted = false;
let _callbacks = [];
let _loadedCount = 0;
const _total = ALL_VIDEO_URLS.length;
let _allDone = false;

function notify() {
  const pct = _total > 0 ? Math.round((_loadedCount / _total) * 100) : 100;
  _callbacks.forEach(cb => cb(pct, _allDone));
}

async function preloadOne(url) {
  if (_videoCache.has(url)) return;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    _videoCache.set(url, blobUrl);
  } catch (e) {
    console.error('Failed to preload video into blob', url, e);
    _videoCache.set(url, url); // fallback
  }

  _loadedCount++;
  if (_loadedCount >= _total) _allDone = true;
  notify();
}

export function getVideoSrc(originalUrl) {
  if (!originalUrl) return originalUrl;
  return _videoCache.get(originalUrl) || originalUrl;
}

/**
 * Start preloading all videos. Safe to call multiple times — only runs once.
 * @param {(pct: number, isDone: boolean) => void} onProgress
 */
export function startPreload(onProgress) {
  if (onProgress) _callbacks.push(onProgress);

  // Already finished — fire callback immediately
  if (_allDone) {
    onProgress?.(100, true);
    return;
  }

  // Already running — just subscribed above, nothing else to do
  if (_preloadStarted) return;
  _preloadStarted = true;

  // If no videos, finish immediately
  if (_total === 0) {
    _allDone = true;
    notify();
    return;
  }

  const batchSize = 3;
  (async () => {
    for (let i = 0; i < ALL_VIDEO_URLS.length; i += batchSize) {
      const batch = ALL_VIDEO_URLS.slice(i, i + batchSize);
      await Promise.all(batch.map(preloadOne));
    }
  })();
}

export function isPreloadDone() {
  return _allDone;
}

export function offProgress(cb) {
  _callbacks = _callbacks.filter(f => f !== cb);
}
