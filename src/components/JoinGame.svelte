<script>
  let joinId = ''
</script>

<div>
  {#if gameError}
    <p>{gameError}</p>
  {/if}
  <input bind:value={joinId} />
  <button on:click={handleJoin}>Join</button>
</div>