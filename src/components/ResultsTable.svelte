<script>
    import { playRecord, queue } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    export let results = [];
    export let resultCount = 0;

    let rows = [];
    $: rows = results.map(r => ({ ...r }));

    function handleQueue(e, record) {
        e.stopPropagation();
        queue.update(q => [record, ...q]);
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
</script>

{#if resultCount > 0}
    <div class="result-header">{resultCount} Results</div>
{/if}
<div class="results-scroll">
    <table class="results-table">
        <thead>
            <tr>
                <th>Artist</th>
                <th>Title</th>
                <th>Album</th>
                <th>Added By</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each rows as row, i}
                <tr class="tablulated-result" on:click={() => playRecord(row)}>
                    <td class="result-artist">{row.artists}</td>
                    <td class="result-title">{row.title}</td>
                    <td class="result-album">{row.album}</td>
                    <td>{row.added_by}</td>
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

<style>
    .result-header {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    .results-scroll {
        height: 100%;
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
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
    }
    .tablulated-result {
        cursor: pointer;
    }
    .tablulated-result:hover {
        background: #efefed;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    }
    .tablulated-result td {
        padding: 6px 8px;
        vertical-align: middle;
    }
    .result-artist { width: 15%; }
    .result-title { width: 30%; }
    .result-album { width: 30%; }
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
</style>
