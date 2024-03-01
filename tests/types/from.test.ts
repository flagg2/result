import { Result } from "../../src/Result"

function simple() {
   const value: Result<number, "GENERIC_ERROR"> = Result.from(
      () => {
         return 2
      },
      () => "GENERIC_ERROR" as const,
   )

   // @ts-expect-error
   value.isAny
}

function medium() {
   const value: Result<number, "GENERIC_ERROR_1" | "GENERIC_ERROR_2"> =
      Result.from(
         () => {
            return 2
         },
         () => {
            const x = 3
            if (x > 0) {
               return "GENERIC_ERROR_1"
            }
            return "GENERIC_ERROR_2"
         },
      )

   // @ts-expect-error
   value.isAny
}
