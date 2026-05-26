<template>
  <div class="game-info">
    <div class="info-section">
      <div class="info-label">当前回合</div>
      <div class="info-value">
        <span class="stone-icon" :class="currentPlayer === 1 ? 'black' : 'white'"></span>
        {{ currentPlayer === 1 ? '黑棋' : '白棋' }}
      </div>
    </div>

    <div class="info-section">
      <div class="info-label">黑棋已落</div>
      <div class="info-value">{{ blackCount }} 子</div>
    </div>

    <div class="info-section">
      <div class="info-label">白棋已落</div>
      <div class="info-value">{{ whiteCount }} 子</div>
    </div>

    <div class="info-section score-section">
      <div class="info-label">胜负记录</div>
      <div class="score-row">
        <div class="score-item">
          <span class="stone-icon black"></span>
          <span class="score-text">{{ blackWins }} 胜</span>
        </div>
        <div class="score-divider">:</div>
        <div class="score-item">
          <span class="score-text">{{ whiteWins }} 胜</span>
          <span class="stone-icon white"></span>
        </div>
      </div>
    </div>

    <div class="button-section">
      <button @click="$emit('start')" class="action-btn">开始新局</button>
      <button @click="$emit('surrender')" class="action-btn surrender">认输</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  board: Object,
  currentPlayer: Number,
  blackWins: Number,
  whiteWins: Number
})

defineEmits(['start', 'surrender'])

const blackCount = computed(() => {
  return props.board.cells.filter(cell => cell === 1).length
})

const whiteCount = computed(() => {
  return props.board.cells.filter(cell => cell === 2).length
})
</script>

<style scoped>
.game-info {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  min-width: 240px;
}

.info-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.info-section:last-of-type {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
}

.info-value {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stone-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.stone-icon.black {
  background: #333;
}

.stone-icon.white {
  background: #e0e0e0;
}

.score-section .info-label {
  margin-bottom: 12px;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-text {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.score-divider {
  font-size: 24px;
  font-weight: 700;
  color: #bbb;
}

.button-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.action-btn {
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e8e8e8;
}

.action-btn.surrender {
  background: #fff5f5;
  border-color: #ffcdd2;
  color: #c62828;
}

.action-btn.surrender:hover {
  background: #ffebee;
}
</style>
