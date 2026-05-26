<template>
  <div class="app">
    <h1 class="title">五子棋</h1>

    <div class="game-container">
      <GameBoard
        :board="board"
        :lastMove="lastMove"
        @place="handlePlace"
      />

      <GameInfo
        :board="board"
        :currentPlayer="currentPlayer"
        :blackWins="blackWins"
        :whiteWins="whiteWins"
        @start="showDialog = true"
        @surrender="handleSurrender"
      />
    </div>

    <StartDialog
      :show="showDialog"
      @start="handleStart"
    />

    <div v-if="gameOver" class="result-overlay">
      <div class="result-dialog">
        <h2>{{ winner === playerColor ? '你赢了！' : '你输了！' }}</h2>
        <button @click="showDialog = true; gameOver = false" class="play-again-btn">
          再来一局
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GameBoard from './components/GameBoard.vue'
import GameInfo from './components/GameInfo.vue'
import StartDialog from './components/StartDialog.vue'
import { createBoard, placeStone, checkWin, isBoardFull } from './game/board.js'
import { findBestMove } from './game/ai.js'

const board = ref(createBoard(15))
const currentPlayer = ref(1)
const lastMove = ref(null)
const playerColor = ref(1)
const aiColor = ref(2)
const difficulty = ref('easy')
const showDialog = ref(true)
const gameOver = ref(false)
const winner = ref(null)
const blackWins = ref(0)
const whiteWins = ref(0)

function handleStart(config) {
  board.value = createBoard(config.size)
  playerColor.value = config.playerColor
  aiColor.value = config.playerColor === 1 ? 2 : 1
  difficulty.value = config.difficulty
  currentPlayer.value = 1
  lastMove.value = null
  showDialog.value = false
  gameOver.value = false

  if (aiColor.value === 1) {
    setTimeout(() => {
      const move = findBestMove(board.value, aiColor.value, difficulty.value)
      if (move) {
        placeStone(board.value, move.x, move.y, aiColor.value)
        lastMove.value = move
        currentPlayer.value = playerColor.value
      }
    }, 100)
  }
}

function handlePlace({ x, y }) {
  if (gameOver.value || currentPlayer.value !== playerColor.value) return

  const success = placeStone(board.value, x, y, playerColor.value)
  if (!success) return

  lastMove.value = { x, y }

  if (checkWin(board.value, x, y)) {
    winner.value = playerColor.value
    if (playerColor.value === 1) blackWins.value++
    else whiteWins.value++
    gameOver.value = true
    return
  }

  if (isBoardFull(board.value)) {
    gameOver.value = true
    return
  }

  currentPlayer.value = aiColor.value

  setTimeout(() => {
    const move = findBestMove(board.value, aiColor.value, difficulty.value)
    if (move) {
      placeStone(board.value, move.x, move.y, aiColor.value)
      lastMove.value = move

      if (checkWin(board.value, move.x, move.y)) {
        winner.value = aiColor.value
        if (aiColor.value === 1) blackWins.value++
        else whiteWins.value++
        gameOver.value = true
        return
      }

      if (isBoardFull(board.value)) {
        gameOver.value = true
        return
      }

      currentPlayer.value = playerColor.value
    }
  }, 100)
}

function handleSurrender() {
  if (!confirm('确定要认输吗？')) return
  winner.value = aiColor.value
  if (aiColor.value === 1) blackWins.value++
  else whiteWins.value++
  gameOver.value = true
}
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 600;
}

.game-container {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: flex-start;
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}

.result-dialog {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.result-dialog h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 28px;
  color: #333;
}

.play-again-btn {
  padding: 12px 32px;
  background: #333;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.play-again-btn:hover {
  background: #444;
}

@media (max-width: 900px) {
  .game-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
