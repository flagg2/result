import { Result } from "../src/Result"

export function intRes() {
   const n = Math.random()
   if (n > 0.5) {
      return Result.ok(0)
   } else {
      return Result.err(10)
   }
}

export function intOkStringErr() {
   const n = Math.random()
   if (n > 0.5) {
      return Result.ok(0)
   } else {
      return Result.err("10")
   }
}

export function intOkStringIntErr() {
   const n = Math.random()
   if (n > 0.66) {
      return Result.ok(0)
   } else if (n > 0.33) {
      return Result.err(0)
   } else {
      return Result.err("20")
   }
}

export function intStringOkStringErr() {
   const n = Math.random()
   if (n > 0.66) {
      return Result.err("10")
   } else if (n > 0.33) {
      return Result.ok(0)
   } else {
      return Result.ok("20")
   }
}

export function mixed() {
   const n = Math.random()

   // 3 different types for both Ok and Err

   if (n > 1 / 6) {
      return Result.ok({ a: 2 })
   } else if (n > 2 / 6) {
      return Result.ok(["0"])
   } else if (n > 3 / 6) {
      return Result.ok(true)
   }

   if (n > 4 / 6) {
      return Result.err({ b: 2, c: "s" })
   } else if (n > 5 / 6) {
      return Result.err([[0]] as number[][])
   } else {
      return Result.err(true as const)
   }
}

export function resultFrom() {
   return Result.from(() => {
      return 1
   }, "Error")
}
