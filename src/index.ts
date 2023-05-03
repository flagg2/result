import { Err, Ok, Result } from "./Result"

type AsyncResult<T, E = Error> = Promise<Result<T, E>>

export { Result, Err, Ok, AsyncResult }
