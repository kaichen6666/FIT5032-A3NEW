<template>
  <div class="admin-home">
    <div class="header">
      <h1>Administrator Homepage</h1>
      <button class="btn btn-secondary" @click="$emit('logout')">Logout</button>
    </div>

    <p>
      This is the administrator's functional area, such as user management, system settings, etc.
    </p>
  </div>
</template>

<script setup></script>

<style scoped>
.admin-home {
  max-width: 600px;
  margin: 0 auto;
}

/* The header uses flex layout, with the title on the left and the button on the right */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
