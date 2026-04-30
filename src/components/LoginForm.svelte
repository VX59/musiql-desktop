<script>
    import { token } from '../stores/auth.js';
    import { login } from '../api/musiql.js';

    let username = '';
    let password = '';
    let error = '';

    async function handleSubmit() {
        error = '';
        if (!username || !password) {
            error = 'Please fill in both fields';
            return;
        }
        try {
            const data = await login(username, password);
            token.set(data.token);
        } catch {
            error = 'Login failed';
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') handleSubmit();
    }
</script>

<div class="login-container">
    <h2>Login</h2>
    <input bind:value={username} placeholder="Username" on:keydown={handleKeydown} />
    <input bind:value={password} type="password" placeholder="Password" on:keydown={handleKeydown} />
    {#if error}<p class="error">{error}</p>{/if}
    <button on:click={handleSubmit}>Login</button>
</div>

<style>
    .login-container {
        max-width: 300px;
        margin: 100px auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    input {
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ddd;
        border-radius: 2px;
        outline: none;
    }
    input:focus {
        border-color: #666;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
    }
    button {
        padding: 10px;
        background: #333;
        color: white;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        font-size: 14px;
    }
    button:hover { background: #555; }
    .error { color: red; font-size: 12px; margin: 0; }
</style>
