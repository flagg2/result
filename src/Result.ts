abstract class _Result<T, E extends Error = Error> {
   public static ok<Data>(data: Data): _Result<Data, Error> {
      return new Ok(data)
   }

   public static err<E extends Error>(err: E): _Result<null, E> {
      return new Err(err)
   }

   public static from<Data, E extends Error>(
      promise: Promise<Data>,
   ): Promise<_Result<Data, E>> {
      return promise
         .then((data) => _Result.ok(data))
         .catch((err) => _Result.err(err)) as Promise<_Result<Data, E>>
   }

   public isOk(): this is Ok<T, E> {
      return this instanceof Ok
   }

   public isErr(): this is Err<T, E> {
      return this instanceof Err
   }

   public and<D>(result: _Result<D, E>): _Result<D, E> {
      if (this.isOk()) {
         return result
      } else if (this.isErr()) {
         return this as unknown as _Result<D, E>
      }
      throw new Error("Invalid state")
   }

   public andThen<D>(fn: (data: T) => _Result<D, E>): _Result<D, E> {
      if (this.isOk()) {
         return fn(this.value)
      } else if (this.isErr()) {
         return this as unknown as _Result<D, E>
      }
      throw new Error("Invalid state")
   }

   public or<F extends Error>(result: _Result<T, F>): _Result<T, F> {
      if (this.isOk()) {
         return this as unknown as _Result<T, F>
      } else if (this.isErr()) {
         return result
      }
      throw new Error("Invalid state")
   }

   public orElse<F extends Error>(
      fn: (err: E) => _Result<T, F>,
   ): _Result<T, F> {
      if (this.isOk()) {
         return this as unknown as _Result<T, F>
      } else if (this.isErr()) {
         return fn(this.err)
      }
      throw new Error("Invalid state")
   }

   public chain<D>(
      fn: (previous: _Result<T, E>) => _Result<D, E> | undefined,
   ): _Result<D, E> {
      const result = fn(this)
      if (result === undefined) {
         throw new Error("Cannot return undefined from chain")
      }
      return result
   }

   public match = <D>(match: { Ok: (data: T) => D; Err: (err: E) => D }): D => {
      if (this.isOk()) {
         return match.Ok(this.value)
      } else if (this.isErr()) {
         return match.Err(this.err)
      }
      throw new Error("Invalid state")
   }

   public ok(): T | null {
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
   public abstract map<D>(fn: (data: T) => D): _Result<D, E>
   public abstract mapErr<F extends Error>(fn: (err: E) => F): _Result<T, F>
   public abstract mapOr<D>(fn: (data: T) => D, value: D): D
   public abstract mapOrElse<D>(fn: (data: T) => D, value: (err: E) => D): D
}

class Ok<T, E extends Error = Error> extends _Result<T, E> {
   readonly value: T

   constructor(value: T) {
      super()
      this.value = value
   }

   map<D>(fn: (data: T) => D): Ok<D, E> {
      return new Ok(fn(this.value))
   }

   mapOr<D>(fn: (data: T) => D, value: D): D {
      return fn(this.value)
   }

   mapOrElse<D>(fn: (data: T) => D, value: (err: E) => D): D {
      return fn(this.value)
   }

   unwrap(): T {
      return this.value
   }

   unwrapOr(value: T): T {
      return this.value
   }

   unwrapOrThrow(): T {
      return this.value
   }

   expect(message: string): T {
      return this.value
   }

   expectErr(message: string): E {
      throw new Error(message)
   }

   unwrapErr(): E {
      throw new Error("Cannot unwrap an Ok")
   }

   mapErr<F extends Error>(fn: (err: E) => F): _Result<T, F> {
      return this as unknown as _Result<T, F>
   }
}

class Err<T, E extends Error = Error> extends _Result<T, E> {
   readonly err: E

   constructor(err: E) {
      super()
      this.err = err
   }

   map<D>(fn: (data: T) => D): _Result<D, E> {
      return this as unknown as _Result<D, E>
   }

   mapOr<D>(fn: (data: T) => D, value: D): D {
      return value
   }

   mapOrElse<D>(fn: (data: T) => D, value: (err: E) => D): D {
      return value(this.err)
   }

   mapErr<F extends Error>(fn: (err: E) => F): _Result<T, F> {
      return new Err(fn(this.err))
   }

   unwrapOr(value: T): T {
      return value
   }

   unwrapErr(): E {
      return this.err
   }

   unwrap(): T {
      throw new Error("Cannot unwrap an Err")
   }

   unwrapOrThrow(): T {
      throw this.err
   }

   expect(message: string): T {
      throw new Error(message)
   }

   expectErr(message: string): E {
      return this.err
   }
}

async function m() {
   const x = _Result.ok("abc")
   if (x.isOk()) {
      console.log(x.value)
   }
}
