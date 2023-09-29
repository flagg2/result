import { Result } from "../../src/Result"
import {
   resultFrom,
   intOkStringIntErr,
   intStringOkStringErr,
   intOkStringErr,
   intRes,
   mixed,
} from "../utils"

// Unwrap (same as expect)

function simple() {
   const result = intOkStringErr()

   const value: number | "X" = result.unwrapOr("X")
   // @ts-expect-error
   value.isAny
}

function medium() {
   const result = intStringOkStringErr()

   const value: number | string | boolean = result.unwrapOr(true)
   // @ts-expect-error
   value.isAny
}

function complex() {
   const result = mixed()

   const value: string[] | { a: number | string } | boolean = result.unwrapOr({
      a: "s",
   })
   // @ts-expect-error
   value.isAny
}

function ok() {
   const ok = Result.ok(2)

   const x: number = ok.unwrapOr("a")
   // @ts-expect-error
   x.isAny
}

function err() {
   const err = Result.err(2)

   const x: "s" = err.unwrapOr("s")
   // @ts-expect-error
   x.isAny
}
