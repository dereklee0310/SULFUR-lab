<script lang="ts">
    import '$lib/i18n';
	import { _ } from 'svelte-i18n';
    import * as Empty from '$lib/components/ui/empty/index.js';
    import { page } from '$app/state';

</script>

<Empty.Root class="h-full">
    <Empty.Header>
        <Empty.Title class="text-6xl">
            {page.status} {page.error?.message ?? $_("pages.error.title")}
        </Empty.Title>
        <Empty.Description class="text-2xl">
            {$_("pages.error.text")}
        </Empty.Description>
    </Empty.Header>
</Empty.Root>