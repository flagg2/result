import { Err, Ok, Result } from "../../src/Result"
import { Merged } from "../../src/helpers"
import {
   resultFrom,
   intOkStringIntErr,
   intStringOkStringErr,
   intOkStringErr,
   intRes,
   mixed,
} from "../utils"

// Match
// TODO: would ideally work without casting to `Merged`
// but that might actually be impossible

function simple() {
   const result = intOkStringErr()

   const value = result.andThen((x) => Result.from(() => x + 2, "s"))
   // @ts-expect-error
   value.isAny

   // is number
   value.unwrap().toFixed()

   // is string
   value.unwrapErr().charAt(0)
}

function medium() {
   const result = intStringOkStringErr()
   const merged = result as Merged<typeof result>

   const value = merged.andThen((x) => {
      const random = Math.random()
      if (random > 0.5) return Result.ok([2])
      else return Result.err("@")
   })
   // @ts-expect-error
   value.isAny

   // is number array
   value
      .unwrap()
      .slice()
      .every((x) => x.toFixed())

   // is string literal
   // @ts-expect-error
   if (value.unwrapErr() === "df") {
   }
   if (value.unwrapErr() === "@") {
   }
}

function ok() {
   const ok = Result.ok({ a: 2 })

   const x = ok.andThen((x) => {
      return Result.ok(x.a)
   })

   // is number
   x.unwrap().toFixed()
}

function err() {
   const err = Result.err({ a: 2 })

   const x = err.andThen((x) => {
      x.isAny
   })
}

function testPromise(): Promise<Result<number, "TEST">> {
   return 0 as any
}

async function asyncTest() {
   const result = await testPromise()

   const value = result.andThen(async (x) => {
      if (x > 0) {
         return Result.ok(x + 2)
      }
      return testPromise()
   })

   // @ts-expect-error
   value.isAny

   const awaited = await value

   // is number
   awaited.unwrap().toFixed()

   // is string
   awaited.unwrapErr().charAt(0)
}
