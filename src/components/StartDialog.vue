<template>
  <div v-if="show" class="dialog-overlay">
    <div class="dialog">
      <h2>开始新局</h2>

      <div class="form-group">
        <label>棋盘大小</label>
        <select v-model="boardSize">
          <option value="15">15 × 15</option>
          <option value="19">19 × 19</option>
          <option value="custom">自定义</option>
        </select>
        <input
          v-if="boardSize === 'custom'"
          v-model.number="customSize"
          type="number"
          min="5"
          max="30"
          placeholder="5-30"
        />
      </div>

      <div class="form-group">
        <label>AI 难度</label>
        <select v-model="difficulty">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>

      <div class="form-group">
        <label>执子选择</label>
        <select v-model="playerColor">
          <option value="1">我执黑（先手）</option>
          <option value="2">我执白（后手）</option>
        </select>
      </div>

      <button @click="start" class="start-btn">开始</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['start'])

const boardSize = ref('15')
const customSize = ref(15)
const difficulty = ref('easy')
const playerColor = ref('1')

function start() {
  const size = boardSize.value === 'custom' ? customSize.value : parseInt(boardSize.value)
  emit('start', {
    size,
    difficulty: difficulty.value,
    playerColor: parseInt(playerColor.value)
  })
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.dialog {
  background: white;
  padding: 32px;
  border-radius: 12px;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog h2 {
  margin-top: 0;
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.start-btn {
  width: 100%;
  padding: 12px;
  background: #333;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

.start-btn:hover {
  background: #444;
}
</style>
