import { Err, Ok, Result } from "./Result"

type UnwrapOk<T> = T extends Ok<infer U> ? U : never
type UnwrapErr<T> = T extends Err<infer E> ? E : never

export type Merged<T> = Result<UnwrapOk<T>, UnwrapErr<T>>
