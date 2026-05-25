import { describe, it, expect } from 'vitest'
import { getCandidates, findBestMove } from '../../src/game/ai.js'
import { createBoard, placeStone } from '../../src/game/board.js'

describe('getCandidates', () => {
  it('空棋盘应该返回中心点', () => {
    const board = createBoard(15)
    const candidates = getCandidates(board)
    expect(candidates).toContainEqual({ x: 7, y: 7 })
  })

  it('应该返回已有棋子周围的空位', () => {
    const board = createBoard(15)
    placeStone(board, 7, 7, 1)
    const candidates = getCandidates(board)
    expect(candidates).toContainEqual({ x: 8, y: 7 })
    expect(candidates).toContainEqual({ x: 6, y: 7 })
    expect(candidates).not.toContainEqual({ x: 0, y: 0 })
  })
})

describe('findBestMove', () => {
  it('应该返回一个合法的落子位置', () => {
    const board = createBoard(15)
    placeStone(board, 7, 7, 1)
    const move = findBestMove(board, 2, 'easy')
    expect(board.cells[move.y * board.size + move.x]).toBe(0)
  })

  it('应该优先堵截对手的冲四', () => {
    // 运行多次以消除随机性影响
    const results = []
    for (let i = 0; i < 20; i++) {
      const board = createBoard(15)
      placeStone(board, 5, 7, 1)
      placeStone(board, 6, 7, 1)
      placeStone(board, 7, 7, 1)
      placeStone(board, 8, 7, 1)
      const move = findBestMove(board, 2, 'easy')
      results.push(move)
    }
    // 20 次中至少有 1 次堵截在 [4, 9] 位置
    const blockingMoves = results.filter(m => [4, 9].includes(m.x))
    expect(blockingMoves.length).toBeGreaterThan(0)
  })
})

describe('findBestMove with minimax', () => {
  it('中等难度应该使用 Minimax 搜索', () => {
    const board = createBoard(15)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 7, 2)
    const move = findBestMove(board, 2, 'medium')
    expect(move).toBeDefined()
    expect(move).toHaveProperty('x')
    expect(move).toHaveProperty('y')
  })

  it('困难难度应该返回合理落子', () => {
    const board = createBoard(15)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 7, 2)
    placeStone(board, 6, 6, 1)
    const move = findBestMove(board, 2, 'hard')
    expect(move).toBeDefined()
  })
})
