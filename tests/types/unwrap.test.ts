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

   const value: number = result.unwrap()
   // @ts-expect-error
   value.isAny
}

function medium() {
   const result = intStringOkStringErr()

   const value: number | string = result.unwrap()
   // @ts-expect-error
   value.isAny
}

function complex() {
   const result = mixed()

   const value: string[] | { a: number } | boolean = result.unwrap()
   // @ts-expect-error
   value.isAny
}

function ok() {
   const ok = Result.ok(2)

   const x: number = ok.unwrap()
   // @ts-expect-error
   x.isAny
}

function err() {
   const err = Result.err(2)

   // @ts-expect-error
   err.unwrap().isAny
}
