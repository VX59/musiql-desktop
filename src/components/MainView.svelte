<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { searchAdvanced } from '../api/musiql.js';
    import { currentHistId, getProgress } from '../stores/player.js';
    import SearchBar from './SearchBar.svelte';
    import ResultsTable from './ResultsTable.svelte';
    import QueueModal from './QueueModal.svelte';
    import AddMusicModal from './AddMusicModal.svelte';
    import UploadsModal from './UploadsModal.svelte';
    import NavBar from './NavBar.svelte';
    import Player from './Player.svelte';

    let searchResults = null;
    let queueOpen = false;
    let addMusicOpen = false;
    let uploadsOpen = false;
    let containerEl;

    // heights[id] = explicit px height; null = use default min-height
    let heights = {};
    let activeDrag = null; // { topId, bottomId, startY, startTopH, startBottomH }

    $: panels = [
        uploadsOpen   && { id: 'uploads',  defaultH: 280 },
        addMusicOpen  && { id: 'addMusic', defaultH: 280 },
        queueOpen     && { id: 'queue',    defaultH: 280 },
        searchResults && { id: 'results',  defaultH: 320 },
    ].filter(Boolean);

    function startDrag(e, topId, bottomId) {
        e.preventDefault();
        const topEl    = containerEl.querySelector(`[data-panel="${topId}"]`);
        const bottomEl = containerEl.querySelector(`[data-panel="${bottomId}"]`);
        activeDrag = {
            topId, bottomId,
            startY:      e.clientY,
            startTopH:   topEl.getBoundingClientRect().height,
            startBottomH: bottomEl.getBoundingClientRect().height,
        };
    }

    function onMouseMove(e) {
        if (!activeDrag) return;
        const dy = e.clientY - activeDrag.startY;
        heights = {
            ...heights,
            [activeDrag.topId]:    Math.max(80, activeDrag.startTopH + dy),
            [activeDrag.bottomId]: Math.max(80, activeDrag.startBottomH - dy),
        };
    }

    function stopDrag() { activeDrag = null; }

    // Reset stored heights for panels that close so they get defaults when reopened
    $: if (!addMusicOpen) { const { addMusic, results, ...rest } = heights; heights = rest; }
    $: if (!queueOpen)    { const { queue,    results, ...rest } = heights; heights = rest; }
    $: if (!uploadsOpen)  { const { uploads,  results, ...rest } = heights; heights = rest; }

    async function loadLibrary() {
        searchResults = await searchAdvanced('@library', 0, 0);
    }

    async function handleSearch(term) {
        if (!term) return;
        searchResults = await searchAdvanced(term, get(currentHistId), getProgress());
    }

    onMount(() => {
        window.library = loadLibrary;
        loadLibrary();
    });
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={stopDrag} />

<div class="page">
    <NavBar
        onLibrary={loadLibrary}
        onQueue={() => (queueOpen = !queueOpen)}
        onAddMusic={() => (addMusicOpen = !addMusicOpen)}
        onUploads={() => (uploadsOpen = !uploadsOpen)}
        {queueOpen}
        {addMusicOpen}
        {uploadsOpen}
    />
    <div class="container" bind:this={containerEl}>
        <SearchBar onSearch={handleSearch} />
        {#each panels as panel, i}
            <div
                class="card"
                class:card-fill={panel.id === 'results' && heights[panel.id] == null}
                data-panel={panel.id}
                style={heights[panel.id] != null
                    ? `height: ${heights[panel.id]}px`
                    : panel.id !== 'results' ? `height: ${panel.defaultH}px` : ''}
            >
                {#if panel.id === 'addMusic'}<AddMusicModal />{/if}
                {#if panel.id === 'queue'}<QueueModal />{/if}
                {#if panel.id === 'uploads'}<UploadsModal />{/if}
                {#if panel.id === 'results'}
                    <ResultsTable results={searchResults.results} resultCount={searchResults.num_results} />
                {/if}
            </div>
            {#if i < panels.length - 1}
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <hr
                    class="drag-handle"
                    class:active={activeDrag?.topId === panel.id}
                    aria-label="Resize panels"
                    on:mousedown={(e) => startDrag(e, panel.id, panels[i + 1].id)}
                />
            {/if}
        {/each}
    </div>
</div>
<Player onQueue={() => (queueOpen = !queueOpen)} {queueOpen} />

<style>
    .page {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 60px);
    }
    .container {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 16px 16px 0 16px;
        min-height: 0;
        overflow: hidden;
    }
    .card {
        flex-shrink: 0;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        padding: 16px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .card-fill {
        flex: 1;
        min-height: 200px;
    }
    hr.drag-handle {
        flex-shrink: 0;
        height: 2px;
        margin: 4px 0;
        border: none;
        border-radius: 1px;
        background: #e8e8e8;
        cursor: row-resize;
        transition: background 0.15s, height 0.1s;
    }
    hr.drag-handle:hover, hr.drag-handle.active {
        height: 3px;
        background: #bbb;
    }
</style>
