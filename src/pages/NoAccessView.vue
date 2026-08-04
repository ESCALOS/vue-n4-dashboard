<template>
  <section class="no-access" aria-labelledby="no-access-title">
    <div class="no-access-icon" aria-hidden="true">!</div>
    <h1 id="no-access-title">No tienes vistas habilitadas</h1>
    <p>Solicita a un administrador que habilite las vistas que necesitas.</p>
  </section>
</template>

<style scoped>
.no-access {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #e5e7eb;
}

.no-access-icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  border: 2px solid #f59e0b;
  border-radius: 9999px;
  color: #fbbf24;
  font-size: 2rem;
  font-weight: 700;
}

h1 { margin: 0; font-size: 1.5rem; }
p { margin-top: 0.75rem; color: #9ca3af; }
</style>
