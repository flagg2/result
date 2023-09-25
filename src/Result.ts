export type Result<T, E = null> = Ok<T> | Err<E>

function isPromise<T>(value: unknown): value is Promise<T> {
   return (
      typeof value === "object" &&
      value !== null &&
      typeof (value as Promise<T>).then === "function" &&
      typeof (value as Promise<T>).catch === "function"
   )
}

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-redeclare
export namespace Result {
   export function ok<T>(data: T): Ok<T> {
      return new Ok(data)
   }

   export function err<E>(data: E, error?: Error | string): Err<E> {
      return new Err(data, error)
   }

   export function from<T>(fnOrThenable: Promise<T>): Promise<Result<T>>
   export function from<T>(fnOrPromise: () => Promise<T>): Promise<Result<T>>
   export function from<T, E>(fnOrPromise: () => T): Result<T>
   export function from<T, E>(
      fnOrPromise: (() => T | Promise<T>) | Promise<T>,
   ): Result<T> | Promise<Result<T>> {
      try {
         if (isPromise<T>(fnOrPromise)) {
            return new Promise<Result<T>>((resolve) => {
               fnOrPromise
                  .then((data) => {
                     resolve(new Ok(data))
                  })
                  .catch((error) => {
                     if (error instanceof Error) {
                        resolve(new Err(null, error))
                        return
                     }
                     resolve(new Err(null, new Error(JSON.stringify(error))))
                  })
            })
         }
         const result = fnOrPromise()
         if (isPromise<T>(result)) {
            return new Promise<Result<T>>((resolve) => {
               result
                  .then((data) => {
                     resolve(new Ok(data))
                  })
                  .catch((err) => {
                     resolve(new Err(err))
                  })
            })
         }
         return new Ok(result)
      } catch (err) {
         if (err instanceof Error) {
            return new Err(null, err)
         }
         return new Err(null, new Error(JSON.stringify(err)))
      }
   }
}
export abstract class _Result<T, E> {
   public abstract readonly value: T | E

   public isOk(): this is Ok<T> {
      return this instanceof Ok
   }

   public isErr(): this is Err<E> {
      return this instanceof Err
   }

   public andThen<D>(fn: (data: T) => Result<D, E>): Result<D, E> {
      if (this.isOk()) {
         return fn(this.value)
      } else if (this.isErr()) {
         return this as unknown as Result<D, E>
      }
      throw new Error("Invalid state")
   }

   public abstract expect(message: string): T
   public abstract expectErr(message: string): E
   public abstract unwrap(): T
   public abstract unwrapOr(value: T): T
   public abstract unwrapErr(): E
   public abstract unwrapOrThrow(): T
}

export class Ok<T> extends _Result<T, never> {
   public readonly value: T

   public constructor(value: T) {
      super()
      this.value = value
   }

   public unwrap(): T {
      return this.value
   }

   public unwrapOr(value: T): T {
      return this.value
   }

   public unwrapOrThrow(): T {
      return this.value
   }

   public expect(message: string): T {
      return this.value
   }

   public expectErr(message: string): never {
      throw new Error(message)
   }

   public unwrapErr(): never {
      throw new Error("Cannot unwrap an Ok as an Err")
   }

   public match<D>(fn: { ok: (data: T) => D; err: unknown }): D {
      return fn.ok(this.value)
   }
}

export class Err<E> extends _Result<never, E> {
   public readonly value: E
   public readonly error: Error

   public constructor(value: E, error?: Error | string) {
      super()
      this.value = value
      if (error instanceof Error) {
         this.error = new Error(error.message, {
            cause: error,
         })
      } else if (typeof error === "string") {
         this.error = new Error(error)
      } else {
         this.error = new Error("Unknown error")
      }
   }

   public unwrapOr(value: never): never {
      return value
   }

   public unwrapErr(): E {
      return this.value
   }

   public unwrap(): never {
      throw new Error("Cannot unwrap an Err", { cause: this.error })
   }

   public unwrapOrThrow(): never {
      throw this.error
   }

   public expect(message: string): never {
      throw new Error(message, { cause: this.error })
   }

   public expectErr(message: string): E {
      return this.value
   }

   public match<D>(fn: { ok: unknown; err: (error: E) => D }): D {
      return fn.err(this.value)
   }
}

// function x(s: boolean) {
//    if (s) {
//       return Result.ok(1)
//    }
//    return Result.err("2", new Error("Error"))
// }

// function y() {
//    const result = x(false)

//    const c = result.match({
//       err: (err) => err,
//       ok: (data) => "s",
//    })

//    console.log(c)
// }

// y()
