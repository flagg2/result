import { Err, Ok, Result } from "./Result"

type AsyncResult<T, E extends Error> = Promise<Result<T, E>>

export { Result, Err, Ok, AsyncResult }
