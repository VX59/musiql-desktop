<script>
    import { loggedIn } from './stores/auth.js';
    import LoginForm from './components/LoginForm.svelte';
    import MainView from './components/MainView.svelte';
</script>

{#if $loggedIn}
    <MainView />
{:else}
    <LoginForm />
{/if}
