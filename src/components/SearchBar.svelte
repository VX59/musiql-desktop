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
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: #333;
        color: white;
        transition: background 0.2s ease;
    }
    .search-bar button:hover { background: #555; }
</style>
