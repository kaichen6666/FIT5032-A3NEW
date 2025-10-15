<template>
  <div class="review">
    <h3 class="review-title">Rate {{ target }}</h3>

    <!-- Rating Form -->
    <div class="review-form">
      <label>Rating:</label>
      <select v-model="rating">
        <option value="">Select rating</option>
        <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐</option>
      </select>

      <label>Comment:</label>
      <textarea v-model="comment" placeholder="Share your thoughts..." maxlength="200"></textarea>

      <button class="btn btn-primary" @click="submitReview" :disabled="!rating">
        Submit Review
      </button>
    </div>

    <!-- Review Summary -->
    <div v-if="targetReviews.length" class="review-summary">
      <div class="summary-header">
        <h4>Reviews for {{ target }}</h4>
        <div class="aggregate-rating">
          <span class="avg-rating">{{ avgRating.toFixed(1) }}</span>
          <span class="rating-stars">{{ getStarDisplay(avgRating) }}</span>
        </div>
        <small>Based on {{ totalReviews }} review{{ totalReviews !== 1 ? 's' : '' }}</small>
      </div>

      <!-- Individual Reviews -->
      <ul class="reviews-list">
        <li v-for="r in sortedReviews" :key="r.timestamp" class="review-card">
          <div class="review-header">
            <strong>{{ r.user }}</strong>
            <span class="rating-display">{{ getStarDisplay(r.rating) }} ({{ r.rating }}/5)</span>
          </div>
          <p class="review-comment">{{ r.comment || 'No comment provided' }}</p>
          <small class="review-date">{{ r.date }}</small>
        </li>
      </ul>
    </div>

    <!-- Empty state -->
    <div v-else class="no-reviews">
      <p>No reviews yet. Be the first to review {{ target }}!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props for product name and current user
const props = defineProps({
  target: String,
  currentUser: String,
})

// Load existing reviews from localStorage
//const reviews = ref(JSON.parse(localStorage.getItem('reviews') || '[]'))

const reviews = ref([])

onMounted(() => {
  const savedReviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  reviews.value = savedReviews
})

// Form data
const rating = ref('')
const comment = ref('')

// Submit a new review
const submitReview = () => {
  if (!rating.value) return alert('Please select a rating!')

   // Validate comment length
  if (comment.value.length > 200) return alert('Comment too long')


  const newReview = {
    user: props.currentUser,      // Current logged-in user
    target: props.target,         // Product being reviewed
    rating: parseInt(rating.value),
    comment: comment.value.trim(),
    date: new Date().toLocaleString(),
    timestamp: Date.now()
  }

  // Add review to list
  //reviews.value.push(newReview)
   reviews.value = [...reviews.value, newReview]
  // Save to localStorage
  localStorage.setItem('reviews', JSON.stringify(reviews.value))
  // Clear the form
  rating.value = ''
  comment.value = ''
}

// Filter reviews for the current product
const targetReviews = computed(() => reviews.value.filter(r => r.target === props.target))

// Total reviews count
const totalReviews = computed(() => targetReviews.value.length)

// Average rating
const avgRating = computed(() => {
  if (!targetReviews.value.length) return 0
  const sum = targetReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / targetReviews.value.length
})

// Sort reviews by latest first
const sortedReviews = computed(() => [...targetReviews.value].sort((a, b) => b.timestamp - a.timestamp))

// Generate star display string
const getStarDisplay = (rating) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
  return '⭐'.repeat(fullStars) + '✨'.repeat(halfStar) + '☆'.repeat(5 - fullStars - halfStar)
}
</script>

<style scoped>
.review {
  max-width: 700px;
  margin: 0 auto 2rem;
  padding: 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Form styling */
.review-form {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.review-form select,
.review-form textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.review-form button {
  align-self: flex-start;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  border-radius: 6px;
}

/* Review summary */
.review-summary {
  background: #ffffff;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.summary-header {
  text-align: center;
  margin-bottom: 1rem;
}

.aggregate-rating {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin: 0.3rem 0;
}

.reviews-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
  background: #fefefe;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.rating-display {
  color: #007bff;
}

.review-comment {
  margin: 0.5rem 0;
  line-height: 1.4;
}

.review-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.no-reviews {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}
</style>