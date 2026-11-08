import type { PathParams } from '../src/index.ts'

describe('PathParams', () => {
  it('extracts required parameters', () => {
    expectTypeOf<PathParams<'/users/:id/posts/:postId'>>().toEqualTypeOf<{
      id: string
      postId: string
    }>()
  })

  it('extracts wildcards as arrays', () => {
    expectTypeOf<PathParams<'/files/*path'>>().toEqualTypeOf<{ path: string[] }>()
  })

  it('marks group parameters optional', () => {
    expectTypeOf<PathParams<'/users{/:id}'>>().toEqualTypeOf<{ id?: string }>()
  })

  it('marks nested group parameters optional', () => {
    expectTypeOf<PathParams<'/a{/b{/:c}}'>>().toEqualTypeOf<{ c?: string }>()
  })

  it('keeps duplicated parameters required when any occurrence is required', () => {
    expectTypeOf<PathParams<'/:id{/:id}'>>().toEqualTypeOf<{ id: string }>()
  })

  it('supports quoted parameter names', () => {
    expectTypeOf<PathParams<'/:"foo-bar"'>>().toEqualTypeOf<{ 'foo-bar': string }>()
  })

  it('ignores escaped markers', () => {
    expectTypeOf<PathParams<'/\\:literal'>>().toEqualTypeOf<Record<never, never>>()
  })

  it('returns never for invalid patterns', () => {
    expectTypeOf<PathParams<'/users/:id?'>>().toEqualTypeOf<never>()
  })
})
