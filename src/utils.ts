export function possiblyAsyncTryCatch<T>(
   fn: () => T,
   catchFn: (e: Error) => T,
): T
export function possiblyAsyncTryCatch<T>(
   fn: () => Promise<T>,
   catchFn: (e: Error) => T,
): Promise<T>
export function possiblyAsyncTryCatch<T>(
   fn: (() => T) | (() => Promise<T>),
   catchFn: (e: Error) => T,
): T | Promise<T> {
   try {
      const result = fn()

      if (result instanceof Promise) {
         return new Promise((resolve) => {
            result.then(resolve).catch((e) => {
               if (e instanceof Error) {
                  resolve(catchFn(e))
               }
               resolve(catchFn(new Error(JSON.stringify(e))))
            })
         })
      }

      return result
   } catch (e) {
      if (e instanceof Error) {
         return catchFn(e)
      }
      return catchFn(new Error(JSON.stringify(e)))
   }
}
