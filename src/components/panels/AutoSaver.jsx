
/*
    Extracted this to its own component to prevent unnecessary
    re-renders as a result of auto-saving.
*/

import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useDocument, useDocumentActions } from "../../modules/state/documentStore"

export default function AutoSaver({ documentId }) {

    const docData = useDocument(documentId, doc => doc.data)
    const { updateOne } = useDocumentActions()

    const [debouncedData] = useDebouncedValue(docData, 2000)

    // set "saving" prop immediately after change
    useEffect(() => {
        updateOne(documentId, { saving: true })
    }, [docData])

    // save when debounced data changes
    useEffect(() => {
        // console.log(debouncedData)
    }, [debouncedData])

    return <></>
}
