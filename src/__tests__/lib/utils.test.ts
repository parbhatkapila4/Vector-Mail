import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', false && 'hidden', 'visible')).toBe('base-class visible')
    })

    it('removes duplicate classes', () => {
      expect(cn('px-4 py-2', 'px-4')).toBe('py-2 px-4')
    })

    it('handles undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })
  })
})

