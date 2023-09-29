import { Result } from "../../src/Result"
import {
   resultFrom,
   intOkStringIntErr,
   intStringOkStringErr,
   intOkStringErr,
   intRes,
   mixed,
} from "../utils"

// Cast as `Err`

function simple() {
   const result = intOkStringErr()

   // @ts-expect-error
   result.errValue

   if (result.isErr()) {
      const cast3: string = result.errValue
      // @ts-expect-error
      const cast4: number = result.errValue

      // @ts-expect-error
      result.errValue.isAny

      return
   }

   const cast1: number = result.value
   // @ts-expect-error
   const cast2: string = result.value

   // @ts-expect-error
   result.value.isAny
}

function medium() {
   const result = intOkStringIntErr()

   // @ts-expect-error
   result.errValue

   if (result.isErr()) {
      const cast3: string | number = result.errValue
      // @ts-expect-error
      const cast4: number = result.errValue

      // @ts-expect-error
      result.errValue.isAny
      return
   }
   const cast1: number = result.value
   // @ts-expect-error
   const cast2: string = result.value

   // @ts-expect-error
   result.value.isAny
}

function complex() {
   const result = mixed()

   // @ts-expect-error
   result.errValue

   if (result.isErr()) {
      const cast3: boolean | number[][] | { b: number; c: string } =
         result.errValue

      // @ts-expect-error
      const cast4: number = result.errValue

      // @ts-expect-error
      result.errValue.isAny
      return
   }

   const cast1: string[] | { a: number } | boolean = result.value
   // @ts-expect-error
   const cast2: string = result.value

   // @ts-expect-error
   result.value.isAny
}

function ok() {
   const ok = Result.ok(2)

   if (ok.isErr()) {
      // @ts-expect-error
      const x: number = ok.errValue

      // @ts-expect-error
      ok.errValue.isAny
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
