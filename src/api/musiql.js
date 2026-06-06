import { get } from 'svelte/store';
import { token } from '../stores/auth.js';
import { config } from '../config.js';

function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${get(token)}`,
    };
}

function handleUnauthorized(res) {
    if (res.status === 401) {
        token.set(null);
        return true;
    }
    return false;
}

export async function login(username, password) {
    const res = await fetch(`${config.MUSIQL_API_URL}/login/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
}

export async function searchAdvanced(term, histId, durationPlayed) {
    const res = await fetch(`${config.MUSIQL_API_URL}/search/advanced`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ search_term: term, history_id: histId, duration_played: durationPlayed }),
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
    return res.json();
}

export async function addToLibrary(uri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/library/add/${uri}`, {
        headers: headers(),
    });
    if (!res.ok) handleUnauthorized(res);
}

export async function removeFromLibrary(uri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/library/remove/${uri}`, {
        headers: headers(),
    });
    if (!res.ok) handleUnauthorized(res);
}

export async function logEngagement(histId, durationPlayed) {
    await fetch(`${config.MUSIQL_API_URL}/log/engagement/`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ history_id: histId, duration_played: durationPlayed }),
    });
}

export async function serveMusic(uri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/serve/${uri}`, {
        headers: { 'Authorization': `Bearer ${get(token)}` },
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
    return res;
}

export async function externalSearch(searchTerm, sourceTypes) {
    const res = await fetch(`${config.MUSIQL_API_URL}/external/search/`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ search_term: searchTerm, source_types: sourceTypes }),
    });
    if (!res.ok) {
        handleUnauthorized(res);
        const body = await res.json().catch(() => null);
        const detail = body?.detail;
        throw new Error(typeof detail === 'string' ? detail : detail?.message ?? res.status);
    }
    return res.json();
}

export async function requestMusic(sourceUri, sourceType, name, association) {
    const res = await fetch(`${config.MUSIQL_API_URL}/upload/music/`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(
            {
                source_uri: sourceUri,
                source_type: sourceType,
                name: name,
                association: association
            }
        ),
    });
    if (!res.ok) {
        handleUnauthorized(res);
        const body = await res.json().catch(() => null);
        const detail = body?.detail;
        throw new Error(typeof detail === 'string' ? detail : detail?.message ?? res.status);
    }
    return res.json();
}

export async function getUploadJobs() {
    const res = await fetch(`${config.MUSIQL_API_URL}/upload/jobs`, {
        headers: headers(),
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
    return res.json();
}

export async function reportRecording(uri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/report/recording`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ uri }),
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
}

export async function sampleNext(uri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/sample/${uri}`, {
        headers: { 'Authorization': `Bearer ${get(token)}` },
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
    return res.json();
}

export async function getAlbum(albumUri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/album/${albumUri}`, {
        headers: headers(),
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
    return res.json();
}

export async function getArtist(artistUri) {
    const res = await fetch(`${config.MUSIQL_API_URL}/artist/${artistUri}`, {
        headers: headers(),
    });
    if (!res.ok) { handleUnauthorized(res); throw new Error(res.status); }
    return res.json();
}
