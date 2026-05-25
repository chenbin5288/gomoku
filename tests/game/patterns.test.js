import { describe, it, expect } from 'vitest'
import { identifyPattern, PATTERN_SCORES, evaluatePosition } from '../../src/game/patterns.js'
import { createBoard, placeStone } from '../../src/game/board.js'

describe('identifyPattern', () => {
  it('应该识别连五', () => {
    expect(identifyPattern('11111')).toBe('FIVE')
  })

  it('应该识别活四', () => {
    expect(identifyPattern('011110')).toBe('OPEN_FOUR')
  })

  it('应该识别冲四', () => {
    expect(identifyPattern('011112')).toBe('FOUR')
    expect(identifyPattern('211110')).toBe('FOUR')
  })

  it('应该识别活三', () => {
    expect(identifyPattern('01110')).toBe('OPEN_THREE')
  })

  it('应该识别眠三', () => {
    expect(identifyPattern('01112')).toBe('THREE')
    expect(identifyPattern('21110')).toBe('THREE')
  })
})

describe('evaluatePosition', () => {
  it('应该评估空位的攻击价值', () => {
    const board = createBoard(15)
    placeStone(board, 6, 7, 1)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 7, 1)
    const score = evaluatePosition(board, 9, 7, 1)
    expect(score).toBeGreaterThan(0)
  })
})
