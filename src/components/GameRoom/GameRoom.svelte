<script>
  import AddPlayer from './AddPlayer.svelte';
  import Header from './Header.svelte';
  import PlayersList from './PlayersList.svelte';
  import StartGame from './StartGame.svelte';

  let hasJoined = false;
  $: console.log('has joined is', hasJoined);
  const joined = () => {
    hasJoined = true;
  };
</script>

<div class="flex flex-wrap w-full h-full content-start pt-5">
  <Header />
  <PlayersList />
  <StartGame />
  {#if !hasJoined}
    <AddPlayer {joined} />
  {/if}
</div>
