import { describe, expect, it } from 'vitest'
import { idDiffers, suggestProjectId } from '../../app/lib/projects'

describe('project ids', () => {
  it('suggest one from a name: lowercase, dashes, a letter first', () => {
    expect(suggestProjectId('Sample radio')).toBe('sample-radio')
    expect(suggestProjectId('  2nd Shop!  ')).toBe('nd-shop')
  })

  it('name a project once when its id is just its name', () => {
    expect(idDiffers({ id: 'sonotas', name: 'Sonotas' })).toBe(false)
    expect(idDiffers({ id: 'fieldnotes', name: 'Field notes' })).toBe(true)
  })
})
