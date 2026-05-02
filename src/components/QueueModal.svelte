<script>
    import { queue, playRecord } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    let rows = [];
    $: rows = $queue.map(r => ({ ...r }));

    let draggedIndex = null;
    let dragOverIndex = null;

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
                    <td class="result-artist">{row.artists}</td>
                    <td class="result-title">{row.title}</td>
                    <td class="result-album">{row.album}</td>
                    <td class="button-col">
                        <div class="btn-left">
                            <button on:click={(e) => handleRemove(e, row)}>remove</button>
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
