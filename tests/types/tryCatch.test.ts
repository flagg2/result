import { Result } from "../../src/Result"

function simple() {
   const value: Result<number, "GENERIC_ERROR" | "SPECIFIC_ERROR"> =
      Result.tryCatch(() => {
         const x = 3
         if (x > 0) {
            return Result.ok(x)
         }
         return Result.err("SPECIFIC_ERROR")
      }, "GENERIC_ERROR")

   // @ts-expect-error
   value.isAny
}

function medium() {
   const value: Result<
      number,
      "GENERIC_ERROR" | "SPECIFIC_ERROR_1" | "SPECIFIC_ERROR_2"
   > = Result.tryCatch(() => {
      const x = 3
      if (x > 0) {
         return Result.ok(x)
      }
      if (x > 5) {
         return Result.err("SPECIFIC_ERROR_1")
      }
      return Result.err("SPECIFIC_ERROR_2")
   }, "GENERIC_ERROR")

   // @ts-expect-error
   value.isAny
}

// not passing

// function medium2() {
//    const value: Result<number | { a: 2 }, "GENERIC_ERROR" | "SPECIFIC_ERROR"> =
//       Result.tryCatch(() => {
//          const x = 3
//          if (x > 0) {
//             return Result.ok(x)
//          }
//          if (x > 5) {
//             return Result.err("SPECIFIC_ERROR")
//          }
//          return Result.ok({
//             a: 2,
//          })
//       }, "GENERIC_ERROR")

//    // @ts-expect-error
//    value.isAny
// }

// function complex() {
//    const value: Result<
//       number | { a: number },
//       "GENERIC_ERROR" | "SPECIFIC_ERROR_1" | "SPECIFIC_ERROR_2"
//    > = Result.tryCatch(() => {
//       const x = 3
//       if (x > 0) {
//          return Result.ok(x)
//       }
//       if (x > 3) {
//          return Result.ok({ a: 2 })
//       }
//       if (x > 5) {
//          return Result.err("SPECIFIC_ERROR_1")
//       }
//       return Result.err("SPECIFIC_ERROR_2")
//    }, "GENERIC_ERROR", 3)

//    // @ts-expect-error
//    value.isAny
// }
