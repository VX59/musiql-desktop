<script>
    import { token } from '../stores/auth.js';

    export let onLibrary = () => {};
    export let onQueue = () => {};
    export let onAddMusic = () => {};
    export let onUploads = () => {};
    export let libraryOpen = false;
    export let queueOpen = false;
    export let addMusicOpen = false;
    export let uploadsOpen = false;

    function logout() {
        token.set(null);
    }

    async function copyApiToken() {
        await navigator.clipboard.writeText(localStorage.getItem('token') ?? '');
    }
</script>

<div class="nav-buttons">
    <span class="brand"><span class="brand-badge">MUSIQL</span></span>
    <button class:active={libraryOpen} on:click={onLibrary}>library</button>
    <button class:active={queueOpen} on:click={onQueue}>queue</button>
    <button class:active={addMusicOpen} on:click={onAddMusic}>add music</button>
    <button class:active={uploadsOpen} on:click={onUploads}>uploads</button>
    <button class="logout" on:click={logout}>logout</button>
    <button on:click={copyApiToken}>copy API token</button>
</div>

<style>
    .nav-buttons {
        display: flex;
        gap: 4px;
        padding: 10px 16px;
        background: #efefed;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
        position: sticky;
        top: 0;
        z-index: 100;
    }
    .nav-buttons button {
        padding: 8px 14px;
        border: 1px solid #111;
        border-radius: 2px;
        cursor: pointer;
        background: linear-gradient(to bottom, #4a4a4a 0%, #252525 100%);
        color: white;
        font-size: 14px;
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.10),
            0 2px 4px rgba(0,0,0,0.45),
            0 1px 0 rgba(255,255,255,0.08);
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        transition: background 0.1s, box-shadow 0.1s;
    }
    .nav-buttons button:hover {
        background: linear-gradient(to bottom, #5a5a5a 0%, #333 100%);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.13),
            0 3px 6px rgba(0,0,0,0.5),
            0 1px 0 rgba(255,255,255,0.08);
    }
    .nav-buttons button.active {
        background: linear-gradient(to bottom, #1e1e1e 0%, #3a3a3a 100%);
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06);
    }
    .logout { margin-left: auto; }
    .brand {
        font-size: 16px;
        font-weight: 700;
        color: #111;
        align-self: center;
        margin-right: 8px;
    }
    .brand-badge {
        display: inline-block;
        background: linear-gradient(to bottom, #f8f8f6 0%, #e0e0de 100%);
        border: 1px solid rgba(0,0,0,0.18);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(0,0,0,0.08),
            0 2px 4px rgba(0,0,0,0.22),
            0 5px 14px rgba(0,0,0,0.12),
            0 1px 0 rgba(255,255,255,0.45);
        color: #111;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 8px 10px;
        border-radius: 4px;
        text-shadow: 0 1px 0 rgba(255,255,255,0.7);
    }
</style>
