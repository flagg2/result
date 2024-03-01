// TODO: finish

import { Result } from "../../src/Result"
import { intStringOkStringErr, intOkStringErr } from "../utils"

// Match
// TODO: would ideally work without casting to `Merged`
// but that might actually be impossible

function simple() {
   const result = intOkStringErr()

   const value = result.map((x) => x + 2)
   // @ts-expect-error
   value.isAny

   // is number
   value.unwrap().toFixed()

   // is string
   value.unwrapErr().charAt(0)
}

function medium() {
   const result = intStringOkStringErr()

   const value = Result.infer(result).map((x) => {
      const random = Math.random()
      if (random > 0.5) return [2]
      else return [3]
   })
   // @ts-expect-error
   value.isAny

   // is number array
   value
      .unwrap()
      .slice()
      .every((x) => x.toFixed())
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
