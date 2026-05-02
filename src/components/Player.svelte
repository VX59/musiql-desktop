<script>
    import { onMount } from 'svelte';
    import {
        currentTrack,
        registerAudioElement,
        playNextFromQueue,
        playPrevious,
    } from '../stores/player.js';
    import { addToLibrary, removeFromLibrary } from '../api/musiql.js';

    export let onQueue = () => {};
    export let queueOpen = false;

    let audioEl;
    let paused = true;
    let currentTime = 0;
    let duration = 0;
    let volume = 1;
    let menuOpen = false;

    $: progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    $: volumeFill = volume * 100;

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

    function handleReportRerecord() {
        menuOpen = false;
        console.log('Report for re-recording:', $currentTrack?.uri);
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
        <div class="track-info">
            <div class="title">{$currentTrack?.title ?? ''}</div>
            <div class="artist">{$currentTrack?.artists ?? ''}</div>
        </div>
        {#if $currentTrack}
            <div class="more-wrapper">
                <button class="more-btn" on:click|stopPropagation={() => (menuOpen = !menuOpen)}>⋮</button>
                {#if menuOpen}
                    <div class="dropdown">
                        <button on:click|stopPropagation={handleReportRerecord}>
                            Report for re-recording
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
        gap: 6px;
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
        background: linear-gradient(to right, #333 var(--fill), #ddd var(--fill));
    }
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 4px;
        height: 26px;
        border-radius: 3px;
        background: #111;
        cursor: pointer;
        margin-top: -3px;
    }
    .slider::-moz-range-track {
        height: 20px;
        border-radius: 6px;
        background: linear-gradient(to right, #333 var(--fill), #ddd var(--fill));
    }
    .slider::-moz-range-thumb {
        width: 4px;
        height: 26px;
        border-radius: 3px;
        background: #111;
        cursor: pointer;
        border: none;
    }

    /* progress bar stretches, volume is fixed width */
    .progress-wrap .slider { flex: 1; }
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
