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

// Keep video elements alive so the browser holds decoded data in memory
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

function preloadOne(url) {
  return new Promise((resolve) => {
    if (_videoCache.has(url)) {
      resolve();
      return;
    }

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    // Keep the element alive in the map so the browser doesn't GC the decoded data
    _videoCache.set(url, video);

    const done = () => {
      _loadedCount++;
      if (_loadedCount >= _total) _allDone = true;
      notify();
      resolve();
    };

    video.addEventListener('canplaythrough', done, { once: true });
    video.addEventListener('error', done, { once: true });
    // Safety timeout — move on after 8s if a video stalls
    setTimeout(done, 8000);

    video.load();
  });
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
