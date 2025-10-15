<template>
  <div class="login-form">
    <!-- 导航按钮 -->
    <div class="d-flex justify-content-end mb-4">
      <button @click="$emit('go-home')" class="btn btn-outline-secondary me-2">Return Home</button>
      <button @click="$emit('go-register')" class="btn btn-outline-info">Register</button>
    </div>

    <!-- 登录标题根据身份 -->
    <h2>{{ loginType === 'admin' ? 'Admin Login' : 'User login' }}</h2>

    <form @submit.prevent="login">
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input type="text" v-model="username" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" v-model="password" class="form-control" />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { adminUsers, normalUsers } from '../db.js'

const props = defineProps({
  loginType: String, // 'user' 或 'admin'
})

const emit = defineEmits(['login-success', 'go-home', 'go-register'])

const username = ref('')
const password = ref('')

const login = () => {
  if (props.loginType === 'admin') {
    const user = adminUsers.find(
      (u) => u.username === username.value && u.password === password.value,
    )
    if (!user) return alert('Admin login failed')
    emit('login-success', { username: username.value, type: 'admin' })
  } else {
    const user = normalUsers.find(
      (u) => u.username === username.value && u.password === password.value,
    )
    if (!user) return alert('User login failed')
    emit('login-success', { username: username.value, type: 'user' })
  }
}
</script>
