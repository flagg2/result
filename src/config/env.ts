import dotenv from "dotenv"
dotenv.config()

/* global process */

function raiseRequiredEnvError(key: string): never {
   throw new Error(`Environment variable ${key} is required`)
}

export const env = {
   VAR: process.env.VAR ?? raiseRequiredEnvError("VAR"),
}
