<script>
  export let onClick
</script>

<button on:click={onClick} class="p-4 rounded-md bg-green-200"><slot></slot></button>