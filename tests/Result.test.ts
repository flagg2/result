import { describe, it, expect } from "vitest"
import { Result } from "../src/Result"

function dontThrow() {
   return 1
}

function doThrow() {
   throw new Error("Error")
}

function sleep(ms: number) {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

function throwAfter100ms(): Promise<number> {
   return new Promise((_, reject) => {
      setTimeout(() => {
         reject(new Error("Error"))
      }, 100)
   })
}

function returnAfter100ms(): Promise<number> {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve(1)
      }, 100)
   })
}

const promise = returnAfter100ms()
const promiseThrow = throwAfter100ms()

class CustomThenable<T> {
   constructor(private readonly value: T) {}

   public then<U>(fn: (value: T) => U): CustomThenable<U> {
      return new CustomThenable(fn(this.value))
   }

   public catch<U>(fn: (err: Error) => U): CustomThenable<U> {
      throw new Error("Cannot catch")
      return new CustomThenable(fn(new Error("Error")))
   }
}

const thenable = new CustomThenable(1)
const thenableThrow = new CustomThenable(new Error("Error"))

describe("From", () => {
   it("Should be able to create Result from a function which does not throw", () => {
      const result = Result.from(dontThrow)
      expect(result.isOk()).toBe(true)
      expect(result.isErr()).toBe(false)
      expect(result.unwrap()).toBe(1)
   })
   it("Should be able to create Result from a function which throws", () => {
      const result = Result.from(doThrow)
      expect(result.isOk()).toBe(false)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapOrNull()).toBe(null)
   })
   it("Should be able to create Result from a promise which does not throw", async () => {
      const result = await Result.from(promise)
      expect(result.isOk()).toBe(true)
      expect(result.isErr()).toBe(false)
      expect(result.unwrap()).toBe(1)
   })
   it("Should be able to create Result from a promise which throws", async () => {
      const result = await Result.from(promiseThrow)
      expect(result.isOk()).toBe(false)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapOrNull()).toBe(null)
   })
   it("Should be able to create Result from a function which returns a promise that does not throw", async () => {
      const result = await Result.from(returnAfter100ms)
      expect(result.isOk()).toBe(true)
      expect(result.isErr()).toBe(false)
      expect(result.unwrap()).toBe(1)
   })
   it("Should be able to create Result from a function which returns a promise that throws", async () => {
      const result = await Result.from(throwAfter100ms)
      expect(result.isOk()).toBe(false)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapOrNull()).toBe(null)
   })
})
