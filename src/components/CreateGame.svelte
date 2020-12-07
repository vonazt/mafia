<script>
  
  </script>

<div><button on:click={handleCreate}>Create</button></div>
<div>
  {#if gameError}
    <p>{gameError}</p>
  {/if}
  <input bind:value={joinId} />
  <button on:click={handleJoin}>Join</button>
</div>