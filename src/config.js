export const config = (typeof window !== 'undefined' && window.__ENV__)
    ? window.__ENV__
    : {
        MUSIQL_API_URL: import.meta.env.VITE_MUSIQL_API_URL ?? '',
        MEDIA_INGESTION_API_URL: import.meta.env.VITE_MEDIA_INGESTION_API_URL ?? '',
    };
