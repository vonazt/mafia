<script>
  import { mutation } from 'svelte-apollo';
  import { PROTECT_PLAYER } from '../../gql';
  import guardianAngelStore from '../../stores/guardianAngel';
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';

  const protectPlayer = mutation(PROTECT_PLAYER);
  let playerProtected = false;

  const handleProtectPlayer = async (_id) => {
    const {
      data: { protectPlayer: result },
    } = await protectPlayer({ variables: { _id, gameId: $gameStore.gameId } });
    playerProtected = result;
  };

  const handleEndGuardianAngelTurn = () => {
    console.log('ENDING TURN');
  };
</script>

{#if $guardianAngelStore.playerToProtect.name && !playerProtected}
  <Button
    onClick={() => handleProtectPlayer($guardianAngelStore.playerToProtect._id)}>
    Protect
    {$guardianAngelStore.playerToProtect.name}
  </Button>
{/if}
{#if playerProtected}
  <p>{$guardianAngelStore.playerToProtect.name} has been protected</p>
  <Button onClick={handleEndGuardianAngelTurn}>OK</Button>
{/if}
