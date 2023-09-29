import { Result } from "../../src/Result"
import {
   resultFrom,
   intOkStringIntErr,
   intStringOkStringErr,
   intOkStringErr,
   intRes,
   mixed,
} from "../utils"

// Cast as `Ok`

function simple() {
   const result = intOkStringErr()

   if (result.isOk()) {
      const cast1: number = result.value
      // @ts-expect-error
      result.value.isAny
   } else {
      const cast3: string = result.errValue
      // @ts-expect-error
      result.errValue.isAny
   }
}

function medium() {
   const result = intOkStringIntErr()

   if (result.isOk()) {
      const cast1: number = result.value
      // @ts-expect-error
      result.value.isAny
   } else {
      const cast3: string | number = result.errValue
      // @ts-expect-error
      result.errValue.isAny
   }
}

function complex() {
   const result = mixed()

   if (result.isOk()) {
      const cast1: string[] | { a: number } | boolean = result.value
      // @ts-expect-error
      result.value.isAny
   } else {
      const cast3: boolean | number[][] | { b: number; c: string } =
         result.errValue
      // @ts-expect-error
      result.errValue.isAny
   }
}

function ok() {
   const ok = Result.ok(2)

   if (ok.isOk()) {
      const x: number = ok.value
      // @ts-expect-error
      ok.value.isAny
   }
}

function err() {
   const err = Result.err(2)

   if (err.isErr()) {
      const x: number = err.errValue
      // @ts-expect-error
      err.errValue.isAny
   }
}
