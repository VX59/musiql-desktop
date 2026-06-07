<script>
    export let artist;
    export let onAlbumClick;
</script>

<div class="artist-page">
    <div class="artist-header">
        <h2 class="artist-name">{artist.artist_name}</h2>
    </div>

    <div class="albums-scroll">
        <div class="albums-grid">
            {#each artist.albums ?? [] as album}
                <button class="album-card" on:click={() => onAlbumClick(album.uri)}>
                    {#if album.cover_url}
                        <img
                            class="album-thumb"
                            src={album.cover_url}
                            alt={album.album_name}
                        />
                    {:else}
                        <div class="album-thumb album-thumb-placeholder"></div>
                    {/if}
                    <span class="album-name">{album.album_name}</span>
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .artist-page {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .artist-header {
        padding: 12px 0 0 0;
        flex-shrink: 0;
    }
    .artist-name {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #333;
    }
    .albums-scroll {
        flex: 1;
        overflow-y: auto;
    }
    .albums-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
        margin-top: 16px;
    }
    .album-card {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .album-card:hover .album-name {
        text-decoration: underline;
    }
    .album-thumb {
        width: 140px;
        height: 140px;
        object-fit: cover;
        border-radius: 4px;
        display: block;
    }
    .album-thumb-placeholder {
        background: #ddd;
    }
    .album-name {
        font-size: 13px;
        margin-top: 6px;
        text-align: center;
        cursor: pointer;
        color: #333;
        word-break: break-word;
    }
</style>
