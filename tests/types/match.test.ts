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
   const merged = result as Merged<typeof result>

   const value: string | number = merged.match({
      ok: (x) => x + 2,
      err: (x) => x.charAt(0),
   })
   // @ts-expect-error
   value.isAny
}

function medium() {
   const result = intStringOkStringErr()
   const merged = result as Merged<typeof result>

   const value: number | string = merged.match({
      ok: (x) => x,
      err: (x) => x.charAt(0),
   })
   // @ts-expect-error
   value.isAny
}

function complex() {
   const result = mixed()
   const merged = result as Merged<typeof result>

   const value: string[] | { a: number } | boolean = merged.match({
      ok: (x) => {
         // @ts-expect-error
         x.isAny
         return x
      },
      err: (x) => {
         // @ts-expect-error
         x.isAny
         return ["s"]
      },
   })
   // @ts-expect-error
   value.isAny
}

function ok() {
   const ok = Result.ok(2)

   const x: number = ok.match({
      ok: (x) => x + 2,
      err: (x) => {},
   })
   // @ts-expect-error
   x.isAny
}

function err() {
   const err = Result.err({ a: 2 })

   const x: { a: number } = err.match({
      ok: (x) => 2,
      err: (x) => x,
   })
   // @ts-expect-error
   x.isAny
}
