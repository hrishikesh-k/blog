<script lang="ts">
  import type {PageData} from './$types'
  export let data : PageData
</script>
<h1>{data.post.results[0].id}</h1>