<script>
  import { mutation } from 'svelte-apollo';
  import { PROTECT_PLAYER, END_GUARDIAN_ANGEL_TURN } from '../../gql';
  import guardianAngelStore from '../../stores/guardianAngel';
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';

  const protectPlayer = mutation(PROTECT_PLAYER);
  const endGuardianAngelTurn = mutation(END_GUARDIAN_ANGEL_TURN);
  let playerProtected = false;

  const handleProtectPlayer = async (_id) => {
    guardianAngelStore.update((store) => ({ ...store, isProtecting: true }));
    const {
      data: { protectPlayer: result },
    } = await protectPlayer({ variables: { _id, gameId: $gameStore.gameId } });
    playerProtected = result;
  };

  const handleEndGuardianAngelTurn = async () =>
    endGuardianAngelTurn({ variables: { gameId: $gameStore.gameId } });
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
