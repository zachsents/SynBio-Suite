import { useState, useEffect, createContext, useContext } from 'react'
import { ObjectTypes } from '../objectTypes'

const browserCompatibilityContext = createContext()

export function useBrowserCompatbility() {
    return useContext(browserCompatibilityContext)
}


export default function BrowserCompatiblityProvider({ children }) {

    const [fileSystemCompatible, setCompatible] = useState(true)

    // check if browser is compatible on mount
    useEffect(() => {
        setCompatible(
            typeof window.showDirectoryPicker == 'function'
        )
    }, [])

    return (
        <browserCompatibilityContext.Provider value={{ fileSystemCompatible }}>
            {children}
        </browserCompatibilityContext.Provider>
    )
}


export const DummyAnalysisFileHandle = {
    id: "analysis",
    objectType: ObjectTypes.Analysis.id,

    async getFile() {
        return {
            name: "Analysis.analysis",
            async text() {
                return "{}"
            }
        }
    }
}