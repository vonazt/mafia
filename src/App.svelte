<script>
  import io from 'socket.io-client';
  const socket = io();

  let thisPlayer = { name: `` };
  let gameId;

  let joinId;

  let gameError;

  let players = [];
  let playerToNominate = {};
  let mafia = [];

  $: joinedMafia = mafia.join(`, `);

  let stages = {};

  let confirmInvestigation = false;

  $: console.log('stages are', stages);

  const handleCreate = () => {
    socket.emit(`create`);
  };

  socket.on(`createSuccess`, (game) => {
    console.log('new game is', game);
    gameId = game.gameId;
    stages = { ...game.stages };
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

  // console.log('game is id', gameId);

  const addPlayer = (e) => {
    e.preventDefault();
    console.log('adding player', thisPlayer);
    socket.emit(`add`, gameId, thisPlayer);
  };

  socket.on(`addedPlayer`, (playersResponse) => {
    console.log('players response', playersResponse);
    thisPlayer = playersResponse.find(
      (player) => thisPlayer.name === player.name,
    );
    players = [...playersResponse];
  });

  // $: console.log(
  //   'connected players',
  //   players.filter(({ connected }) => connected),
  // );

  // $: console.log('this player is', thisPlayer);

  socket.on(`assignedRoles`, (assignedRole, otherMafia) => {
    console.log('your role is', assignedRole);
    thisPlayer = { ...thisPlayer, role: assignedRole };
    if (otherMafia) mafia = [...otherMafia];
  });

  // $: console.log('role is', thisPlayer.role);

  const handleStart = () => {
    socket.emit(`start`, gameId);
  };

  let playerToDie;

  socket.on(`gameStarted`, (updatedStages) => {
    stages = { ...updatedStages };
  });

  let nominating = false;
  const handleNominatePlayer = (playerToNominate) => {
    if (stages.mafiaAwake) {
      return socket.emit(`assassinate`, playerToNominate, thisPlayer, gameId);
    }
    if (stages.detectiveAwake) {
      confirmInvestigation = false;
      investigating = true;
      return socket.emit(`investigate`, playerToNominate, thisPlayer, gameId);
    }
    if (stages.day) {
      playerToNominate = { ...playerToNominate };
      return socket.emit(`nominate`, playerToNominate, thisPlayer, gameId);
    }
    if (stages.twoNominations) {
      console.log('lynching player');
      confirmNomination = false;
      nominating = true;
      playerToNominate = { ...playerToNominate };
      return socket.emit(`lynch`, playerToNominate, thisPlayer, gameId);
    }
  };

  socket.on(`postAssassination`, (updatedGame) => {
    thisPlayer = updatedGame.players.find(
      ({ name }) => name === thisPlayer.name,
    );
    players = [...updatedGame.players];
    if (updatedGame.nominatedPlayers.length) {
      playerToDie = { ...updatedGame.nominatedPlayers[0] };
    }
  });

  const handleConfirmKill = () => {
    console.log(`confirmed that ${playerToDie.name} will be killed`);
    socket.emit(`confirmKill`, playerToDie, gameId);
  };

  const getNominatedBy = (nominatedBy) => {
    const nominators = nominatedBy
      .filter(({ _id }) => _id !== thisPlayer._id)
      .map(({ name }) => name);
    return nominators.length ? `Nominated by ${nominators.join(`, `)}` : ``;
  };

  socket.on(`detectiveAwake`, (updatedGame) => {
    stages = { ...updatedGame.stages };
  });
  let investigating = false;

  let playerToInvestigate = {};
  const handleConfirmInvestigation = (player) => {
    playerToInvestigate = { ...player };
    confirmInvestigation = true;
  };

  let investigationResult = ``;

  socket.on(`investigationResult`, (isMafia, investigatedPlayer) => {
    investigating = false;
    investigationResult = `${investigatedPlayer.name} ${
      isMafia ? `is` : `is not`
    } a member of the mafia`;
  });

  const handleEndDetectiveStage = () => {
    investigationResult = ``;
    socket.emit(`endDetectiveTurn`, gameId);
  };

  let deadPlayers = [];
  $: console.log('dead players are', deadPlayers);

  let lastPlayerKilled = {};

  socket.on(`day`, (updatedGame) => {
    console.log('updated game is', updatedGame);
    stages = { ...updatedGame.stages };
    lastPlayerKilled = { ...updatedGame.lastPlayerKilled };
    thisPlayer = updatedGame.players.find(({ _id }) => _id === thisPlayer._id);
    players = [...updatedGame.players];
  });

  let confirmNomination = false;
  const handleConfirmNomination = (player) => {
    playerToNominate = { ...player };
    confirmNomination = true;
  };

  let nominatedPlayers = [];

  socket.on(`postNomination`, (updatedGame) => {
    console.log('updated hame post nonmination', updatedGame);
    players = [...updatedGame.players];
    stages = { ...updatedGame.stages };
    thisPlayer = updatedGame.players.find(({ _id }) => _id === thisPlayer._id);
    nominatedPlayers = [...updatedGame.nominatedPlayers];
  });

  socket.on(`postLynching`, (updatedGame) => {
    console.log('updated hame post ly ching', updatedGame);
    players = [...updatedGame.players];
    stages = { ...updatedGame.stages };
    thisPlayer = updatedGame.players.find(({ _id }) => _id === thisPlayer._id);
    lastPlayerKilled = { ...updatedGame.lastPlayerKilled };
    nominatedPlayers = [...updatedGame.nominatedPlayers];
  });

  $: console.log('players area', players);

  $: console.log('stages are', stages);

  const canNominate = (player, thisPlayer, stages) => {
    return (
      (player.isAlive && thisPlayer.role === `mafia` && stages.mafiaAwake) ||
      (thisPlayer.role === `detective` &&
        thisPlayer.isAlive &&
        stages.detectiveAwake &&
        !investigating) ||
      (stages.day && player.isAlive && thisPlayer.isAlive) ||
      (!nominating &&
        thisPlayer.isAlive &&
        stages.twoNominations &&
        nominatedPlayers.some(({ _id }) => _id === player._id))
    );
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

  .dead {
    text-decoration: line-through;
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
          <label>Name <input bind:value={thisPlayer.name} /></label><button
            on:click={addPlayer}>Add player</button>
        </form>
        <ol>
          {#each players as player}
            {#if canNominate(player, thisPlayer, stages)}
              <input
                type="radio"
                value={player}
                bind:group={playerToNominate}
                on:click={() => {
                  if (stages.mafiaAwake) {
                    handleNominatePlayer(player);
                  }
                  if (stages.detectiveAwake) {
                    handleConfirmInvestigation(player);
                  }
                  if (stages.day) {
                    handleNominatePlayer(player);
                  }
                  if (stages.twoNominations) {
                    handleConfirmNomination(player);
                  }
                }} />
            {/if}
            <li
              class:mafia={thisPlayer.role === `mafia`}
              class:dead={!player.isAlive}>
              {player.name}
              {#if (thisPlayer.role === `mafia` && player.nominatedBy.length) || (stages.day && player.isAlive && player.nominatedBy.length)}
                <span>{getNominatedBy(player.nominatedBy)}</span>
              {/if}
            </li>
          {/each}
        </ol>
        Registered players:
        {players.length}
        {#if players.length >= 6}
          <button on:click={handleStart}>Start</button>
        {/if}
      </div>
      {#if thisPlayer.role}
        <div width="100%">
          <p>You are a {thisPlayer.role}</p>
          {#if mafia.length}
            <p>The other mafia are {joinedMafia}</p>
          {/if}
        </div>
      {/if}
      {#if stages.mafiaAwake}
        <p>
          Night settles on the city. The citizens go to sleep. The mafia awake.
          They chose someone to kill.
        </p>
      {/if}
      {#if playerToDie && stages.mafiaAwake}
        <p>{playerToDie.name} will be sent to sleep with the fishes</p>
        <button on:click={handleConfirmKill}>Confirm</button>
      {/if}
      {#if stages.detectiveAwake}
        <p>A murder has been committed this night.</p>
        <p>The detective awakens to begin their investigations</p>
        {#if confirmInvestigation}
          <button
            on:click={() => handleNominatePlayer(playerToInvestigate)}>Investigate
            {playerToInvestigate.name}?</button>
        {/if}
        {#if investigationResult}
          <p>{investigationResult}</p>
          <button on:click={() => handleEndDetectiveStage()}>OK</button>
        {/if}
      {/if}
      {#if stages.day}
        <p>
          A murder has been committed.
          {lastPlayerKilled.name}
          has been murdered in their sleep.
        </p>
        <p>The townfolk gather to find the criminals in their midst.</p>

        {#if playerToNominate.name}
          <p>You nominated {playerToNominate.name}</p>
        {/if}
      {/if}
      {#if stages.twoNominations}
        <p>
          {nominatedPlayers.map(({ name }) => name).join(` and `)}
          have been accused by the townsfolk. One of them must die. Pick one.
        </p>
        {#if confirmNomination}
          <button on:click={handleNominatePlayer(playerToNominate)}>Nominate
            {playerToNominate.name}</button>
        {/if}
      {/if}
      {#if stages.playerLynched}
        <p>{lastPlayerKilled.name} was murdered by the townfolk</p>
        <p>{lastPlayerKilled.name} was a {lastPlayerKilled.role}</p>
      {/if}
    {/if}
  </div>
</main>
