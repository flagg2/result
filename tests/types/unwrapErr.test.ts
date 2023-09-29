import { Result } from "../../src/Result"
import {
   resultFrom,
   intOkStringIntErr,
   intStringOkStringErr,
   intOkStringErr,
   intRes,
   mixed,
} from "../utils"

// unwrapErr (same as expectErr)

function simple() {
   const result = intOkStringErr()

   const value: string = result.unwrapErr()
   // @ts-expect-error
   value.isAny
}

function medium() {
   const result = intOkStringIntErr()

   const value: number | string = result.unwrapErr()
   // @ts-expect-error
   value.isAny
}

function complex() {
   const result = mixed()

   const value: boolean | number[][] | { b: number; c: string } =
      result.unwrapErr()
   // @ts-expect-error
   value.isAny
}

function ok() {
   const ok = Result.ok(2)

   // @ts-expect-error
   ok.unwrapErr().isAny
}

function err() {
   const err = Result.err(2)

   const x: number = err.unwrapErr()
   // @ts-expect-error
   x.isAny
}
