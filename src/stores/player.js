import { writable, get } from 'svelte/store';
import { logEngagement, serveMusic, sampleNext } from '../api/musiql.js';

export const queue = writable([]);
export const queueBacklog = writable([]);
export const currentHistId = writable(0);
export const currentTrack = writable(null);
export const lastUri = writable(null);
export const playHistory = writable([]);

let audioEl = null;
const QUEUE_SIZE = 10;

export function registerAudioElement(el) {
    audioEl = el;
}

export function getProgress() {
    if (!audioEl || get(currentHistId) === 0) return 1.0;
    const track = get(currentTrack);
    const durMs = track?.duration_ms;
    if (durMs > 0) return Math.min(audioEl.currentTime / (durMs / 1000), 1.0);
    const dur = audioEl.duration;
    return dur > 0 ? audioEl.currentTime / dur : 1.0;
}

async function _loadAndPlay(record) {
    const histId = get(currentHistId);
    await logEngagement(histId, getProgress());

    const res = await serveMusic(record.uri);
    const newHistId = res.headers.get('X-history-id');
    currentHistId.set(newHistId ? parseInt(newHistId) : 0);
    currentTrack.set(record);
    lastUri.set(record.uri);

    if (res.headers.get('Content-Type') === 'application/json') {
        const { url } = await res.json();
        if (audioEl) {
            audioEl.src = url;
            audioEl.play();
        }
    }
}

export async function playRecord(record, contextTracks = null) {
    const current = get(currentTrack);
    if (current) playHistory.update(h => [...h, current]);
    if (contextTracks && contextTracks.length > 0 && get(queue).length === 0) {
        const idx = contextTracks.findIndex(t => t.uri === record.uri);
        const remaining = idx >= 0 ? contextTracks.slice(idx + 1, idx + 1 + QUEUE_SIZE) : [];
        if (remaining.length > 0) {
            queue.set(remaining);
        }
    }
    await _loadAndPlay(record);
}

export async function playPrevious() {
    const history = get(playHistory);
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    playHistory.update(h => h.slice(0, -1));
    await _loadAndPlay(prev);
}

export async function playNextFromQueue() {
    const uri = get(lastUri);

    let backlog = get(queueBacklog);
    if (backlog.length === 0) {
        try {
            backlog = await sampleNext(uri);
            queueBacklog.set(backlog);
        } catch (err) {
            console.error('[playNextFromQueue] sampleNext failed:', err);
            backlog = [];
        }
    }

    const q = get(queue);
    const newQ = [...q];
    const newBacklog = [...backlog];
    while (newQ.length < QUEUE_SIZE && newBacklog.length > 0) {
        newQ.push({ ...newBacklog.shift(), in_library: true });
    }
    queue.set(newQ);
    queueBacklog.set(newBacklog);

    if (newQ.length === 0) return;
    const [next, ...rest] = newQ;
    queue.set(rest);
    await playRecord(next);
}
