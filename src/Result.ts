/**
 * A type representing the result of a computation that may succeed or fail.
 */
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
   /**
    * Creates a new `Ok` variant.
    *
    * @typeparam T The type of the value contained in the `Ok`.
    * @param data The value to contain in the `Ok`.
    */
   export function ok<T>(data: T): Ok<T> {
      return new Ok(data)
   }

   /**
    * Creates a new `Err` variant.
    *
    * @typeparam E The type of the value contained in the `Err`.
    * @param data The value to contain in the `Err`.
    * @param error An optional error to contain in the `Err`.
    */
   export function err<E = null>(
      data: E = null as E,
      error?: Error | string,
   ): Err<E> {
      return new Err(data, error)
   }

   /**
    * Creates a `Result` from a function, a promise, or a promise-returning function.
    * If an error is thrown at any point, it is caught and wrapped in an `Err`.
    * Otherwise, the result is wrapped in an `Ok`.
    *
    * @param fnOrThenable A function, a promise, or a promise-returning function.
    */
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
                     if (err instanceof Error) {
                        resolve(new Err(null, err))
                     }
                     resolve(new Err(null, new Error(JSON.stringify(err))))
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

// Note: some of the type signatures are a bit loose in order to get better type inference

/**
 * A class representing the result of a computation.
 */
export abstract class _Result<T, E> {
   public abstract readonly value: T | E

   /**
    * Returns `true` if the result is an `Ok` variant.
    */

   public isOk(): this is Ok<T> {
      return this instanceof Ok
   }

   /**
    * Returns `true` if the result is an `Err` variant.
    */

   public isErr(): this is Err<E> {
      return this instanceof Err
   }

   /**
    * Returns the contained `Ok` value, consuming the `self` value.
    *
    * @throws If the value is an `Err`, throws an error alongisde its cause.
    */

   public abstract unwrap(): T

   /**
    * Returns  the contained `Ok` value or a provided default.
    *
    * @param defaultValue The default value to return if the result is an `Err`.
    */

   public abstract unwrapOr<U>(defaultValue: T): T | U

   /**
    * Returns the contained `Err` value, consuming the `self` value.
    *
    * @throws If the value is an `Ok`, throws an error.
    */

   public abstract unwrapErr(): E

   /**
    * Returns the contained `Ok` value, consuming the `self` value.
    *
    * @throws If the value is an `Err`, throws an error with the provided message.
    */

   public abstract expect(message: string): T

   /**
    * Returns the contained `Err` value, consuming the `self` value.
    *
    * @throws If the value is an `Ok`, throws an error with the provided message.
    */

   public abstract expectErr(message: string): E

   /**
    * Calls an appropriate function based on the result based on if it is an `Ok` or an `Err`.
    *
    * @param fn.ok The function to call if the result is an `Ok`.
    * @param fn.err The function to call if the result is an `Err`.
    */

   public abstract match<D>(fn: {
      ok: (value: T) => D
      err: (value: E) => D
   }): D

   /**
    * Calls op if the result is Ok, otherwise returns the Err value of self.
    *
    * @param fn The function to call if the result is an `Ok`.
    */

   public abstract andThen<D>(fn: (data: T) => Result<D>): unknown

   /**
    * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
    *
    * @param fn The function to call if the result is an `Ok`.
    */

   public abstract map(fn: (data: T) => unknown): unknown

   /**
    * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
    *
    * @param fn The function to call if the result is an `Err`.
    */

   public abstract mapErr(fn: (error: E) => unknown): unknown
}

/**
 * A class representing a successful result of a computation.
 *
 * @typeparam T The type of the value contained in the `Ok`.
 */
export class Ok<T> extends _Result<T, never> {
   public readonly value: T

   public constructor(value: T) {
      super()
      this.value = value
   }

   public unwrap(): T {
      return this.value
   }

   public unwrapOr(value: unknown): T {
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

   public match<D>(fn: { ok: (value: T) => D; err: unknown }): D {
      return fn.ok(this.value)
   }

   public andThen<D>(fn: (data: T) => Result<D>): Result<D> {
      return fn(this.value)
   }

   public map<D>(fn: (data: T) => D): Ok<D> {
      return Result.ok(fn(this.value))
   }

   public mapErr<D>(fn: unknown): this {
      return this
   }
}

/**
 * A class representing a failed result of a computation.
 *
 * @typeparam E The type of the value contained in the `Err`.
 */
export class Err<E> extends _Result<never, E> {
   public readonly value: E
   public readonly error: Error

   public constructor(value: E = null as E, error?: Error | string) {
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

   public unwrapOr<T>(value: T): T {
      return value
   }

   public unwrapErr(): E {
      return this.value
   }

   public unwrap(): never {
      throw new Error("Cannot unwrap an Err", { cause: this.error })
   }

   public expect(message: string): never {
      throw new Error(message, { cause: this.error })
   }

   public expectErr(message: string): E {
      return this.value
   }

   public match<D>(fn: { ok: unknown; err: (value: E) => D }): D {
      return fn.err(this.value)
   }

   public andThen(fn: unknown): this {
      return this
   }

   public map<D>(fn: unknown): this {
      return this
   }

   public mapErr<D>(fn: (error: E) => D): Err<D> {
      return Result.err(fn(this.value))
   }
}

function x(s: boolean, b: boolean = true) {
   if (s) {
      return Result.ok(1)
   }

   return Result.err()
}

function y() {
   const result = x(true).map((data) => "3")
}

y()
