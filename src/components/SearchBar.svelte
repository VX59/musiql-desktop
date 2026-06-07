<script>
    export let onSearch;

    let searchTerm = '';

    function handleSearch() {
        onSearch(searchTerm);
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') handleSearch();
    }
</script>

<div class="search-bar">
    <input
        bind:value={searchTerm}
        type="text"
        placeholder="Search titles, artists or albums"
        on:keydown={handleKeydown}
    />
    <button on:click={handleSearch}>Search</button>
</div>

<style>
    .search-bar {
        display: flex;
        gap: 2px;
        width: 100%;
        margin-bottom: 12px;
    }
    .search-bar input {
        flex: 1;
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ddd;
        border-radius: 2px;
        outline: none;
        transition: all 0.2s ease;
    }
    .search-bar input:focus {
        border-color: #666;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
    }
    .search-bar button {
        padding: 10px;
        font-size: 14px;
        border: 1px solid #111;
        border-radius: 2px;
        cursor: pointer;
        background: linear-gradient(to bottom, #4a4a4a 0%, #252525 100%);
        color: white;
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.10),
            0 2px 4px rgba(0,0,0,0.45),
            0 1px 0 rgba(255,255,255,0.08);
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        transition: background 0.1s, box-shadow 0.1s;
    }
    .search-bar button:hover {
        background: linear-gradient(to bottom, #5a5a5a 0%, #333 100%);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.13),
            0 3px 6px rgba(0,0,0,0.5),
            0 1px 0 rgba(255,255,255,0.08);
    }
    .search-bar button:active {
        background: linear-gradient(to bottom, #1e1e1e 0%, #3a3a3a 100%);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06);
        transform: translateY(1px);
    }
</style>
