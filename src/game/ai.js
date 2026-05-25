import { evaluatePosition } from './patterns.js'
import { checkWin } from './board.js'

/**
 * 获取候选落子点
 * 空棋盘返回中心点，否则返回已有棋子周围2格范围内的空位
 * @param {Object} board - 棋盘对象
 * @returns {Array<{x: number, y: number}>} 候选位置列表
 */
export function getCandidates(board) {
  if (board.cells.every(cell => cell === 0)) {
    const center = Math.floor(board.size / 2)
    return [{ x: center, y: center }]
  }

  const candidates = []
  const range = 2

  for (let y = 0; y < board.size; y++) {
    for (let x = 0; x < board.size; x++) {
      if (board.cells[y * board.size + x] !== 0) continue

      let hasNeighbor = false
      for (let dy = -range; dy <= range && !hasNeighbor; dy++) {
        for (let dx = -range; dx <= range && !hasNeighbor; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < board.size && ny >= 0 && ny < board.size) {
            if (board.cells[ny * board.size + nx] !== 0) {
              hasNeighbor = true
            }
          }
        }
      }

      if (hasNeighbor) {
        candidates.push({ x, y })
      }
    }
  }

  return candidates
}

/**
 * 寻找最佳落子位置
 * @param {Object} board - 棋盘对象
 * @param {number} aiColor - AI 棋子颜色（1=黑棋, 2=白棋）
 * @param {string} difficulty - 难度级别（'easy'/'medium'/'hard'）
 * @returns {{x: number, y: number}|null} 最佳落子位置，无候选时返回 null
 */
export function findBestMove(board, aiColor, difficulty = 'easy') {
  const candidates = getCandidates(board)
  if (candidates.length === 0) return null

  const playerColor = aiColor === 1 ? 2 : 1
  const depth = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2

  if (depth === 0) {
    const scoredMoves = candidates.map(pos => {
      const attackScore = evaluatePosition(board, pos.x, pos.y, aiColor)
      const defenseScore = evaluatePosition(board, pos.x, pos.y, playerColor)
      const totalScore = attackScore * 1.1 + defenseScore
      return { ...pos, score: totalScore }
    })

    scoredMoves.sort((a, b) => b.score - a.score)

    if (difficulty === 'easy' && Math.random() < 0.3 && scoredMoves.length > 1) {
      return scoredMoves[1]
    }

    return scoredMoves[0]
  }

  // 对候选点进行评分排序，优化 Alpha-Beta 剪枝效率
  const scoredCandidates = candidates.map(pos => {
    const attackScore = evaluatePosition(board, pos.x, pos.y, aiColor)
    const defenseScore = evaluatePosition(board, pos.x, pos.y, playerColor)
    return { ...pos, score: attackScore * 1.1 + defenseScore }
  })
  scoredCandidates.sort((a, b) => b.score - a.score)

  // 仅搜索排名靠前的候选点以保证性能
  const topCandidates = scoredCandidates.slice(0, 15)

  let bestScore = -Infinity
  let bestMove = topCandidates[0]

  for (const pos of topCandidates) {
    board.cells[pos.y * board.size + pos.x] = aiColor
    const score = minimax(board, depth - 1, false, aiColor, playerColor, -Infinity, Infinity)
    board.cells[pos.y * board.size + pos.x] = 0

    if (score > bestScore) {
      bestScore = score
      bestMove = pos
    }
  }

  return { x: bestMove.x, y: bestMove.y }
}

/**
 * Minimax 搜索 + Alpha-Beta 剪枝
 * @param {Object} board - 棋盘对象
 * @param {number} depth - 剩余搜索深度
 * @param {boolean} isMaximizing - 是否为极大节点（AI 回合）
 * @param {number} aiColor - AI 棋子颜色
 * @param {number} playerColor - 对手棋子颜色
 * @param {number} alpha - Alpha 值
 * @param {number} beta - Beta 值
 * @returns {number} 局面评分
 */
function minimax(board, depth, isMaximizing, aiColor, playerColor, alpha, beta) {
  if (depth === 0) {
    return evaluateBoard(board, aiColor, playerColor)
  }

  const candidates = getCandidates(board)
  const color = isMaximizing ? aiColor : playerColor

  // 评分排序以提升剪枝效率
  const scored = candidates.map(pos => {
    const a = evaluatePosition(board, pos.x, pos.y, aiColor)
    const d = evaluatePosition(board, pos.x, pos.y, playerColor)
    return { ...pos, score: a * 1.1 + d }
  })
  scored.sort((a, b) => b.score - a.score)
  const topCandidates = scored.slice(0, 10)

  if (isMaximizing) {
    let maxScore = -Infinity
    for (const pos of topCandidates) {
      board.cells[pos.y * board.size + pos.x] = color
      if (checkWin(board, pos.x, pos.y)) {
        board.cells[pos.y * board.size + pos.x] = 0
        return 1000000
      }
      const score = minimax(board, depth - 1, false, aiColor, playerColor, alpha, beta)
      board.cells[pos.y * board.size + pos.x] = 0
      maxScore = Math.max(maxScore, score)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return maxScore
  } else {
    let minScore = Infinity
    for (const pos of topCandidates) {
      board.cells[pos.y * board.size + pos.x] = color
      if (checkWin(board, pos.x, pos.y)) {
        board.cells[pos.y * board.size + pos.x] = 0
        return -1000000
      }
      const score = minimax(board, depth - 1, true, aiColor, playerColor, alpha, beta)
      board.cells[pos.y * board.size + pos.x] = 0
      minScore = Math.min(minScore, score)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return minScore
  }
}

/**
 * 评估整个棋盘局面
 * @param {Object} board - 棋盘对象
 * @param {number} aiColor - AI 棋子颜色
 * @param {number} playerColor - 对手棋子颜色
 * @returns {number} 局面总分（正数对 AI 有利，负数对对手有利）
 */
function evaluateBoard(board, aiColor, playerColor) {
  let score = 0
  for (let y = 0; y < board.size; y++) {
    for (let x = 0; x < board.size; x++) {
      const cell = board.cells[y * board.size + x]
      if (cell === aiColor) {
        score += evaluatePosition(board, x, y, aiColor) * 0.1
      } else if (cell === playerColor) {
        score -= evaluatePosition(board, x, y, playerColor) * 0.1
      }
    }
  }
  return score
}
