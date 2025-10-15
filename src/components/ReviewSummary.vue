<template>
  <div>
    <h3>{{ target }} Reviews</h3>
    <p>Average Rating: {{ avgRating.toFixed(1) }}</p>
    <ul>
      <li v-for="r in targetReviews" :key="r.user">
        {{ r.user }}: {{ r.rating }} - {{ r.comment }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { reviews } from '../db.js'

const props = defineProps({
  target: String,
})

const targetReviews = computed(() => reviews.filter((r) => r.target === props.target))

const avgRating = computed(() => {
  if (targetReviews.value.length === 0) return 0
  return targetReviews.value.reduce((sum, r) => sum + r.rating, 0) / targetReviews.value.length
})
</script>
