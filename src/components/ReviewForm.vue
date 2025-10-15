<template>
  <div class="review-form">
    <h3>Rate {{ target }}</h3>
    <label>
      Rating:
      <select v-model="rating">
        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>
    <label>
      Comment:
      <input type="text" v-model="comment" />
    </label>
    <button @click="submitReview">Submit</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { reviews } from '../db.js'

const props = defineProps({
  target: String,
})

const rating = ref(5)
const comment = ref('')

const submitReview = () => {
  reviews.push({
    user: 'CurrentUser', // Use the actual login username here
    target: props.target,
    rating: rating.value,
    comment: comment.value,
  })
  alert('Review submitted!')
  rating.value = 5
  comment.value = ''
}
</script>
