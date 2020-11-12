<script>
  import io from 'socket.io-client';
  const socket = io();

  let name;
  let gameId;

  let joinId;

  let gameError;

  let players = [];
  let playerToNominate;
  let mafia = [];

  $: joinedMafia = mafia.join(`, `);

  let role = ``;

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
    console.log('players response', playersResponse);
    players = [...playersResponse];
  });

  $: console.log(
    'connected players',
    players.filter(({ connected }) => connected),
  );

  socket.on(`role`, (assignedRole, otherMafia) => {
    console.log('yo');
    console.log('your role is', assignedRole);
    role = assignedRole;
    if (otherMafia) mafia = [...otherMafia];
  });

  $: console.log('role is', role);

  const handleStart = () => {
    socket.emit(`start`, gameId);
  };

  let day = false;
  let mafiaAwake = false;
  let playerToDie;

  socket.on(`readyToStart`, () => {
    mafiaAwake = true;
  });

  const handleAssassinatePlayer = (playerToAssassinate) => {
    console.log('player to assassinate', playerToAssassinate);
    // players = [
    //   ...players.map((player) =>
    //     player.name === playerToAssassinate.name
    //       ? { ...player, nominated: true }
    //       : player,
    //   ),
    // ];
    socket.emit(`assassinate`, playerToAssassinate, name, gameId);
  };

  socket.on(`postAssassination`, (updatedGame) => {
    console.log('updated game is', updatedGame);
    players = [...updatedGame.players];
    if (updatedGame.stageComplete) {
      playerToDie = updatedGame.lastPlayerKilled;
    }
  });

  const handleConfirmKill = () => {
    console.log(`confirmed that ${playerToDie} will be killed`);
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
    flex-wrap: wrap;
  }

  .mafia {
    cursor: pointer;
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
      <div width="100%">
        <p>YOU'RE IN ROOM {gameId}</p>
      </div>
      <div width="100%">
        <form>
          <label>Name <input bind:value={name} /></label><button
            on:click={addPlayer}>Add player</button>
        </form>
        <ol>
          {#each players as player}
            {#if role === `mafia`}
              <input
                type="radio"
                value={player}
                bind:group={playerToNominate}
                on:click={() => {
                  handleAssassinatePlayer(player);
                }} />
            {/if}
            <li class:mafia={role === `mafia`}>{player.name}</li>
          {/each}
        </ol>
        Registered players:
        {players.length}
        {#if players.length >= 6}
          <button on:click={handleStart}>Start</button>
        {/if}
      </div>
      {#if role}
        <div width="100%">
          <p>You are a {role}</p>
          {#if mafia.length}
            <p>The other mafia are {joinedMafia}</p>
          {/if}
        </div>
      {/if}
      {#if mafiaAwake}
        <p>
          Night settles on the city. The citizens go to sleep. The mafia awake.
          They chose someone to kill.
        </p>
      {/if}
      {#if playerToDie && mafiaAwake}
        <p>{playerToDie.name} will be sent to sleep with the fishes</p>
        <button on:click={handleConfirmKill}>Confirm</button>
      {/if}
    {/if}
  </div>
</main>
