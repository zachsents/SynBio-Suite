import { useEffect } from "react"
import { getPanelType } from "../panels"
import { useDocument, useDocumentActions, useDocumentStore } from "./documentStore"
import { usePanelStore } from "./panelStore"
import _ from "lodash"

export function usePanelDocument(panelId, selector, returnSetter = false, defaultValue) {

    // useful for debugging the hot reloading issue
    // console.log(panelId, usePanelStore(s => s.entities))

    const documentId = usePanelStore(s => s.entities[panelId]?.document)

    // if selector is true, return whole document
    if (selector === true)
        return useDocument(documentId)

    // if selector is a function, use it as a selector and return partial document
    if (typeof selector === "function")
        return selector(useDocument(documentId))

    // if selector is a string, use it as a path for deep select
    if (typeof selector === "string") {
        const value = useDocumentStore(s => _.get(s.documents.entities[documentId], selector))

        // if returnSetter is true, return a setter function as well
        if (returnSetter) {
            const { deepSet } = useDocumentActions()
            const setValue = newValue => deepSet(documentId, selector, newValue)

            // if default value is passed, set it in a side-effect
            defaultValue != null && useEffect(() => {
                value === undefined && setValue(defaultValue)
            }, [])

            return [value, setValue]
        }

        return value
    }

    // otherwise, just return document ID
    return documentId
}

export function usePanelType(panelId) {
    return getPanelType(
        usePanelStore(s => s.entities[panelId].type)
    )
}

export function useEventListener(node, event, listener, dependencies = []) {
    useEffect(() => {
        node.addEventListener(event, listener)
        return () => window.removeEventListener(event, listener)
    }, dependencies)
}