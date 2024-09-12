<script lang="ts">
export let level: 1 | 2 | 3
export let text: string
</script>
<svelte:element this={`h${level}`}>{text}</svelte:element>