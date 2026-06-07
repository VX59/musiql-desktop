<script>
    import { queue, playRecord } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    export let onAlbumClick = null;
    export let onArtistClick = null;

    let rows = [];
    $: rows = $queue.map(r => ({ ...r }));

    let draggedIndex = null;
    let dragOverIndex = null;

    function handleRemove(e, i) {
        e.stopPropagation();
        queue.update(q => q.filter((_, idx) => idx !== i));
    }

    async function handleLibraryToggle(e, record, i) {
        e.stopPropagation();
        if (rows[i].in_library) {
            await removeFromLibrary(record.uri);
            rows[i] = { ...rows[i], in_library: false };
        } else {
            await addToLibrary(record.uri);
            rows[i] = { ...rows[i], in_library: true };
        }
        rows = [...rows];
    }

    function dragStart(e, i) {
        draggedIndex = i;
        e.dataTransfer.effectAllowed = 'move';
    }

    function dragOver(e, i) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dragOverIndex = i;
    }

    function dragEnd() {
        draggedIndex = null;
        dragOverIndex = null;
    }

    function drop(e, i) {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === i) {
            draggedIndex = null;
            dragOverIndex = null;
            return;
        }
        queue.update(q => {
            const reordered = [...q];
            const [moved] = reordered.splice(draggedIndex, 1);
            reordered.splice(i, 0, moved);
            return reordered;
        });
        draggedIndex = null;
        dragOverIndex = null;
    }
</script>

{#if rows.length > 0}
    <div class="result-header">{rows.length} in Queue</div>
{/if}
<div class="results-scroll">
    <table class="results-table">
        <thead>
            <tr>
                <th></th>
                <th class="col-img"></th>
                <th>Artist</th>
                <th>Title</th>
                <th>Album</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each rows as row, i}
                <tr
                    class="tablulated-result"
                    class:dragging={draggedIndex === i}
                    class:drag-over={dragOverIndex === i && draggedIndex !== i}
                    draggable="true"
                    on:click={() => playRecord(row)}
                    on:dragstart={(e) => dragStart(e, i)}
                    on:dragover={(e) => dragOver(e, i)}
                    on:dragleave={() => dragOverIndex = null}
                    on:drop={(e) => drop(e, i)}
                    on:dragend={dragEnd}
                >
                    <td class="drag-handle" on:click|stopPropagation>⠿</td>
                    <td class="col-img">
                        {#if row.preview_url}
                            <img class="preview-img" src={row.preview_url} alt="" />
                        {:else}
                            <div class="preview-img preview-placeholder"></div>
                        {/if}
                    </td>
                    <td class="result-artist">
                        {#each (row.artists ?? []) as artist, ai}
                            {#if onArtistClick}
                                <button class="album-link" on:click={(e) => { e.stopPropagation(); onArtistClick(artist.uri); }}>{artist.name}</button>
                            {:else}
                                {artist.name}
                            {/if}{#if ai < (row.artists ?? []).length - 1}, {/if}
                        {/each}
                    </td>
                    <td class="result-title">{row.title}</td>
                    <td class="result-album">
                        {#if onAlbumClick && row.album_uri}
                            <button class="album-link" on:click={(e) => { e.stopPropagation(); onAlbumClick(row.album_uri); }}>{row.album}</button>
                        {:else}
                            {row.album}
                        {/if}
                    </td>
                    <td class="button-col">
                        <div class="btn-left">
                            <button on:click={(e) => handleRemove(e, i)}>remove</button>
                            <button class="library-btn" on:click={(e) => handleLibraryToggle(e, row, i)}>
                                {row.in_library ? '-' : '+'}
                            </button>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .result-header {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    .results-scroll {
        max-height: 400px;
        overflow-y: auto;
        margin-top: 8px;
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
        padding: 8px;
        font-size: 12px;
        color: #666;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
    }
    .tablulated-result {
        cursor: pointer;
    }
    .tablulated-result:hover {
        background: #e9e9e7;
    }
    .tablulated-result:hover td {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.08), 1px 0 0 rgba(0,0,0,0.09);
    }
    .tablulated-result:hover td:last-child {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
    }
    .tablulated-result td {
        padding: 6px 8px;
        vertical-align: middle;
    }
    .tablulated-result.dragging {
        opacity: 0.4;
    }
    .tablulated-result.drag-over {
        border-top: 2px solid #333;
    }
    .drag-handle {
        width: 16px;
        color: #bbb;
        cursor: grab;
        user-select: none;
        font-size: 14px;
        padding-right: 4px;
    }
    .drag-handle:active { cursor: grabbing; }
    .col-img {
        width: 40px;
        padding: 4px;
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
    .result-artist { width: 30%; }
    .button-col {
        white-space: nowrap;
    }
    .btn-left {
        display: flex;
        gap: 3px;
    }
    .btn-left button {
        width: 70px;
        padding: 6px 10px;
        border: 1px solid #111;
        border-radius: 2px;
        cursor: pointer;
        background: linear-gradient(to bottom, #4a4a4a 0%, #252525 100%);
        color: white;
        font-size: 13px;
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.10),
            0 2px 4px rgba(0,0,0,0.45),
            0 1px 0 rgba(255,255,255,0.08);
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        transition: background 0.1s, box-shadow 0.1s;
    }
    .btn-left button.library-btn {
        width: 36px;
    }
    .btn-left button:hover {
        background: linear-gradient(to bottom, #5a5a5a 0%, #333 100%);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.13),
            0 3px 6px rgba(0,0,0,0.5),
            0 1px 0 rgba(255,255,255,0.08);
    }
    .btn-left button:active {
        background: linear-gradient(to bottom, #1e1e1e 0%, #3a3a3a 100%);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06);
        transform: translateY(1px);
    }
    .album-link {
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
    .album-link:hover {
        text-decoration-color: currentColor;
    }
</style>
