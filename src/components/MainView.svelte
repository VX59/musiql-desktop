<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { searchAdvanced, getAlbum, getArtist } from '../api/musiql.js';
    import { currentHistId, getProgress } from '../stores/player.js';
    import SearchBar from './SearchBar.svelte';
    import ResultsTable from './ResultsTable.svelte';
    import QueueModal from './QueueModal.svelte';
    import AddMusicModal from './AddMusicModal.svelte';
    import UploadsModal from './UploadsModal.svelte';
    import NavBar from './NavBar.svelte';
    import Player from './Player.svelte';
    import AlbumPage from './AlbumPage.svelte';
    import ArtistPage from './ArtistPage.svelte';
    import FullscreenPlayer from './FullscreenPlayer.svelte';

    let searchResults = null;
    let currentAlbum = null;
    let currentArtist = null;

    async function navigateToAlbum(albumUri) {
        currentAlbum = await getAlbum(albumUri);
        currentArtist = null;
    }

    async function navigateToArtist(artistUri) {
        currentArtist = await getArtist(artistUri);
        currentAlbum = null;
    }
    let queueOpen = false;
    let addMusicOpen = false;
    let uploadsOpen = false;
    let libraryOpen = true;
    let containerEl;

    // heights[id] = explicit px height; null = use default min-height
    let heights = {};
    let activeDrag = null; // { topId, bottomId, startY, startTopH, startBottomH }

    $: panels = [
        uploadsOpen   && { id: 'uploads',  defaultH: 280 },
        addMusicOpen  && { id: 'addMusic', defaultH: 280 },
        queueOpen     && { id: 'queue',    defaultH: 280 },
        libraryOpen   && { id: 'library',  defaultH: 320 },
    ].filter(Boolean);

    function toggleLibrary() {
        if (currentArtist || currentAlbum) {
            currentArtist = null;
            currentAlbum = null;
            libraryOpen = true;
        } else {
            libraryOpen = !libraryOpen;
        }
    }

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
    $: if (!addMusicOpen) { const { addMusic, ...rest } = heights; heights = rest; }
    $: if (!queueOpen)    { const { queue,    ...rest } = heights; heights = rest; }
    $: if (!uploadsOpen)  { const { uploads,  ...rest } = heights; heights = rest; }
    $: if (!libraryOpen) { const { library: _l, ...rest } = heights; heights = rest; }
    // When library is the only open panel, let it fill the page
    $: if (!addMusicOpen && !queueOpen && !uploadsOpen) { const { library: _l, ...rest } = heights; heights = rest; }

    async function loadLibrary() {
        currentArtist = null;
        currentAlbum = null;
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
        onLibrary={toggleLibrary}
        onQueue={() => { if (!queueOpen) { currentArtist = null; currentAlbum = null; } queueOpen = !queueOpen; }}
        onAddMusic={() => { if (!addMusicOpen) { currentArtist = null; currentAlbum = null; } addMusicOpen = !addMusicOpen; }}
        onUploads={() => { if (!uploadsOpen) { currentArtist = null; currentAlbum = null; } uploadsOpen = !uploadsOpen; }}
        {libraryOpen}
        {queueOpen}
        {addMusicOpen}
        {uploadsOpen}
    />
    <div class="container" bind:this={containerEl}>
        {#if currentArtist}
            <div class="card card-fill">
                <ArtistPage artist={currentArtist} onBack={() => currentArtist = null} onAlbumClick={navigateToAlbum} />
            </div>
        {:else if currentAlbum}
            <div class="card card-fill">
                <AlbumPage album={currentAlbum} onBack={() => currentAlbum = null} onArtistClick={navigateToArtist} />
            </div>
        {:else if !libraryOpen}
            <div class="player-view">
                {#each panels as panel, i}
                    <div
                        class="card"
                        data-panel={panel.id}
                        style={heights[panel.id] != null
                            ? `height: ${heights[panel.id]}px`
                            : `height: ${panel.defaultH}px`}
                    >
                        {#if panel.id === 'addMusic'}<AddMusicModal />{/if}
                        {#if panel.id === 'queue'}<QueueModal onAlbumClick={navigateToAlbum} onArtistClick={navigateToArtist} />{/if}
                        {#if panel.id === 'uploads'}<UploadsModal />{/if}
                    </div>
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <hr
                        class="drag-handle"
                        class:active={activeDrag?.topId === panel.id}
                        aria-label="Resize panels"
                        on:mousedown={(e) => startDrag(e, panel.id, panels[i + 1].id)}
                    />
                {/each}
                <FullscreenPlayer onArtistClick={navigateToArtist} onAlbumClick={navigateToAlbum} />
            </div>
        {:else}
            {#each panels as panel, i}
                <div
                    class="card"
                    class:card-fill={panel.id === 'library' && heights[panel.id] == null}
                    data-panel={panel.id}
                    style={heights[panel.id] != null
                        ? `height: ${heights[panel.id]}px`
                        : panel.id !== 'library' ? `height: ${panel.defaultH}px` : ''}
                >
                    {#if panel.id === 'addMusic'}<AddMusicModal />{/if}
                    {#if panel.id === 'queue'}<QueueModal onAlbumClick={navigateToAlbum} onArtistClick={navigateToArtist} />{/if}
                    {#if panel.id === 'uploads'}<UploadsModal />{/if}
                    {#if panel.id === 'library'}
                        <SearchBar onSearch={handleSearch} />
                        {#if searchResults}
                            <ResultsTable results={searchResults.results} resultCount={searchResults.num_results} onAlbumClick={navigateToAlbum} onArtistClick={navigateToArtist} />
                        {/if}
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
        {/if}
    </div>
</div>
<Player onQueue={() => (queueOpen = !queueOpen)} {queueOpen} onArtistClick={navigateToArtist} onAlbumClick={navigateToAlbum} />

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
        overflow-y: auto;
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
        flex: 1 0 320px;
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
    .player-view {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
</style>
