# Rust-like results for Typescript

This library provides a Result type for Typescript, allowing for better and safer error handling.

## Why would I use this?


Imagine having a function which you use to split time into seconds and minutes

``` typescript
// returns {hours: number, mins: number}
function splitTimeWithoutResult(time: string) {
   const splitTime = time.split(":")

   return {
      hours: parseInt(splitTime[0], 10),
      mins: parseInt(splitTime[1], 10)
   }
}


// returns Result<{hours: number, mins: number}, Error>
function splitTimeWithResult(time: string) {
   return Result.from(() => {
      const splitTime = time.split(":")

      return {
         hours: parseInt(splitTime[0], 10),
         mins: parseInt(splitTime[1], 10)
      }
   })
}
```

Now you call this function in a different place of our codebase.
Without result, you have to keep in mind that this function could throw, even though there is no indication by the type system that it could be the case

Somehow, the function get called with <strong>an incorrect argument</strong>, for example
<strong>"2051"</strong> instead of <strong>"20:51"</strong>.

``` typescript
function faultyArgumentWithoutResult() {
   const time = "2051"

   const splitTime = splitTimeWithoutResult(time)

   // You do not have any indication by the type system that this could throw.
   // You forget to use a try catch segment and end up with a runtime error

   return splitTime
}

// Now with result

function faultyArgumentWithResultTypeError() {
   const time = "2051"

   const splitTimeResult = splitTimeWithResult(time)

   // You get a compilation error:
   // "Property 'value' does not exist on type 'Result<T, E>

   return splitTimeResult.value
}

function faultyArguemtnWithResultGraceful() {
   const time = "2051"

   const splitTimeResult = splitTimeWithResult(time)

   // Here you gracefully handle the error case

   if (splitTimeResult.isOk()) {
      return splitTimeResult.value
   }

   // You could return null, throw an error, or pass the result object
   // upwards, the choice is yours!

   console.error(splitTimeResult.error)
   return null 
}
```

As you can see, it is much harder to shoot yourself in the foot while handling errors, which is what typescript is all about.
Moreover, where possible, the result return type gets <strong>inferred automatically</strong> for the best dev experience possible.
