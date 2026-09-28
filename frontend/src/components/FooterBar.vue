<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="copyright">
        © {{ currentYear }} Simon · Powered by Vue 3 & Spring Boot
      </p>
      <p class="sub-meta">
        记录即思考 · 随缘更新
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  padding: 2.5rem 1.25rem;
  transition: background-color 0.3s, border-color 0.3s;
}

.footer-inner {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.88rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-meta {
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
