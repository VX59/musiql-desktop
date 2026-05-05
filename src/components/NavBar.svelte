<script>
    import { token } from '../stores/auth.js';

    export let onLibrary = () => {};
    export let onQueue = () => {};
    export let onAddMusic = () => {};
    export let onUploads = () => {};
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
    <button on:click={onLibrary}>library</button>
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
        border: none;
        border-radius: 2px;
        cursor: pointer;
        background: #333;
        color: white;
        font-size: 14px;
    }
    .nav-buttons button:hover { background: #555; }
    .nav-buttons button.active { background: #555; }
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
        background: #efefed;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.14);
        color: #111;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 8px 10px;
        border-radius: 4px;
    }
</style>
