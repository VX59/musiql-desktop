<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { searchAdvanced } from '../api/musiql.js';
    import { currentHistId, getProgress } from '../stores/player.js';
    import SearchBar from './SearchBar.svelte';
    import ResultsTable from './ResultsTable.svelte';
    import QueueModal from './QueueModal.svelte';
    import AddMusicModal from './AddMusicModal.svelte';
    import NavBar from './NavBar.svelte';
    import Player from './Player.svelte';

    let searchResults = null;
    let queueOpen = false;
    let addMusicOpen = false;

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

<div class="page">
    <NavBar
        onLibrary={loadLibrary}
        onQueue={() => (queueOpen = !queueOpen)}
        onAddMusic={() => (addMusicOpen = !addMusicOpen)}
    />
    <div class="container">
        <SearchBar onSearch={handleSearch} />
        {#if addMusicOpen}
            <div class="card card-queue">
                <AddMusicModal />
            </div>
        {/if}
        {#if queueOpen}
            <div class="card card-queue">
                <QueueModal />
            </div>
        {/if}
        {#if searchResults}
            <div class="card">
                <ResultsTable results={searchResults.results} resultCount={searchResults.num_results} />
            </div>
        {/if}
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
    }
    .card {
        flex: 1;
        min-height: 0;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        padding: 16px;
        margin-bottom: 12px;
        overflow-y: auto;
    }
    .card-queue {
        flex: none;
        max-height: 40vh;
    }
</style>
