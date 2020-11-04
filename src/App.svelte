<script>
  import io from 'socket.io-client';
  const socket = io();

  let name;

  const handleSubmit = () => {
    socket.emit(`join`, name);
  };

  socket.on(`message`, () => {
    console.log('LOUD AND CLEAR')
  })
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
    <input bind:value={name} />
    <button on:click={handleSubmit}>Join</button></div>
</main>
