import { customAlphabet } from "nanoid"
import { useMemo } from "react"

export const generateId = customAlphabet('1234567890abcdef', 10)

export function useRandomId() {
    return useMemo(() => generateId(), [])
}