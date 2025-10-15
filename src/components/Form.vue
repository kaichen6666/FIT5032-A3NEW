<template>
  <div class="form-container">
    <!-- 顶部导航按钮 -->
    <div class="d-flex justify-content-end mb-4">
      <button class="btn btn-outline-secondary me-2" @click="$emit('go-home')">Return Home</button>
      <button class="btn btn-outline-info" @click="$emit('go-login')">Login</button>
    </div>

    <h2>Register</h2>

    <form @submit.prevent="submitForm">
      <!-- 用户名和邮箱同一行 -->
      <div class="row mb-3">
        <div class="col">
          <label class="form-label">Username</label>
          <input
            type="text"
            v-model="formData.username"
            class="form-control"
            @blur="validateName(true)"
          />
          <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
        </div>
        <div class="col">
          <label class="form-label">Email</label>
          <input
            type="email"
            v-model="formData.email"
            class="form-control"
            @blur="validateEmail(true)"
          />
          <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col">
          <label class="form-label">Password</label>
          <input
            type="password"
            v-model="formData.password"
            class="form-control"
            @blur="validatePassword(true)"
          />
          <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
        </div>
        <div class="col">
          <label class="form-label">Confirm Password</label>
          <input
            type="password"
            v-model="formData.confirmPassword"
            class="form-control"
            @blur="validateConfirmPassword(true)"
          />
          <div v-if="errors.confirmPassword" class="text-danger">{{ errors.confirmPassword }}</div>
        </div>
      </div>

      

      <div class="mb-3 form-check">
        <input
          type="checkbox"
          v-model="formData.isAustralian"
          class="form-check-input"
          id="isAustralian"
          @change="validateResident(true)"
        />
        <label class="form-check-label" for="isAustralian">I am Australian</label>
        <div v-if="errors.isAustralian" class="text-danger">{{ errors.isAustralian }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Gender</label>
        <select v-model="formData.gender" class="form-select" @change="validateGender(true)">
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Reason</label>
        <textarea
          v-model="formData.reason"
          class="form-control"
          @blur="validateReason(true)"
        ></textarea>
        <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
      </div>

      <button type="submit" class="btn btn-primary">Register</button>
    </form>

    <!-- 已提交内容显示 -->
    <div v-if="submittedCards.length > 0" class="mt-4">
      <h3>Submitted Users:</h3>
      <ul class="list-group">
        <li v-for="(card, index) in submittedCards" :key="index" class="list-group-item">
          {{ card.username }} - {{ card.email }} - {{ card.gender }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 表单数据
const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  isAustralian: false,
  reason: '',
  gender: '',
})

// 错误信息
const errors = ref({
  username: null,
  password: null,
  confirmPassword: null,
  email: null,
  isAustralian: null,
  reason: null,
  gender: null,
})

// 已提交用户
const submittedCards = ref([])

// 简单清理函数，去掉潜在 HTML 标签，避免 XSS
const sanitizeInput = (value) => {
  if (!value) return ''
  return value.replace(/<.*?>/g, '').trim()
}

// 清空表单
const clearForm = () => {
  Object.keys(formData.value).forEach((key) => {
    if (typeof formData.value[key] === 'boolean') formData.value[key] = false
    else formData.value[key] = ''
  })
  Object.keys(errors.value).forEach((key) => {
    errors.value[key] = null
  })
}

// 表单提交
const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateEmail(true)
  validateResident(true)
  validateGender(true)
  validateReason(true)

  if (
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.email &&
    !errors.value.isAustralian &&
    !errors.value.gender &&
    !errors.value.reason
  ) {
    submittedCards.value.push({
      username: sanitizeInput(formData.value.username),
      // 密码通常不展示在前端，这里只演示存储
      password: formData.value.password,
      email: sanitizeInput(formData.value.email),
      isAustralian: formData.value.isAustralian,
      reason: sanitizeInput(formData.value.reason),
      gender: sanitizeInput(formData.value.gender),
    })
    clearForm()
  }
}

// 验证函数
const validateName = () => {
  errors.value.username =
    formData.value.username.length < 3 ? 'Name must be at least 3 chars' : null
}

const validatePassword = () => {
  const pw = formData.value.password
  if (pw.length < 8) errors.value.password = 'Password must be at least 8 chars'
  else if (!/[A-Z]/.test(pw)) errors.value.password = 'Must include uppercase'
  else if (!/[a-z]/.test(pw)) errors.value.password = 'Must include lowercase'
  else if (!/\d/.test(pw)) errors.value.password = 'Must include number'
  else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) errors.value.password = 'Must include special char'
  else errors.value.password = null
}

const validateConfirmPassword = () => {
  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Confirm password is required'
  } else if (formData.value.confirmPassword !== formData.value.password) {
    errors.value.confirmPassword = 'Passwords do not match'
  } else {
    errors.value.confirmPassword = null
  }
}

const validateEmail = () => {
  const email = formData.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) errors.value.email = 'Email is required'
  else if (!emailRegex.test(email)) errors.value.email = 'Invalid email format'
  else errors.value.email = null
}

const validateResident = () => {
  errors.value.isAustralian = formData.value.isAustralian ? null : 'You must be an Australian'
}

const validateGender = () => {
  errors.value.gender = formData.value.gender ? null : 'You must select a gender'
}

const validateReason = () => {
  errors.value.reason = formData.value.reason ? null : 'Reason is required'
}
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}
.list-group-item {
  padding: 10px;
}
.text-danger {
  font-size: 0.875rem;
}
</style>
