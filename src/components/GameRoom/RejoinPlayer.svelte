<script>
  import { mutation } from 'svelte-apollo';
  import { REJOIN_PLAYER } from '../../gql';
  import Button from '../common/Button.svelte';
  export let joined;
  export let player;
  export let gameId;

  const rejoinPlayer = mutation(REJOIN_PLAYER);
  const handleRejoin = async () => {
    await rejoinPlayer({
      variables: { gameId, player },
    });
    joined();
  };
</script>

<Button onClick={handleRejoin}>Rejoin game</Button>
