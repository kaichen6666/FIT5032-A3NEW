<template>
  <div class="all-reviews">
    <h2>All Reviews</h2>

    <div v-if="allProducts.length">
      <div
        v-for="product in allProducts"
        :key="product"
        class="product-reviews"
      >
        <h3 class="product-title">{{ product }}</h3>
        <p class="avg-rating">Average Rating: {{ getAvgRating(product).toFixed(1) }}</p>

        <ul class="reviews-list">
          <li v-for="r in getReviews(product)" :key="r.timestamp" class="review-item">
            <div class="review-top">
              <strong>{{ r.user }}</strong>
              <span class="rating">{{ r.rating }}/5</span>
            </div>
            <p class="review-comment">{{ r.comment || 'No comment' }}</p>
            <small class="review-date">{{ r.date }}</small>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="no-reviews">
      <p>No reviews yet. Be the first to leave a comment!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Get all reviews from localStorage
const reviews = ref([])

// Function to load reviews from localStorage
const loadReviews = () => {
  reviews.value = JSON.parse(localStorage.getItem('reviews') || '[]')
}

// Initial load
onMounted(() => {
  loadReviews()
})

// List of products to display
const allProducts = ref([
  'Nutrition Education Program',
  'Healthy Eating Campaign'
])

// Return reviews for the given product, newest first
const getReviews = (product) => {
  return reviews.value
    .filter(r => r.target.trim().toLowerCase() === product.trim().toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp)
}

// Calculate average rating for a product
const getAvgRating = (product) => {
  const productReviews = getReviews(product)
  if (!productReviews.length) return 0
  const total = productReviews.reduce((sum, r) => sum + r.rating, 0)
  return total / productReviews.length
}
</script>

<style scoped>
.all-reviews {
  max-width: 720px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Each product section */
.product-reviews {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.product-reviews:hover {
  transform: translateY(-2px);
}

.product-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.avg-rating {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.8rem;
}

/* Review list */
.reviews-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-item {
  border-top: 1px solid #e0e0e0;
  padding: 0.6rem 0;
}

.review-item:first-child {
  border-top: none;
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.rating {
  color: #ff9800;
  font-weight: 600;
}

.review-comment {
  margin: 0.2rem 0 0.4rem 0;
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
