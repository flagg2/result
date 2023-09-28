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
    * @param value The value to contain in the `Ok`.
    */
   export function ok<T>(value: T): Ok<T> {
      return new Ok(value)
   }

   /**
    * Creates a new `Err` variant.
    *
    * @typeparam E The type of the value contained in the `Err`.
    * @param errValue The value to contain in the `Err`.
    * @param origin An optional error to contain in the `Err`.
    */
   export function err<const E = null>(
      errValue: E = null as E,
      origin?: unknown,
   ): Err<E> {
      return new Err(errValue, origin)
   }

   /**
    * Creates a `Result` from a function, a promise, or a promise-returning function.
    * If an error is thrown at any point, it is caught and wrapped in an `Err`.
    * Otherwise, the result is wrapped in an `Ok`.
    *
    * @param fnOrPromise A function, a promise, or a promise-returning function.
    */
   export function from<T, const E>(
      fnOrPromise: Promise<T> | (() => Promise<T>),
      errValue?: E,
   ): Promise<Result<T, E>>

   export function from<T, const E>(
      fnOrPromise: () => T,
      errValue?: E,
   ): Result<T, E>

   export function from<T, const E>(
      fnOrPromise: (() => T | Promise<T>) | Promise<T>,
      errValue = null as E,
   ): Result<T, E> | Promise<Result<T, E>> {
      try {
         if (isPromise<T>(fnOrPromise)) {
            return new Promise<Result<T, E>>((resolve) => {
               fnOrPromise
                  .then((data) => {
                     resolve(new Ok(data))
                  })
                  .catch((error) => {
                     if (error instanceof Error) {
                        resolve(new Err(errValue, error))
                        return
                     }
                     resolve(
                        new Err(errValue, new Error(JSON.stringify(error))),
                     )
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
                     if (err instanceof Error) {
                        resolve(new Err(errValue, err))
                     }
                     resolve(new Err(errValue, new Error(JSON.stringify(err))))
                  })
            })
         }
         return new Ok(result)
      } catch (err) {
         if (err instanceof Error) {
            return new Err(errValue, err)
         }
         return new Err(errValue, new Error(JSON.stringify(err)))
      }
   }
}

// Note: some of the type signatures are a bit loose in order to get better type inference

/**
 * A class representing the result of a computation.
 */
export abstract class _Result<T, E> {
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
    * Returns the contained `Ok` value.
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
    * Returns the contained `Err` value.
    *
    * @throws If the value is an `Ok`, throws an error.
    */

   public abstract unwrapErr(): E

   /**
    * Returns the contained `Ok` value.
    *
    * @throws If the value is an `Err`, throws an error with the provided message.
    */

   public abstract expect(message: string): T

   /**
    * Returns the contained `Err` value.
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

   public abstract match<U, V>(fn: {
      ok: (value: T) => U
      err: (errValue: E) => V
   }): U | V

   /**
    * Calls op if the result is Ok, otherwise returns the Err value of self.
    *
    * @param fn The function to call if the result is an `Ok`.
    */

   public abstract andThen<U>(fn: (value: T) => Result<U>): unknown

   /**
    * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
    *
    * @param fn The function to call if the result is an `Ok`.
    */

   public abstract map(fn: (value: T) => unknown): unknown

   /**
    * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
    *
    * @param fn The function to call if the result is an `Err`.
    */

   public abstract mapErr(fn: (errValue: E) => unknown): unknown
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

   public match<U>(fn: { ok: (value: T) => U; err: unknown }): U {
      return fn.ok(this.value)
   }

   public andThen<U>(fn: (data: T) => Result<U>): Result<U> {
      return fn(this.value)
   }

   public map<U>(fn: (data: T) => U): Ok<U> {
      return Result.ok(fn(this.value))
   }

   public mapErr(fn: unknown): this {
      return this
   }
}

/**
 * A class representing a failed result of a computation.
 *
 * @typeparam E The type of the value contained in the `Err`.
 */
export class Err<const E> extends _Result<never, E> {
   public readonly errValue: E
   public readonly origin: Error

   public constructor(errValue: E = null as E, origin?: unknown) {
      super()
      this.errValue = errValue
      if (origin instanceof Error) {
         this.origin = origin
      } else {
         this.origin = new Error("Unspecified error")
      }
   }

   public unwrapOr<T>(errValue: T): T {
      return errValue
   }

   public unwrapErr(): E {
      return this.errValue
   }

   public unwrap(): never {
      throw new Error("Cannot unwrap an Err", { cause: this.origin })
   }

   public expect(message: string): never {
      throw new Error(message, { cause: this.origin })
   }

   public expectErr(message: string): E {
      return this.errValue
   }

   public match<V>(fn: { ok: unknown; err: (errValue: E) => V }): V {
      return fn.err(this.errValue)
   }

   public andThen(fn: unknown): this {
      return this
   }

   public map(fn: unknown): this {
      return this
   }

   public mapErr<const F>(fn: (errValue: E) => F): Err<F> {
      return Result.err(fn(this.errValue), this.origin)
   }
}

function deep1() {
   return Result.from(() => {
      throw new Error("deep1")
      return 1
   }, "deep1")
}

function deep2() {
   return deep1().mapErr((err) => {
      return err
   })
}

function deep3() {
   return deep2()
}

const x = deep3()

if (x.isErr()) {
   console.log(x.value)
}
