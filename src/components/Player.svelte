<script>
    import { onMount } from 'svelte';
    import {
        currentTrack,
        registerAudioElement,
        playNextFromQueue,
        playPrevious,
    } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary, reportRecording, getSkips } from '../api/musiql.js';

    export let onQueue = () => {};
    export let queueOpen = false;
    export let onArtistClick = () => {};

    let audioEl;
    let paused = true;
    let currentTime = 0;
    let duration = 0;
    let volume = 1;
    let menuOpen = false;
    let skips = [];
    let showSkips = true;

    $: progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    $: volumeFill = volume * 100;
    $: if ($currentTrack?.uri) {
        getSkips($currentTrack.uri).then(r => { skips = r.skips; }).catch(() => { skips = []; });
    } else {
        skips = [];
    }

    function formatTime(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    function seek(e) {
        const val = parseFloat(e.target.value);
        audioEl.currentTime = val;
        currentTime = val;
    }

    function setVolume(e) {
        volume = parseFloat(e.target.value);
        audioEl.volume = volume;
    }

    function togglePlay() {
        if (audioEl.paused) audioEl.play();
        else audioEl.pause();
    }

    async function handleLibraryToggle() {
        if (!$currentTrack) return;
        if ($currentTrack.in_library) {
            await removeFromLibrary($currentTrack.uri);
            currentTrack.update(t => ({ ...t, in_library: false }));
        } else {
            await addToLibrary($currentTrack.uri);
            currentTrack.update(t => ({ ...t, in_library: true }));
        }
    }

    async function handleReportRerecord() {
        menuOpen = false;
        if (!$currentTrack) return;
        await reportRecording($currentTrack.uri);
    }

    onMount(() => {
        registerAudioElement(audioEl);

        audioEl.addEventListener('ended', playNextFromQueue);
        audioEl.addEventListener('timeupdate', () => { currentTime = audioEl.currentTime; });
        audioEl.addEventListener('loadedmetadata', () => { duration = audioEl.duration; });
        audioEl.addEventListener('play', () => { paused = false; });
        audioEl.addEventListener('pause', () => { paused = true; });

        window.sample = playNextFromQueue;

        return () => {
            audioEl.removeEventListener('ended', playNextFromQueue);
        };
    });
</script>

<svelte:window on:click={() => (menuOpen = false)} />

<div class="player-bar">
    <div class="now-playing">
        {#if $currentTrack?.thumbnail_url}
            <img class="album-thumb" src={$currentTrack.thumbnail_url} alt="album art" />
        {:else}
            <div class="album-thumb thumb-placeholder"></div>
        {/if}
        <div class="track-info">
            <div class="title">{$currentTrack?.title ?? ''}</div>
            <div class="artist">
                {#each ($currentTrack?.artists ?? []) as artist, i}
                    <button class="artist-link" on:click={() => onArtistClick(artist.uri)}>{artist.name}</button>{#if i < ($currentTrack?.artists ?? []).length - 1}, {/if}
                {/each}
            </div>
        </div>
        {#if $currentTrack}
            <div class="more-wrapper">
                <button class="more-btn" on:click|stopPropagation={() => (menuOpen = !menuOpen)}>⋮</button>
                {#if menuOpen}
                    <div class="dropdown">
                        <button on:click|stopPropagation={handleReportRerecord}>
                            Report for re-recording
                        </button>
                        <button on:click|stopPropagation={() => { showSkips = !showSkips; menuOpen = false; }}>
                            {showSkips ? 'Hide' : 'Show'} skip markers
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <div class="controls">
        <button class="ctrl-btn" on:click={togglePlay}>
            {paused ? 'play' : 'pause'}
        </button>
        <div class="progress-wrap">
            <div class="progress-container">
                <input
                    class="slider"
                    style="--fill: {progress}%"
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    on:input={seek}
                />
                {#if showSkips}
                    {#each skips as s}
                        <div class="skip-marker" style="left: calc(2px + {s} * (100% - 4px))"></div>
                    {/each}
                {/if}
            </div>
            <span class="time">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
    </div>

    <div class="nav-btns">
        <button class="ctrl-btn" on:click={playPrevious}>prev</button>
        <button class="ctrl-btn" on:click={playNextFromQueue}>next</button>
        <input
            class="slider volume-slider"
            style="--fill: {volumeFill}%"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            on:input={setVolume}
        />
        {#if $currentTrack}
            <button class="ctrl-btn library-btn" on:click={handleLibraryToggle}>
                {$currentTrack.in_library ? '-' : '+'}
            </button>
        {/if}
        <button class="ctrl-btn" class:active={queueOpen} on:click={onQueue}>queue</button>
    </div>
</div>

<audio bind:this={audioEl}></audio>

<style>
    .player-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        display: grid;
        grid-template-columns: minmax(160px, 320px) 1fr auto;
        align-items: center;
        gap: 16px;
        padding: 12px 20px;
        background: #efefed;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        box-sizing: border-box;
    }

    .now-playing {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .album-thumb {
        width: 44px;
        height: 44px;
        border-radius: 2px;
        object-fit: cover;
        flex-shrink: 0;
    }
    .thumb-placeholder {
        background: #ddd;
    }
    .track-info {
        min-width: 0;
        flex: 1;
    }
    .title {
        font-size: 14px;
        font-weight: 600;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .artist {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .artist-link {
        background: none;
        border: none;
        padding: 0;
        font-size: 12px;
        color: #666;
        cursor: pointer;
    }
    .artist-link:hover { text-decoration: underline; color: #333; }

    .more-wrapper {
        position: relative;
        flex-shrink: 0;
    }
    .more-btn {
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: transparent;
        color: #555;
        font-size: 16px;
        line-height: 1;
    }
    .more-btn:hover { background: #e8e8e6; }
    .dropdown {
        position: absolute;
        left: 0;
        bottom: calc(100% + 6px);
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 1100;
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
    .dropdown button:hover { background: #f5f5f5; }

    .controls {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .progress-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    /* shared slider styles */
    .slider {
        -webkit-appearance: none;
        appearance: none;
        height: 30px;
        background: transparent;
        outline: none;
        cursor: pointer;
    }
    .slider::-webkit-slider-runnable-track {
        height: 20px;
        border-radius: 6px;
        background:
            linear-gradient(to right, rgba(0,0,0,0.28) var(--fill), transparent var(--fill)),
            linear-gradient(to bottom, #888 0%, #ccc 28%, #f0f0f0 50%, #ccc 72%, #888 100%);
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.6);
    }
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 4px;
        height: 26px;
        border-radius: 3px;
        background: linear-gradient(to right, #606060, #d8d8d8 40%, #ffffff 50%, #d8d8d8 60%, #606060);
        box-shadow: 0 0 2px rgba(0,0,0,0.4);
        cursor: pointer;
        margin-top: -3px;
    }
    .slider::-moz-range-track {
        height: 20px;
        border-radius: 6px;
        background:
            linear-gradient(to right, rgba(0,0,0,0.28) var(--fill), transparent var(--fill)),
            linear-gradient(to bottom, #888 0%, #ccc 28%, #f0f0f0 50%, #ccc 72%, #888 100%);
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.6);
    }
    .slider::-moz-range-thumb {
        width: 4px;
        height: 26px;
        border-radius: 3px;
        background: linear-gradient(to right, #606060, #d8d8d8 40%, #ffffff 50%, #d8d8d8 60%, #606060);
        box-shadow: 0 0 2px rgba(0,0,0,0.4);
        cursor: pointer;
        border: none;
    }

    /* progress bar stretches, volume is fixed width */
    .progress-container {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
    }
    .progress-container .slider { flex: 1; width: 100%; }

    /* LCD screen style — progress bar only */
    .progress-container .slider::-webkit-slider-runnable-track {
        height: 20px;
        border-radius: 2px;
        background:
            repeating-linear-gradient(
                to right,
                rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px,
                transparent 1px, transparent 6px
            ),
            linear-gradient(to right, #8bac0f var(--fill), #0f380f var(--fill));
        box-shadow:
            inset 0 0 0 1px rgba(0,0,0,0.6),
            inset 0 1px 3px rgba(0,0,0,0.4),
            0 0 8px rgba(139,172,15,0.15);
    }
    .progress-container .slider::-webkit-slider-thumb {
        width: 3px;
        height: 26px;
        border-radius: 1px;
        margin-top: -3px;
        background: rgba(255, 255, 220, 0.95);
        box-shadow: 0 0 5px rgba(255,255,200,0.7);
    }
    .progress-container .slider::-moz-range-track {
        height: 20px;
        border-radius: 2px;
        background:
            repeating-linear-gradient(
                to right,
                rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px,
                transparent 1px, transparent 6px
            ),
            linear-gradient(to right, #8bac0f var(--fill), #0f380f var(--fill));
        box-shadow:
            inset 0 0 0 1px rgba(0,0,0,0.6),
            inset 0 1px 3px rgba(0,0,0,0.4);
    }
    .progress-container .slider::-moz-range-thumb {
        width: 3px;
        height: 26px;
        border-radius: 1px;
        border: none;
        background: rgba(255, 255, 220, 0.95);
        box-shadow: 0 0 5px rgba(255,255,200,0.7);
    }

    .skip-marker {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 18px;
        background: rgba(255, 255, 200, 0.9);
        box-shadow: 0 0 3px rgba(255,255,150,0.8);
        pointer-events: none;
        border-radius: 1px;
        z-index: 1;
    }
    .volume-slider {
        width: 80px;
        margin-left: 8px;
        flex-shrink: 0;
    }

    .time {
        font-size: 11px;
        color: #888;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .nav-btns {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }

    .ctrl-btn {
        height: 30px;
        padding: 0 12px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: #333;
        color: white;
        font-size: 14px;
        line-height: 1;
    }
    .ctrl-btn:hover { background: #555; }
    .ctrl-btn.active { background: #555; }
    .ctrl-btn.library-btn {
        width: 36px;
        padding: 0;
    }

    @media (max-width: 700px) {
        .player-bar {
            grid-template-columns: minmax(120px, 180px) 1fr auto;
            gap: 10px;
            padding: 10px 12px;
        }
        .title, .artist { font-size: 12px; }
        .volume-slider { width: 60px; }
    }
    @media (max-width: 550px) {
        .player-bar {
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto;
            gap: 6px;
        }
        .now-playing { grid-column: 1 / -1; }
        .controls { grid-column: 1; }
        .nav-btns { grid-column: 2; align-self: center; }
        .volume-slider { display: none; }
    }
</style>
