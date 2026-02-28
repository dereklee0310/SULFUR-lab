<script lang="ts">
	import { _ } from 'svelte-i18n';
    import * as Empty from '$lib/components/ui/empty/index.js';
</script>

<Empty.Root class="h-full">
    <Empty.Header>
        <Empty.Title class="text-6xl w-full">
            {$_("pages.error.text")}
        </Empty.Title>
    </Empty.Header>
</Empty.Root>