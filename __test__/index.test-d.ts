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

  it('rejects adjacent capture tokens', () => {
    expectTypeOf<PathParams<'/:a:b'>>().toEqualTypeOf<never>()
    expectTypeOf<PathParams<'/:a{:b}'>>().toEqualTypeOf<never>()
    expectTypeOf<PathParams<'/{:a}:b'>>().toEqualTypeOf<never>()
    expectTypeOf<PathParams<'/{:a}{:b}'>>().toEqualTypeOf<never>()
  })

  it('accepts captures separated by text', () => {
    expectTypeOf<PathParams<'/:a-:b'>>().toEqualTypeOf<{ a: string; b: string }>()
    expectTypeOf<PathParams<'/:a{/:b}'>>().toEqualTypeOf<{ a: string; b?: string }>()
    expectTypeOf<PathParams<'/:a/*b'>>().toEqualTypeOf<{ a: string; b: string[] }>()
    expectTypeOf<PathParams<'/{:a}-:b'>>().toEqualTypeOf<{ a?: string; b: string }>()
  })

  it('rejects adjacent captures across nested groups', () => {
    expectTypeOf<PathParams<'/{:a{:b}}'>>().toEqualTypeOf<never>()
    expectTypeOf<PathParams<'/:a{/:b{:c}}'>>().toEqualTypeOf<never>()
    expectTypeOf<PathParams<'/{:a{/:b}}:c'>>().toEqualTypeOf<never>()
    expectTypeOf<PathParams<'/:a{/:b}{:c}'>>().toEqualTypeOf<never>()
  })

  it('accepts nested groups separated by text', () => {
    expectTypeOf<PathParams<'/{:a{/:b}}'>>().toEqualTypeOf<{ a?: string; b?: string }>()
    expectTypeOf<PathParams<'/:a{/:b{/:c}}'>>().toEqualTypeOf<{
      a: string
      b?: string
      c?: string
    }>()
    expectTypeOf<PathParams<'/{:a}/{:b}'>>().toEqualTypeOf<{ a?: string; b?: string }>()
    expectTypeOf<PathParams<'/{:a{/:b}}/:c'>>().toEqualTypeOf<{
      a?: string
      b?: string
      c: string
    }>()
  })

  it('returns never for invalid patterns', () => {
    expectTypeOf<PathParams<'/users/:id?'>>().toEqualTypeOf<never>()
  })
})
