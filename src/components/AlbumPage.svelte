<script>
    import { playRecord, queue } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    export let album;
    export let onBack;
    export let onArtistClick = null;

    let rows = [];
    $: rows = (album.tracks ?? []).map(t => ({ ...t }));

    function handleQueue(e, row) {
        e.stopPropagation();
        queue.update(q => [row, ...q]);
    }

    async function handleLibraryToggle(e, row, i) {
        e.stopPropagation();
        if (rows[i].in_library) {
            await removeFromLibrary(row.uri);
            rows[i] = { ...rows[i], in_library: false };
        } else {
            await addToLibrary(row.uri);
            rows[i] = { ...rows[i], in_library: true };
        }
        rows = [...rows];
    }
</script>

<div class="album-page">
    <div class="album-header">
        <button class="back-btn" on:click={onBack}>← Back</button>
        <div class="album-meta">
            {#if album.cover_url}
                <img class="album-art" src={album.cover_url} alt="" />
            {:else}
                <div class="album-art album-art-placeholder"></div>
            {/if}
            <div class="album-info">
                <h2 class="album-title">{album.title}</h2>
                <div class="album-artists">
                  {#each album.artists as artist, ai}
                    {#if onArtistClick}
                      <button class="artist-link" on:click={() => onArtistClick(artist.uri)}>{artist.name}</button>
                    {:else}
                      {artist.name}
                    {/if}{#if ai < album.artists.length - 1}, {/if}
                  {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="tracks-scroll">
        <table class="tracks-table">
            <thead>
                <tr>
                    <th class="col-img"></th>
                    <th>Artist</th>
                    <th>Title</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each rows as row, i}
                    <tr class="track-row" on:click={() => playRecord(row, rows)}>
                        <td class="col-img">
                            {#if row.cover_url}
                                <img class="preview-img" src={row.cover_url} alt="" />
                            {:else}
                                <div class="preview-img preview-placeholder"></div>
                            {/if}
                        </td>
                        <td class="track-artist">
                          {#each row.artists as artist, ai}
                            {#if onArtistClick}
                              <button class="artist-link" on:click={(e) => { e.stopPropagation(); onArtistClick(artist.uri); }}>{artist.name}</button>
                            {:else}
                              {artist.name}
                            {/if}{#if ai < row.artists.length - 1}, {/if}
                          {/each}
                        </td>
                        <td class="track-title">{row.title}</td>
                        <td class="button-col">
                            <button on:click={(e) => handleQueue(e, row)}>queue</button>
                            <button class="library-btn" on:click={(e) => handleLibraryToggle(e, row, i)}>
                                {row.in_library ? '-' : '+'}
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .album-page {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .album-header {
        padding: 12px 0 16px 0;
        flex-shrink: 0;
    }
    .back-btn {
        background: none;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 16px;
    }
    .back-btn:hover {
        background: #f0f0f0;
    }
    .album-meta {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .album-art {
        width: 120px;
        height: 120px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
    }
    .album-art-placeholder {
        background: #ddd;
    }
    .album-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .album-title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
    }
    .album-artists {
        font-size: 14px;
        color: #555;
    }
    .tracks-scroll {
        flex: 1;
        overflow-y: auto;
    }
    .tracks-table {
        width: 100%;
        border-collapse: collapse;
    }
    .tracks-table thead th {
        text-align: left;
        padding: 8px;
        font-size: 12px;
        color: #666;
        font-weight: 600;
        background: #f7f7f5;
    }
    .track-row {
        cursor: pointer;
    }
    .track-row:hover {
        background: #efefed;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    }
    .track-row td {
        padding: 6px 8px;
        vertical-align: middle;
    }
    .col-img {
        width: 40px;
        padding: 4px 4px 4px 8px;
    }
    .preview-img {
        display: block;
        width: 32px;
        height: 32px;
        border-radius: 2px;
        object-fit: cover;
    }
    .preview-placeholder {
        background: #ddd;
    }
    .track-artist { width: 20%; }
    .track-title { width: 40%; }
    .button-col {
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 3px;
    }
    .button-col button {
        width: 70px;
        padding: 6px 10px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: #333;
        color: white;
        font-size: 13px;
    }
    .button-col button.library-btn {
        width: 36px;
    }
    .button-col button:hover { background: #555; }
    .artist-link {
        background: none;
        border: none;
        padding: 0;
        font-size: inherit;
        color: inherit;
        cursor: pointer;
        text-decoration: underline;
        text-decoration-color: transparent;
        transition: text-decoration-color 0.15s;
    }
    .artist-link:hover {
        text-decoration-color: currentColor;
    }
</style>
