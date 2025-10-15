<template>
  <div>
    <!-- Navigation bar, button in the upper right corner -->
    <div class="d-flex justify-content-end mb-4">
      <!-- 登录下拉 -->
      <div class="dropdown me-2">
        <button
          class="btn btn-outline-primary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
        >
          Login
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" @click="$emit('go-login', 'user')">User</a>
          </li>
          <li>
            <a class="dropdown-item" @click="$emit('go-login', 'admin')">Admin</a>
          </li>
        </ul>
      </div>

      <!-- 注册按钮 -->
      <button class="btn btn-outline-secondary" @click="$emit('go-register')">Register</button>
    </div>

    <!-- Main content -->
    <div class="text-center">
      <h1>Public health through nutrition education</h1>
      <!-- Homepage content -->

      <AllReviews />
    </div>
  </div>
</template>

<script setup>
import AllReviews from './AllReviews.vue'
</script>