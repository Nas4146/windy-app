<script lang="ts">
    import { onMount } from 'svelte';
    import SwaggerUI from 'swagger-ui';
    import 'swagger-ui/dist/swagger-ui.css';

    onMount(async () => {
        const response = await fetch('/api/v1/documentation');
        const spec = await response.json();
        
        SwaggerUI({
            spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUI.presets.apis
            ],
            plugins: [
                SwaggerUI.plugins.DownloadUrl
            ],
            layout: "BaseLayout",
            defaultModelsExpandDepth: 3,
            defaultModelExpandDepth: 3,
            displayRequestDuration: true
        });
    });
</script>

<div class="swagger-container">
    <div id="swagger-ui" />
</div>

<style>
    .swagger-container {
        @apply p-4;
    }
    :global(.swagger-ui) {
        @apply max-w-7xl mx-auto;
    }
</style>