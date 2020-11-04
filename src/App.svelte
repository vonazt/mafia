<script>
  import io from 'socket.io-client';
  const socket = io();

  let name;
  let gameId;

  let joinId;

  let gameError;

  const handleCreate = () => {
    socket.emit(`create`);
  };

  socket.on(`createSuccess`, (newGameId) => {
    gameId = newGameId;
  });

  socket.on(`joinSuccess`, (joinedGameId) => {
    gameId = joinedGameId;
  });

  socket.on(`noGame`, () => {
    gameError = `Game not found`;
  });

  const handleJoin = () => {
    console.log('joining', joinId);
    socket.emit(`join`, joinId);
  };
</script>

<style>
  button {
    height: 5rem;
    width: 15rem;
  }

  .container {
    display: flex;
    justify-content: center;
  }
</style>

<main>
  <div class="container">
    {#if !gameId}
      <div><button on:click={handleCreate}>Create</button></div>
      <div>
        {#if gameError}
          <p>{gameError}</p>
        {/if}
        <input bind:value={joinId} />
        <button on:click={handleJoin}>Join</button>
      </div>
    {:else}
      <p>LET'S PLAY IN {gameId}</p>
    {/if}
  </div>
</main>
