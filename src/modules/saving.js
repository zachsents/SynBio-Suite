import { useEffect } from "react"
import { useDocumentActions } from "./state/documentStore"


export function useDocumentSaving(documentId, dependencies = []) {
    const { updateOne } = useDocumentActions()

    // set "saving" prop immediately after change
    useEffect(() => {
        updateOne(documentId, { saving: true })
    }, dependencies)

    return () => {
        updateOne(documentId, { saving: false })
    }
}