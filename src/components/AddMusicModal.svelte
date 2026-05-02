<script>
    import { onMount } from 'svelte';
    import { externalSearch, requestMusic, getUploadJobs } from '../api/musiql.js';

    const SOURCE_TYPES = [
        { value: 'track', label: 'Tracks', enabled: true },
        { value: 'album', label: 'Albums', enabled: false },
        { value: 'playlist', label: 'Playlists', enabled: false },
    ];

    let searchTerm = '';
    let selectedTypes = ['track'];
    let tracks = [];
    let albums = [];
    let playlists = [];
    let requested = {};
    let loading = false;
    let error = null;

    let jobs = [];
    let jobsLoading = false;
    let jobsError = null;

    async function loadJobs() {
        jobsLoading = true;
        jobsError = null;
        try {
            const data = await getUploadJobs();
            jobs = Array.isArray(data) ? data : [];
        } catch (e) {
            jobsError = `Could not load jobs (${e.message})`;
        } finally {
            jobsLoading = false;
        }
    }

    onMount(loadJobs);

    $: hasResults = tracks.length > 0 || albums.length > 0 || playlists.length > 0;

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

    function handleKeydown(e) {
        if (e.key === 'Enter') handleSearch();
    }
</script>

<div class="add-music">
    <div class="section-header">Add Music</div>

    <div class="search-row">
        <input
            class="search-input"
            type="text"
            placeholder="Search titles, albums or playlists"
            bind:value={searchTerm}
            on:keydown={handleKeydown}
        />
        <div class="type-toggles">
            {#each SOURCE_TYPES as t}
                <label class="type-label" class:disabled={!t.enabled}>
                    <input
                        type="checkbox"
                        checked={selectedTypes.includes(t.value)}
                        disabled={!t.enabled}
                        on:change={() => toggleType(t.value)}
                    />
                    {t.label}
                </label>
            {/each}
        </div>
        <button class="search-btn" on:click={handleSearch} disabled={loading}>
            {loading ? '...' : 'search'}
        </button>
    </div>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if hasResults}
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
                                <td class="col-title">{album.name}</td>
                                <td>{album.total_tracks}</td>
                                <td class="col-action">
                                    <button
                                        class="request-btn"
                                        class:requested={requested[album.external_uri]}
                                        disabled={requested[album.external_uri]}
                                        on:click={(e) => handleRequest(e, album.external_uri, 'album', album.name, album.artists.join(', '))}
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
                                <td class="col-title">{playlist.name}</td>
                                <td>{playlist.owner}</td>
                                <td>{playlist.total_tracks}</td>
                                <td class="col-action">
                                    <button
                                        class="request-btn"
                                        class:requested={requested[playlist.external_uri]}
                                        disabled={requested[playlist.external_uri]}
                                        on:click={(e) => handleRequest(e, playlist.external_uri, 'playlist', playlist.name, playlist.owner)}
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

    <div class="jobs-section">
        <div class="jobs-header">
            <span class="section-header">Upload Jobs</span>
            <button class="refresh-btn" on:click={loadJobs} disabled={jobsLoading}>
                {jobsLoading ? '...' : 'refresh'}
            </button>
        </div>

        {#if jobsError}
            <div class="error">{jobsError}</div>
        {:else if jobsLoading}
            <div class="jobs-empty">Loading...</div>
        {:else if jobs.length === 0}
            <div class="jobs-empty">No jobs yet.</div>
        {:else}
            <div class="jobs-scroll">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Association</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Subtasks</th>
                            <th>Progress</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each jobs as job}
                            <tr class="result-row">
                                <td class="col-title">{job.name ?? '—'}</td>
                                <td>{job.association ?? '—'}</td>
                                <td>{job['job type'] ?? '—'}</td>
                                <td>{job['source type'] ?? '—'}</td>
                                <td class="job-status" class:status-done={job.status === 'complete'} class:status-err={job.status === 'error'}>{job.status ?? '—'}</td>
                                <td>{job.subtasks ?? '—'}</td>
                                <td>{job.progress ?? '—'}</td>
                                <td class="col-date">{job['date requested'] ? new Date(job['date requested']).toLocaleDateString() : '—'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

<style>
    .add-music {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .section-header {
        font-size: 14px;
        font-weight: 600;
    }
    .search-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .search-input {
        flex: 1;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 14px;
        outline: none;
    }
    .search-input:focus {
        border-color: #333;
    }
    .type-toggles {
        display: flex;
        gap: 10px;
    }
    .type-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        cursor: pointer;
        user-select: none;
    }
    .type-label.disabled {
        color: #aaa;
        cursor: default;
    }
    .search-btn {
        padding: 8px 14px;
        border: none;
        border-radius: 2px;
        background: #333;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
    }
    .search-btn:hover:not(:disabled) { background: #555; }
    .search-btn:disabled { opacity: 0.5; cursor: default; }
    .error {
        font-size: 13px;
        color: #c00;
    }
    .results-scroll {
        overflow-y: auto;
        max-height: 340px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
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
        background: #f7f7f5;
        text-align: left;
        padding: 6px 8px;
        font-size: 12px;
        color: #666;
        font-weight: 600;
    }
    .result-row td {
        padding: 6px 8px;
        vertical-align: middle;
    }
    .result-row:hover { background: #efefed; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); }
    .col-artist { width: 20%; }
    .col-title { width: 35%; }
    .col-album { width: 35%; }
    .col-action {
        text-align: right;
        white-space: nowrap;
    }
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
    .request-btn.requested {
        background: #888;
        cursor: default;
    }
    .jobs-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid #e5e5e5;
        padding-top: 10px;
    }
    .jobs-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .refresh-btn {
        padding: 4px 10px;
        border: 1px solid #ccc;
        border-radius: 2px;
        background: transparent;
        font-size: 12px;
        cursor: pointer;
        color: #555;
    }
    .refresh-btn:hover:not(:disabled) { background: #f0f0f0; }
    .refresh-btn:disabled { opacity: 0.5; cursor: default; }
    .jobs-empty {
        font-size: 13px;
        color: #888;
    }
    .jobs-scroll {
        overflow-y: auto;
        max-height: 200px;
    }
    .col-date {
        white-space: nowrap;
        font-size: 12px;
        color: #888;
    }
    .job-status { font-size: 13px; }
    .status-done { color: #2a7a2a; }
    .status-err { color: #c00; }
</style>
