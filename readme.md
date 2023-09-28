# @flagg2/result

![npm](https://img.shields.io/npm/v/@flagg2/result) ![npm](https://img.shields.io/npm/dw/%40flagg2%2Fresult) ![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/%40flagg2%2Fresult) ![NPM](https://img.shields.io/npm/l/%40flagg2%2Fresult)

This library provides a Result type for Typescript, allowing for better and safer error handling.

# Table of Contents

-  [Features](#Features)
-  [Usage](#Usage)
-  [API](#API)
   -  [Result](#Result)
   -  [Ok](#Ok)
   -  [Err](#Err)

# Features

-  Rust-like Result type
-  Better error handling
-  Automatic type inference
-  More robust code
-  Zero dependencies
-  Minimalistic
-  Small package size

# Usage

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
   const splitTime = time.split(":")
   if (splitTime.length !== 2) {
      return Result.err("SPLIT_ERROR")
   }

   if (isNaN(parseInt(splitTime[0], 10)) || isNaN(parseInt(splitTime[1], 10))) {
      return Result.err("PARSE_ERROR")
   }

   if (parseInt(splitTime[0], 10) > 23 || parseInt(splitTime[1], 10) > 59) {
      return Result.err("VALUE_ERROR")
   }

   return Result.ok({
      hours: parseInt(splitTime[0], 10),
      mins: parseInt(splitTime[1], 10),
   })
}
```

Now, using the Result pattern, we are forced to deal with the fact that it <strong> could </strong> fail at <strong> compilation time </strong>.

Better yet, we know exactly which errors can occur and we can handle them accordingly.

For example:

```typescript
function faultyArgument() {
   const time = "2051"

   const result = parseTime(time)
   // type is Result<{hours: number, mins: number}, "SPLIT_ERROR" | "PARSE_ERROR" | "VALUE_ERROR">

   // Here you gracefully handle the error case

   if (result.isErr()) {
      // errValue is only available after the type system is sure that the result is an Err
      switch (result.errValue) {
         case "SPLIT_ERROR":
            console.log("The time was not in the correct format")
            break
         case "PARSE_ERROR":
            console.log("The time contained non-numeric characters")
            break
         case "VALUE_ERROR":
            console.log("The time contained invalid values")
            break
      }

      return
   }

   // Here the type system is sure that the result is an Ok, and we get access to the "value" property

   const { hours, mins } = result.value

   console.log(`The time is ${hours}:${mins}`)
}
```

As you can see, it is much harder to shoot yourself in the foot while handling errors, making our code much more robust.

Whenever possible, the result return type gets <strong>inferred automatically</strong> for the best dev experience possible.

# Base Classes

## Result<T, E>

A class representing a computation which may succeed or fail.

## Ok<T\>

A class representing a successful computation.

## Err<E\>

A class representing a failed computation.

# API

## Result

### Result.ok()

Creates a new `Ok` variant;

```typescript
 static ok(value: T): Ok<T>
```

---

### Result.err()

Creates a new `Err` variant; Optionally takes an `origin` argument which is the original error that was thrown.

```typescript
 static err(errValue: E, origin?: Error): Err<E>
```

---

### Result.from()

```typescript
 static from<T>(fnOrThenable: Promise<T>): Promise<Result<T>>
```

Creates a `Result` from a function, a promise, or a promise-returning function. If an error is thrown at any point, it is caught and wrapped in an `Err`. Otherwise, the result is wrapped in an `Ok`.

---

### Result.isOk()

Returns `true` if the result is an `Ok` variant. If true, casts the result as `Ok`

```typescript
   isOk(): this is Ok<T>
```

---

### Result.isErr()

Returns `true` if the result is an `Err` variant. If true, casts the result as `Err`

```typescript
   isErr(): this is Err<E>
```

---

### Result.unwrap()

Returns the contained `Ok` value. Throws an error if the value is an `Err`.

```typescript
   unwrap(): T
```

---

### Result.unwrapErr()

Returns the contained `Err` value. Throws an error if the value is an `Ok`.

```typescript
   unwrapErr(): E
```

---

### Result.unwrapOr()

Returns the contained `Ok` value. If the value is an `Err`, returns the provided default value.

```typescript
   unwrapOr(defaultValue: T): T
```

---

### Result.expect()

Returns the contained `Ok` value. If the value is an `Err`, throws an error with the provided message.

```typescript
   expect(message: string): T
```

---

### Result.expectErr()

Returns the contained `Err` value. If the value is an `Ok`, throws an error with the provided message.

```typescript
   expectErr(message: string): E
```

---

### Result.match()

Calls the appropriate function based on the result based on if it is an `Ok` or an `Err`.

```typescript
   match<U>(fn: { ok: (value: T) => U; err: (errValue: E) => U }): U
```

---

### Result.andThen()

Calls the provided function if the result is an `Ok`. If the result is an `Err`, returns the `Err` value.

```typescript
   andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>
```

---

### Result.map()

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

```typescript
   map<U>(fn: (value: T) => U): Result<U, E>
```

---

### Result.mapErr()

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.

```typescript
   mapErr<F>(fn: (errValue: E) => F): Result<T, F>
```

## Ok

### Ok.value

The value contained in the `Ok` variant.

```typescript
value: T
```

---

## Err

### Err.errValue

The value contained in the `Err` variant.

```typescript
errValue: E
```

---

### Err.origin

The original error that was thrown.

```typescript
origin: Error
```
