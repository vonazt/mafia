<script>
  import io from 'socket.io-client';
  const socket = io();

  let name;

  const handleSubmit = () => {
    socket.emit(`create`);
  };

  socket.on(`message`, message => {
    console.log('LOUD AND CLEAR', message)
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
    <button on:click={handleSubmit}>Create</button></div>
</main>
