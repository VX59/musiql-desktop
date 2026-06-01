<script>
    import { externalSearch, requestMusic } from '../api/musiql.js';

    const SOURCE_TYPES = [
        { value: 'track',    label: 'Tracks',    enabled: true },
        { value: 'album',    label: 'Albums',    enabled: true },
        { value: 'playlist', label: 'Playlists', enabled: true },
    ];

    const URI_TYPES = ['track', 'album', 'playlist'];

    // mode: 'search' | 'uri'
    let mode = 'search';

    // search mode state
    let searchTerm = '';
    let selectedTypes = ['track'];
    let tracks = [];
    let albums = [];
    let playlists = [];

    // uri mode state
    let uriInput = '';
    let uriType = 'track';
    let uriRequested = false;
    let uriLoading = false;

    let requested = {};
    let loading = false;
    let error = null;

    $: hasResults = tracks.length > 0 || albums.length > 0 || playlists.length > 0;

    function switchMode(m) {
        mode = m;
        error = null;
    }

    function toggleType(value) {
        if (selectedTypes.includes(value)) {
            selectedTypes = selectedTypes.filter(t => t !== value);
        } else {
            selectedTypes = [...selectedTypes, value];
        }
    }

    async function handleSearch() {
        if (!searchTerm.trim() || selectedTypes.length === 0) return;
        loading = true;
        error = null;
        tracks = [];
        albums = [];
        playlists = [];
        try {
            const data = await externalSearch(searchTerm.trim(), selectedTypes);
            tracks = data.tracks ?? [];
            albums = data.albums ?? [];
            playlists = data.playlists ?? [];
        } catch (e) {
            error = `Search failed (${e.message})`;
        } finally {
            loading = false;
        }
    }

    async function handleRequest(e, uri, type, name, association) {
        e.stopPropagation();
        try {
            await requestMusic(uri, type, name, association);
            requested = { ...requested, [uri]: true };
        } catch (e) {
            error = `Request failed (${e.message})`;
        }
    }

    const BASE62_RE = /^[0-9A-Za-z]{22}$/;

    async function handleUriRequest() {
        const trimmed = uriInput.trim();
        if (!trimmed) return;
        if (!BASE62_RE.test(trimmed)) {
            error = 'Invalid URI — must be a 22-character base62 ID (e.g. 3NMZBauh9NhD6nmdZCda6r)';
            return;
        }
        uriLoading = true;
        error = null;
        try {
            await requestMusic(trimmed, uriType, '—', '—');
            uriRequested = true;
            uriInput = '';
        } catch (e) {
            error = `Request failed (${e.message})`;
        } finally {
            uriLoading = false;
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') handleSearch();
    }

    function handleUriKeydown(e) {
        if (e.key === 'Enter') handleUriRequest();
    }
</script>

<div class="mode-tabs">
    <button class="mode-tab" class:active={mode === 'search'} on:click={() => switchMode('search')}>search</button>
    <button class="mode-tab" class:active={mode === 'uri'} on:click={() => switchMode('uri')}>uri</button>
</div>

{#if mode === 'search'}
    <div class="search-row">
        <input
            class="search-input"
            type="text"
            placeholder="Search titles, albums or playlists"
            bind:value={searchTerm}
            on:keydown={handleKeydown}
        />
        <div class="seg-group">
            {#each SOURCE_TYPES as t}
                <button
                    class="seg-btn"
                    class:active={selectedTypes.includes(t.value)}
                    disabled={!t.enabled}
                    on:click={() => toggleType(t.value)}
                >{t.label}</button>
            {/each}
        </div>
        <button class="search-btn" on:click={handleSearch} disabled={loading}>
            {loading ? '...' : 'search'}
        </button>
    </div>
{:else}
    <div class="uri-row">
        <input
            class="search-input"
            type="text"
            placeholder="Base 62 Spotify URI"
            bind:value={uriInput}
            on:keydown={handleUriKeydown}
        />
        <div class="seg-group">
            {#each URI_TYPES as t}
                <button
                    class="seg-btn"
                    class:active={uriType === t}
                    on:click={() => uriType = t}
                >{t}</button>
            {/each}
        </div>
        <button
            class="search-btn"
            class:requested={uriRequested}
            on:click={handleUriRequest}
            disabled={uriLoading || uriRequested}
        >
            {uriLoading ? '...' : uriRequested ? 'requested' : 'request'}
        </button>
    </div>
{/if}

{#if error}
    <div class="error">{error}</div>
{/if}

{#if mode === 'search' && hasResults}
    <div class="results-scroll">

        {#if tracks.length > 0}
            <div class="type-header">Tracks <span class="type-count">{tracks.length}</span></div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Title</th>
                        <th>Album</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each tracks as track}
                        <tr class="result-row">
                            <td class="col-artist">{track.artists.join(', ')}</td>
                            <td class="col-title">{track.title}</td>
                            <td class="col-album">{track.album}</td>
                            <td class="col-action">
                                <button
                                    class="request-btn"
                                    class:requested={requested[track.external_uri]}
                                    disabled={requested[track.external_uri]}
                                    on:click={(e) => handleRequest(e, track.external_uri, 'track', track.title, track.artists.join(', '))}
                                >
                                    {requested[track.external_uri] ? 'requested' : 'request'}
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}

        {#if albums.length > 0}
            <div class="type-header">Albums <span class="type-count">{albums.length}</span></div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Album</th>
                        <th>Tracks</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each albums as album}
                        <tr class="result-row">
                            <td class="col-artist">{album.artists.join(', ')}</td>
                            <td class="col-title">{album.title}</td>
                            <td>{album.tracks}</td>
                            <td class="col-action">
                                <button
                                    class="request-btn"
                                    class:requested={requested[album.external_uri]}
                                    disabled={requested[album.external_uri]}
                                    on:click={(e) => handleRequest(e, album.external_uri, 'album', album.title, album.artists.join(', '))}
                                >
                                    {requested[album.external_uri] ? 'requested' : 'request'}
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}

        {#if playlists.length > 0}
            <div class="type-header">Playlists <span class="type-count">{playlists.length}</span></div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Tracks</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each playlists as playlist}
                        <tr class="result-row">
                            <td class="col-title">{playlist.title}</td>
                            <td>{playlist.owner}</td>
                            <td>{playlist.items}</td>
                            <td class="col-action">
                                <button
                                    class="request-btn"
                                    class:requested={requested[playlist.external_uri]}
                                    disabled={requested[playlist.external_uri]}
                                    on:click={(e) => handleRequest(e, playlist.external_uri, 'playlist', playlist.title, playlist.owner)}
                                >
                                    {requested[playlist.external_uri] ? 'requested' : 'request'}
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}

    </div>
{/if}

<style>
    .mode-tabs {
        display: flex;
        gap: 2px;
        margin-bottom: 10px;
    }
    .mode-tab {
        padding: 5px 14px;
        border: 1px solid #ccc;
        border-radius: 2px;
        background: #f7f7f5;
        color: #555;
        font-size: 13px;
        cursor: pointer;
    }
    .mode-tab.active {
        background: #333;
        color: #fff;
        border-color: #333;
    }
    .mode-tab:hover:not(.active) { background: #efefed; }
    .search-row, .uri-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    .search-input {
        flex: 1;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 14px;
        outline: none;
    }
    .search-input:focus { border-color: #333; }
    .seg-group {
        display: flex;
    }
    .seg-btn {
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-right: none;
        background: #f7f7f5;
        color: #555;
        font-size: 13px;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
    }
    .seg-btn:first-child { border-radius: 2px 0 0 2px; }
    .seg-btn:last-child  { border-radius: 0 2px 2px 0; border-right: 1px solid #ccc; }
    .seg-btn.active {
        background: #333;
        color: #fff;
        border-color: #333;
    }
    .seg-btn.active + .seg-btn { border-left-color: #333; }
    .seg-btn:disabled { color: #bbb; cursor: default; }
    .seg-btn:hover:not(.active):not(:disabled) { background: #efefed; }
    .search-btn {
        padding: 8px 14px;
        border: none;
        border-radius: 2px;
        background: #333;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        white-space: nowrap;
    }
    .search-btn:hover:not(:disabled) { background: #555; }
    .search-btn:disabled { opacity: 0.5; cursor: default; }
    .search-btn.requested { background: #888; }
    .error {
        font-size: 13px;
        color: #c00;
        margin-bottom: 8px;
    }
    .results-scroll {
        overflow-y: auto;
        margin-top: 8px;
    }
    .results-scroll > * + * { margin-top: 12px; }
    .type-header {
        font-size: 13px;
        font-weight: 600;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 0;
        border-bottom: 1px solid #e5e5e5;
    }
    .type-count {
        font-weight: 400;
        color: #888;
        text-transform: none;
        letter-spacing: 0;
    }
    .results-table {
        width: 100%;
        border-collapse: collapse;
    }
    .results-table thead th {
        position: sticky;
        top: 0;
        background: #f7f7f5;
        z-index: 2;
        text-align: left;
        padding: 6px 8px;
        font-size: 12px;
        color: #666;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
    }
    .result-row td {
        padding: 6px 8px;
        vertical-align: middle;
    }
    .result-row:hover { background: #efefed; }
    .col-artist { width: 20%; }
    .col-title  { width: 35%; }
    .col-album  { width: 35%; }
    .col-action { white-space: nowrap; }
    .request-btn {
        width: 78px;
        padding: 6px 10px;
        border: none;
        border-radius: 2px;
        background: #333;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
    }
    .request-btn:hover:not(:disabled) { background: #555; }
    .request-btn.requested { background: #888; cursor: default; }
</style>
