export type Result<T, E = Error> = Ok<T, E> | Err<T, E>

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
   export function ok<T, E = never>(data: T): Result<T, E> {
      return new Ok(data)
   }

   export function err<E, T = never>(err: E): Result<T, E> {
      return new Err(err)
   }

   export function from<T, E extends Error>(
      fnOrThenable: Promise<T>,
   ): Promise<Result<T, E>>
   export function from<T, E extends Error>(
      fnOrPromise: () => Promise<T>,
   ): Promise<Result<T, E>>
   export function from<T, E extends Error>(fnOrPromise: () => T): Result<T, E>
   export function from<T, E = Error>(
      fnOrPromise: (() => T | Promise<T>) | Promise<T>,
   ): Result<T, E> | Promise<Result<T, E>> {
      try {
         if (isPromise<T>(fnOrPromise)) {
            return new Promise<Result<T, E>>((resolve) => {
               fnOrPromise
                  .then((data) => {
                     resolve(new Ok(data))
                  })
                  .catch((err) => {
                     resolve(new Err(err))
                  })
            })
         }
         const result = fnOrPromise()
         if (isPromise<T>(result)) {
            return new Promise<Result<T, E>>((resolve) => {
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
            return new Err(err) as unknown as Result<T, E>
         }
         return new Err(new Error("Unknown error")) as unknown as Result<T, E>
      }
   }
}
export abstract class _Result<T, E> {
   public isOk(): this is Ok<T, E> {
      return this instanceof Ok
   }

   public isErr(): this is Err<T, E> {
      return this instanceof Err
   }

   // public and<D>(result: ResultT<D, E>): ResultT<D, E> {
   //    if (this.isOk()) {
   //       return result
   //    } else if (this.isErr()) {
   //       return this as unknown as ResultT<D, E>
   //    }
   //    throw new Error("Invalid state")
   // }

   public andThen<D>(fn: (data: T) => Result<D, E>): Result<D, E> {
      if (this.isOk()) {
         return fn(this.value)
      } else if (this.isErr()) {
         return this as unknown as Result<D, E>
      }
      throw new Error("Invalid state")
   }

   // public or<F>(result: ResultT<T, F>): ResultT<T, F> {
   //    if (this.isOk()) {
   //       return this as unknown as ResultT<T, F>
   //    } else if (this.isErr()) {
   //       return result
   //    }
   //    throw new Error("Invalid state")
   // }

   // public orElse<F>(
   //    fn: (err: E) => ResultT<T, F>,
   // ): ResultT<T, F> {
   //    if (this.isOk()) {
   //       return this as unknown as ResultT<T, F>
   //    } else if (this.isErr()) {
   //       return fn(this.error)
   //    }
   //    throw new Error("Invalid state")
   // }

   // public chain<D>(
   //    fn: (previous: ResultT<T, E>) => ResultT<D, E>,
   // ): ResultT<D, E> {
   //    if (!this.isOk() && !this.isErr()) {
   //       throw new Error("Invalid state")
   //    }
   //    return fn(this)
   // }

   // public match = <D>(match: { ok: (data: T) => D; err: (err: E) => D }): D => {
   //    if (this.isOk()) {
   //       return match.ok(this.value)
   //    } else if (this.isErr()) {
   //       return match.err(this.error)
   //    }
   //    throw new Error("Invalid state")
   // }

   public unwrapOrNull(): T | null {
      if (this.isOk()) {
         return this.value
      } else if (this.isErr()) {
         return null
      }
      throw new Error("Invalid state")
   }

   public abstract expect(message: string): T
   public abstract expectErr(message: string): E
   public abstract unwrap(): T
   public abstract unwrapOr(value: T): T
   public abstract unwrapErr(): E
   public abstract unwrapOrThrow(): T
   // public abstract map<D>(fn: (data: T) => D): ResultT<D, E>
   // public abstract mapErr<F>(fn: (err: E) => F): ResultT<T, F>
   // public abstract mapOr<D>(fn: (data: T) => D, value: D): D
   // public abstract mapOrElse<D>(fn: (data: T) => D, value: (err: E) => D): D
}

export class Ok<T, E = Error> extends _Result<T, E> {
   public readonly value: T

   public constructor(value: T) {
      super()
      this.value = value
   }

   // public map<D>(fn: (data: T) => D): Ok<D, E> {
   //    return new Ok(fn(this.value))
   // }

   // public mapOr<D>(fn: (data: T) => D, value: D): D {
   //    return fn(this.value)
   // }

   // public mapOrElse<D>(fn: (data: T) => D, value: (err: E) => D): D {
   //    return fn(this.value)
   // }

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

   public expectErr(message: string): E {
      throw new Error(message)
   }

   public unwrapErr(): E {
      throw new Error("Cannot unwrap an Ok")
   }

   // public mapErr<F>(fn: (err: E) => F): ResultT<T, F> {
   //    return this as unknown as ResultT<T, F>
   // }
}

export class Err<T, E = Error> extends _Result<T, E> {
   public readonly error: E

   public constructor(error: E) {
      super()
      this.error = error
   }

   // TODO: return E and make it work
   public instanceOf<IT extends new (...args: any[]) => any>(
      cons: IT,
   ): this is Err<T, InstanceType<typeof cons>> {
      return this.error instanceof cons
   }

   // public map<D>(fn: (data: T) => D): ResultT<D, E> {
   //    return this as unknown as ResultT<D, E>
   // }

   // public mapOr<D>(fn: (data: T) => D, value: D): D {
   //    return value
   // }

   // public mapOrElse<D>(fn: (data: T) => D, value: (err: E) => D): D {
   //    return value(this.error)
   // }

   // public mapErr<F>(fn: (err: E) => F): ResultT<T, F> {
   //    return new Err(fn(this.error))
   // }

   public unwrapOr(value: T): T {
      return value
   }

   public unwrapErr(): E {
      return this.error
   }

   public unwrap(): T {
      throw new Error("Cannot unwrap an Err")
   }

   public unwrapOrThrow(): T {
      throw this.error as Error
   }

   public expect(message: string): T {
      throw new Error(message)
   }

   public expectErr(message: string): E {
      return this.error
   }
}
