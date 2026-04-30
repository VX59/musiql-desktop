<script>
    import { playRecord, queue } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    export let results = [];
    export let resultCount = 0;

    let rows = [];
    $: rows = results.map(r => ({ ...r }));

    let openMenuIndex = null;

    function toggleMenu(i) {
        openMenuIndex = openMenuIndex === i ? null : i;
    }

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

    function handleReportRerecord(record) {
        openMenuIndex = null;
        // TODO: wire up API
        console.log('Report for re-recording:', record.uri);
    }

    function handleFixMetadata(record) {
        openMenuIndex = null;
        // TODO: wire up API
        console.log('Fix metadata:', record.uri);
    }
</script>

<svelte:window on:click={() => (openMenuIndex = null)} />

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
                <th></th>
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
                        <div class="btn-left">
                            <button on:click={(e) => handleQueue(e, row)}>queue</button>
                            <button class="library-btn" on:click={(e) => handleLibraryToggle(e, row, i)}>
                                {row.in_library ? '-' : '+'}
                            </button>
                        </div>
                        <div class="more-wrapper">
                            <button class="more-btn" on:click|stopPropagation={() => toggleMenu(i)}>⋮</button>
                            {#if openMenuIndex === i}
                                <div class="dropdown">
                                    <button on:click|stopPropagation={() => handleReportRerecord(row)}>
                                        Report for re-recording
                                    </button>
                                    <button on:click|stopPropagation={() => handleFixMetadata(row)}>
                                        Report incorrect metadata
                                    </button>
                                </div>
                            {/if}
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
        justify-content: space-between;
        gap: 4px;
    }
    .btn-left {
        display: flex;
        gap: 3px;
    }
    .btn-left button {
        width: 70px;
        padding: 6px 10px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: #333;
        color: white;
        font-size: 13px;
    }
    .btn-left button.library-btn {
        width: 36px;
    }
    .btn-left button:hover { background: #555; }

    .more-wrapper {
        position: relative;
        display: inline-block;
    }
    .more-btn {
        width: 36px;
        padding: 6px 10px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: #333;
        color: white;
        font-size: 13px;
    }
    .more-btn:hover { background: #555; }

    .dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 100;
        min-width: 180px;
        overflow: hidden;
    }
    .dropdown button {
        display: block;
        width: 100%;
        padding: 10px 14px;
        border: none;
        background: none;
        text-align: left;
        font-size: 13px;
        color: #333;
        cursor: pointer;
        white-space: nowrap;
    }
    .dropdown button:hover {
        background: #f5f5f5;
    }
</style>
