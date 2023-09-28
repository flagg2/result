import { Err, Ok, Result } from "./Result"

type AsyncResult<T, E = null> = Promise<Result<T, E>>

export { Result, Err, Ok }
export type { AsyncResult }
