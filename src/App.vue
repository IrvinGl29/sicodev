<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div>
        <strong>SICODEV</strong>
        <span>Sistema de Control de Devoluciones</span>
      </div>
    </header>

    <nav class="app-nav">
      <RouterLink to="/">Nueva devolución</RouterLink>
      <RouterLink to="/agregar-producto">Productos</RouterLink>
      <RouterLink to="/resumen">Resumen</RouterLink>
      <RouterLink to="/configuracion">Configuración</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped>
.app-header {
  padding: 20px;
  background: #611232;
  color: white;
}

.app-header strong {
  display: block;
  font-size: 24px;
}

.app-header span {
  font-size: 14px;
}

.app-nav {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
}

.app-nav a {
  color: #444;
  text-decoration: none;
}

.app-nav a.router-link-active {
  color: #611232;
  font-weight: bold;
}
</style>
