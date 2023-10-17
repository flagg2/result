import { Merged } from "./helpers"

/**
 * A type representing the result of a computation that may succeed or fail.
 */
export type Result<T = null, E = null> = Ok<T> | Err<E>

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
   export function ok<T = null>(value: T = null as T): Ok<T> {
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
   export function from<T, const E = null>(
      fnOrPromise: Promise<T> | (() => Promise<T>),
      errValue?: E,
   ): Promise<Result<T, E>>

   export function from<T, const E = null>(
      fnOrPromise: () => T,
      errValue?: E,
   ): Result<T, E>

   export function from<T, const E = null>(
      fnOrPromise: (() => T | Promise<T>) | Promise<T>,
      errValue: E = null as E,
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

   /**
    * Sometimes type inference does not work well with Result unions. This can be the case when using
    * {@link Result.andThen}, {@link Result.match}, {@link Result.map}, or {@link Result.mapErr}.
    * When that happens, call this function to get a type that is easier to work with.
    *
    * @param result The result union to merge.
    */

   export function infer<T extends Result<any, any>>(result: T): Merged<T> {
      return result as Merged<T>
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
    * In order to get type inference, you need to call {@link Result.infer} before calling `match`,
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
    * In order to get type inference, you need to cast the result to `Merged` before calling `andThen`,
    * see {@link Merged}
    *
    * @param fn The function to call if the result is an `Ok`.
    */

   public abstract andThen<U>(fn: (value: T) => Result<U, E>): unknown

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
export class Ok<T = null> extends _Result<T, unknown> {
   public readonly value: T

   public constructor(value: T = null as T) {
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

   public match<U, V>(fn: { ok: (value: T) => U; err: unknown }): V | U {
      return fn.ok(this.value)
   }

   public andThen<U, V>(fn: (data: T) => Result<U, V>): Result<U, V>;
   public andThen<U, V>(fn: (data: T) => Promise<Result<U, V>>): Promise<Result<U, V>>;

   public andThen<U, V>(fn: (data: T) => Result<U, V> |  Promise<Result<U, V>>): Result<U, V> | Promise<Result<U, V>>{
      return fn(this.value)
   }

   public map<U>(fn: (data: T) => U) {
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
export class Err<const E = null> extends _Result<unknown, E> {
   public readonly errValue: E
   public readonly origin: Error

   public constructor(errValue: E = null as E, origin?: unknown) {
      super()
      this.errValue = errValue
      if (origin instanceof Error) {
         this.origin = origin
      } else if (origin !== undefined) {
         this.origin = new Error(JSON.stringify(origin))
      } else {
         this.origin = new Error(JSON.stringify(errValue))
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

   public match<U, V>(fn: { ok: unknown; err: (err: E) => V }): V | U {
      return fn.err(this.errValue)
   }

   public andThen<U, V>(fn: unknown): this {
      return this
   }

   public map(fn: unknown): this {
      return this
   }

   public mapErr<const F>(fn: (errValue: E) => F): Err<F> {
      return Result.err(fn(this.errValue), this.origin)
   }

   public log(): this {
      console.error(`Err: ${this.errValue} with origin ${this.origin.stack}`)
      return this
   }

   public toString(): string {
      return `Err: ${this.errValue} with origin ${this.origin.stack}`
   }
}