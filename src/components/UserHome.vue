<template>
  <div class="user-home">
    <!-- Header -->
    <div class="header">
      <h1>User Homepage</h1>
      <div class="header-buttons">
        <button class="btn btn-outline-secondary" @click="$emit('go-home')">Return Home</button>
        <button class="btn btn-secondary" @click="$emit('logout')">Logout</button>
        <button class="btn btn-danger" @click="clearAllReviews">Clear All Reviews</button>
      </div>
    </div>

    <p class="intro">Welcome to your functional area. Here you can leave reviews and track ratings.</p>

    <!-- Reviews -->
    <div class="reviews-container">
      <Review target="Nutrition Education Program" :current-user="currentUser" />
      <Review target="Healthy Eating Campaign" :current-user="currentUser" />
    </div>
  </div>
</template>

<script setup>
import Review from './Review.vue'

const props = defineProps({
  currentUser: String, 
})

const clearAllReviews = () => {
  localStorage.removeItem('reviews')
  window.location.reload()
}
</script>

<style scoped>
.user-home {
  max-width: 800px;
  margin: 2rem auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  padding: 0 1rem;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  background-color: #f5f5f5;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

/* Intro text */
.intro {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #555;
}

/* Reviews container */
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>