<script>
  import io from 'socket.io-client';
  const socket = io();

  let name;
  let gameId;

  let joinId;

  let gameError;

  let players = [];

  const handleCreate = () => {
    socket.emit(`create`);
  };

  socket.on(`createSuccess`, (newGameId) => {
    console.log('new game id', newGameId);
    gameId = newGameId;
  });

  socket.on(`joinSuccess`, (joinedGameId, playersResponse) => {
    players = [...playersResponse];
    gameId = joinedGameId;
  });

  socket.on(`noGame`, () => {
    gameError = `Game not found`;
  });

  const handleJoin = () => {
    console.log('joining', joinId);
    socket.emit(`join`, joinId);
  };

  console.log('game is id', gameId);

  const addPlayer = (e) => {
    e.preventDefault();
    console.log('adding player', name);
    socket.emit(`add`, gameId, name);
  };

  socket.on(`addedPlayer`, (playersResponse) => {
    console.log('players', players);
    players = [...playersResponse];
  });

  socket.on(`role`, role => {
    console.log('your role is', role)
  })

  const handleStart = () => {
    socket.emit(`start`, gameId);
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
      <p>YOU'RE IN ROOM {gameId}</p>
      <form>
        <label>Name <input bind:value={name} /></label><button
          on:click={addPlayer}>Add player</button>
      </form>
      <ol>
        {#each players as player}
          <li>{player.name}</li>
        {/each}
      </ol>
      Registered players:
      {players.length}
      {#if players.length >= 6}
        <button on:click={handleStart}>Start</button>
      {/if}
    {/if}
  </div>
</main>
