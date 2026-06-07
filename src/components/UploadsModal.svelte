<script>
    import { onMount } from 'svelte';
    import { getUploadJobs } from '../api/musiql.js';

    let jobs = [];
    let loading = false;
    let error = null;

    async function loadJobs() {
        loading = true;
        error = null;
        try {
            const data = await getUploadJobs();
            jobs = Array.isArray(data) ? data : [];
        } catch (e) {
            error = `Could not load jobs (${e.message})`;
        } finally {
            loading = false;
        }
    }

    onMount(loadJobs);
</script>

<div class="uploads-header">
    <span class="result-header">{jobs.length} Upload Jobs</span>
    <button class="refresh-btn" on:click={loadJobs} disabled={loading}>
        {loading ? '...' : 'refresh'}
    </button>
</div>

{#if error}
    <div class="error">{error}</div>
{/if}

<div class="results-scroll">
    <table class="results-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Association</th>
                <th>Type</th>
                <th>Source</th>
                <th>Status</th>
                <th>Subtasks</th>
                <th>Progress</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            {#each jobs as job}
                <tr class="tablulated-result">
                    <td class="col-title">{job.name ?? '—'}</td>
                    <td>{job.association ?? '—'}</td>
                    <td>{job['job type'] ?? '—'}</td>
                    <td>{job['source type'] ?? '—'}</td>
                    <td class="job-status" class:status-done={job.status === 'finished'} class:status-err={job.status === 'failed'}>{job.status ?? '—'}</td>
                    <td>{job.subtasks ?? '—'}</td>
                    <td>{job.progress ?? '—'}</td>
                    <td class="col-date">{job['date requested'] ? new Date(job['date requested']).toLocaleDateString() : '—'}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .uploads-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    .result-header {
        font-size: 14px;
        font-weight: 600;
    }
    .refresh-btn {
        padding: 4px 10px;
        border: 1px solid #ccc;
        border-radius: 2px;
        background: transparent;
        font-size: 12px;
        cursor: pointer;
        color: #555;
    }
    .refresh-btn:hover:not(:disabled) { background: #f0f0f0; }
    .refresh-btn:disabled { opacity: 0.5; cursor: default; }
    .error {
        font-size: 13px;
        color: #c00;
        margin-bottom: 8px;
    }
    .results-scroll {
        overflow-y: auto;
        margin-top: 8px;
    }
    .results-table {
        width: 100%;
        border-collapse: collapse;
    }
    .results-table thead th {
        position: sticky;
        top: 0;
        background: #f7f7f5;
        z-index: 2;
        text-align: left;
        padding: 8px;
        font-size: 12px;
        color: #666;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
    }
    .tablulated-result td {
        padding: 6px 8px;
        vertical-align: middle;
    }
    .tablulated-result:hover { background: #e9e9e7; }
    .tablulated-result:hover td {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.08), 1px 0 0 rgba(0,0,0,0.09);
    }
    .tablulated-result:hover td:last-child {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
    }
    .col-title { width: 20%; }
    .col-date {
        white-space: nowrap;
        font-size: 12px;
        color: #888;
    }
    .job-status { font-size: 13px; }
    .status-done { color: #2a7a2a; }
    .status-err { color: #c00; }
</style>
