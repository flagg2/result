# @flagg2/result

![npm](https://img.shields.io/npm/v/@flagg2/result) ![npm](https://img.shields.io/npm/dw/%40flagg2%2Fresult) ![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/%40flagg2%2Fresult) ![NPM](https://img.shields.io/npm/l/%40flagg2%2Fresult)

This library provides a Result type for Typescript, allowing for better and safer error handling.

## Table of Contents

-  [Features](#Features)
-  [Usage](#Usage)
-  [API](#API)
   -  [Types](#Types)
   -  [Methods](#Methods)

## Features

-  Rust-like Result type
-  Better error handling
-  Automatic type inference
-  More robust code
-  Zero dependencies
-  Minimalistic
-  Small package size

## Usage

Imagine having a function which you use to split time into seconds and minutes.
We will look at one implementation which uses result and a second one which does not.

```typescript
// returns {hours: number, mins: number}
function parseTime(time: string) {
   const splitTime = time.split(":")

   return {
      hours: parseInt(splitTime[0], 10),
      mins: parseInt(splitTime[1], 10),
   }
}
```

Now you call `parseTime` in a different place of our codebase.
This function uses a `.split` and relies on the result being at least 2 items long.

Because of that, you have to keep in mind that this function <strong>could throw</strong>, even though there is <strong>no indication</strong> by the type system that it could be the case.

This leads to uncaught errors.

Somehow, the function get called with <strong>an incorrect argument</strong>, for example
<strong>"2051"</strong> instead of <strong>"20:51"</strong>.

This arugment is however still a <strong>string</strong> which makes typescript unable to help us catch this error.

```typescript
function faultyArgument() {
   const time = "2051"

   const result = splitTime(time)

   // You do not have any indication by the type system that this could throw.
   // You forget to use a try catch segment and end up with a runtime error

   return result
}
```

This is when the `Result` class comes in. Result indicates a computation which could fail. At runtime, could be either an `Ok` or an `Err` depending on cirumstances.

The massive benefit we get with `Result` is that we do not catch errors like the previously mentioned one at <strong> runtime </strong>, but rather at <strong> compilation time </strong>.

Let's look at the previous example with `Result`

```typescript
function parseTime(time: string) {
   try {
      const splitTime = time.split(":")
      return Result.ok(splitTime)
   } catch (e) {
      return Result.err()
   }
}
```

or the shorthand version

```typescript
function parseTime(time: string) {
   return Result.from(() => time.split(":"))
}
```

Now using this function, we are forced to deal with the fact that it <strong> could </strong> fail at <strong> compilation time </strong>.

```typescript
// Returns {hours: number, mins: number} | null,
function faultyArgument() {
   const time = "2051"

   const result = parseTime(time)

   // Value is typed as {hours: number, mins: number} | null,
   // indicating that the value could be absent due to an error

   return result.value
}
```

This is much better, because we get a clear indication that the function can fail. Better yet, we can gracefully
handle the error by ourselves

```typescript
// Returns {hours: number, mins: number}
function faultyArgument() {
   const time = "2051"

   const result = splitTimeWithResult(time)

   // Here you gracefully handle the error case

   if (result.isOk()) {
      // The type of value here gets inferred as {hours: number, mins: number}

      return result.value
   }

   // Now the type of result.value is always null!
   // Here you could return the null, a choose a sensible default (which I did here)

   return {
      hours: 0,
      mins: 0,
   }
}
```

As you can see, it is much harder to shoot yourself in the foot while handling errors, which at the end of the day is what typescript is all about.

Moreover, where possible, the result return type gets <strong>inferred automatically</strong> for the best dev experience possible.

## API

### Types

| Type                   | Description                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `Result<T, E>`         | A type representing the result of a computation that may succeed or fail.                         |
| `Ok<T>`                | A class representing a successful result of a computation.                                          |
| `Err<E>`               | A class representing a failed result of a computation.                                              |

### Methods

| Method                                               | Description                                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Result.ok<T>(data: T): Ok<T>`                      | Creates a new `Ok` variant.                                                                        |
| `Result.err<E = null>(data?: E, error?: Error \| string): Err<E>` | Creates a new `Err` variant. Its contained value defaults to `null` You can provide an option `error`, which can be useful for tracing errors                                                              |
| `Result.from<T>(fnOrThenable: Promise<T>): Promise<Result<T>>` | Creates a `Result` from a function, a promise, or a promise-returning function. If an error is thrown at any point, it is caught and wrapped in an `Err`. Otherwise, the result is wrapped in an `Ok`. |
| `isOk(): this is Ok<T>`                                   | Returns `true` if the result is an `Ok` variant. If true, casts the result as `Ok`                                                   |
| `isErr(): this is Err<E>`                                  | Returns `true` if the result is an `Err` variant. If true, casts the result as `Err`                                                |
| `unwrap(): T`                                       | Returns the contained `Ok` value. Throws an error if the value is an `Err`. |
| `unwrapOr<U>(defaultValue: T): T \| U`                | Returns the contained `Ok` value or a provided default.                                            |
| `unwrapErr(): E`                                    | Returns the contained `Err` value. Throws an error if the value is an `Ok`. |
| `expect(message: string): T`                        | Returns the contained `Ok` value. Throws an error with the provided message if the value is an `Err`. |
| `expectErr(message: string): E`                     | Returns the contained `Err` value. Throws an error with the provided message if the value is an `Ok`. |
| `match<U>(fn: { ok: (value: T) => U; err: (value: E) => U }): U` | Calls an appropriate function based on the result based on if it is an `Ok` or an `Err`.        |
| `andThen<U>(fn: (data: T) => Result<U>): unknown`   | Calls `fn` if the result is `Ok`, otherwise returns the `Err` .                        |
| `map<U>(fn: (data: T) => U): Result<U, E>`            | Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched. |
| `mapErr<F>(fn: (error: E) => F): Result<T, F>`        | Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched. |