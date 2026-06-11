<script>
    import { currentTrack } from '../stores/player.js';
    export let onArtistClick = () => {};
    export let onAlbumClick = () => {};
</script>

{#if $currentTrack}
    <div class="fullscreen-player">
        <div class="content">
            <div class="album-art">
                {#if $currentTrack.thumbnail_url}
                    <img src={$currentTrack.thumbnail_url} alt="album art" class="art-image" />
                {:else}
                    <div class="art-placeholder">
                        <span class="music-note">♪</span>
                    </div>
                {/if}
            </div>
            <button class="track-title" on:click={() => $currentTrack?.album_uri && onAlbumClick($currentTrack.album_uri)}>{$currentTrack.title ?? ''}</button>
            <div class="track-artists">
                {#each ($currentTrack.artists ?? []) as artist, i}
                    <button class="artist-name" on:click={() => onArtistClick(artist.uri)}>{artist.name}</button>{#if i < ($currentTrack.artists ?? []).length - 1}<span class="artist-sep">, </span>{/if}
                {/each}
            </div>
        </div>
    </div>
{:else}
    <div class="fullscreen-player">
        <div class="no-track">No track playing</div>
    </div>
{/if}

<style>
    .fullscreen-player {
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 24px;
        max-width: 520px;
        width: 100%;
    }

    .album-art {
        width: 400px;
        height: 400px;
        flex-shrink: 0;
        border-radius: 4px;
        overflow: hidden;
    }

    .art-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .art-placeholder {
        width: 100%;
        height: 100%;
        background: #2a2a2a;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    .music-note {
        font-size: 64px;
        color: #555;
        line-height: 1;
        user-select: none;
    }

    .track-title {
        background: none;
        border: none;
        padding: 0;
        font-size: 28px;
        font-weight: 600;
        color: #e9e9e7;
        text-align: center;
        line-height: 1.2;
        word-break: break-word;
        cursor: pointer;
    }
    .track-title:hover { text-decoration: underline; }

    .track-artists {
        font-size: 16px;
        color: #888;
        text-align: center;
        line-height: 1.4;
    }

    .artist-name {
        background: none;
        border: none;
        padding: 0;
        font-size: 16px;
        color: #888;
        cursor: pointer;
    }
    .artist-name:hover { text-decoration: underline; color: #aaa; }

    .artist-sep {
        color: #888;
    }

    .no-track {
        font-size: 16px;
        color: #555;
        text-align: center;
        user-select: none;
    }
</style>
