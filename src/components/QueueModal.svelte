<script>
    import { queue, playRecord } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    let rows = [];
    $: rows = $queue.map(r => ({ ...r }));

    function handleRemove(e, record) {
        e.stopPropagation();
        queue.update(q => q.filter(item => item.uri !== record.uri));
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

{#if rows.length > 0}
    <div class="result-header">{rows.length} in Queue</div>
{/if}
<div class="results-scroll">
    <table class="results-table">
        <tbody>
            {#each rows as row, i}
                <tr class="tablulated-result" on:click={() => playRecord(row)}>
                    <td class="result-artist">{row.artists}</td>
                    <td class="result-title">{row.title}</td>
                    <td class="result-album">{row.album}</td>
                    <td class="button-col">
                        <div class="btn-left">
                            <button class="library-btn" on:click={(e) => handleLibraryToggle(e, row, i)}>
                                {row.in_library ? '-' : '+'}
                            </button>
                            <button on:click={(e) => handleRemove(e, row)}>remove</button>
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
    .result-artist { width: 30%; }
    .button-col {
        text-align: right;
        white-space: nowrap;
    }
    .btn-left {
        display: flex;
        gap: 3px;
        justify-content: flex-end;
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
</style>
