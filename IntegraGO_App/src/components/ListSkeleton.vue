<template>
  <div class="list-skeleton" role="status" aria-label="Cargando folios">
    <div v-for="row in 3" :key="row" class="skeleton-row">
      <span />
      <div>
        <span />
        <span />
      </div>
      <span />
    </div>
  </div>
</template>
