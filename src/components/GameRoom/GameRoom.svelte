<script>
  import AddPlayer from './AddPlayer.svelte';
  import Header from './Header.svelte';
  import PlayersList from './PlayersList.svelte';

  let hasJoined = false;
  $: console.log('has joined is', hasJoined)
  const joined = () => {
    hasJoined = true
  }
</script>

<Header />
{#if !hasJoined}
  <AddPlayer joined={joined} />
{/if}
<PlayersList />
