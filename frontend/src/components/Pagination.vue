<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['change'])

function changePage(p) {
  if (p >= 1 && p <= props.totalPages && p !== props.currentPage) {
    emit('change', p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination-container">
    <button
      class="page-btn"
      :disabled="currentPage <= 1"
      @click="changePage(currentPage - 1)"
    >
      上一页
    </button>
    <div class="page-numbers">
      <button
        v-for="p in totalPages"
        :key="p"
        :class="['page-num-btn', { active: p === currentPage }]"
        @click="changePage(p)"
      >
        {{ p }}
      </button>
    </div>
    <button
      class="page-btn"
      :disabled="currentPage >= totalPages"
      @click="changePage(currentPage + 1)"
    >
      下一页
    </button>
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 2.5rem 0 1rem;
}

.page-btn, .page-num-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover, .page-num-btn:not(.active):hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.page-num-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
  font-weight: 600;
}

.page-numbers {
  display: flex;
  gap: 6px;
}
</style>
