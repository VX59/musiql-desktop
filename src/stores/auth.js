import { writable, derived } from 'svelte/store';

export const token = writable(localStorage.getItem('token') ?? null);
export const loggedIn = derived(token, $t => !!$t);

token.subscribe(t => {
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
});
