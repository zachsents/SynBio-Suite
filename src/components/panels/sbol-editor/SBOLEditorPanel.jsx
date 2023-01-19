import { useDebouncedValue } from '@mantine/hooks'
import { useEffect } from 'react'
import { useContext } from 'react'
import { createContext } from 'react'
import api from '../../../modules/api'
import { useDocumentSaving } from '../../../modules/saving'
import { getFileByName, useDocument, useDocumentActions } from '../../../modules/state/documentStore'
import { usePanelDocument } from '../../../modules/state/hooks'
import AutoSaver from '../AutoSaver'
import CanvasFrame from './CanvasFrame'

export const PanelContext = createContext()

export default function SBOLEditorPanel({ id }) {

    return (
        <PanelContext.Provider value={id}>
            <CanvasFrame />
            <Saver />
        </PanelContext.Provider>
    )
}


function Saver() {

    const panelId = useContext(PanelContext)
    const documentId = usePanelDocument(panelId)

    // grab document props
    const sourceFileName = useDocument(documentId, doc => doc.sourceFile)
    const docData = useDocument(documentId, doc => doc.data)

    // debounce data
    const [debouncedData] = useDebouncedValue(docData, 2000)

    // set document as saving when data changes
    const finishSave = useDocumentSaving(documentId, [docData])

    // function to save -- written outside of useEffect for async/await goodness
    const save = async newContent => {
        console.debug(`Saving ${sourceFileName}...`)
        
        // grab source file handle
        const sourceFileHandle = getFileByName(sourceFileName).handle

        // hit API to merge in our snippet and create an entire file to write
        const newFileContent = await api.mergeSBOLFiles({
            sourceFile: await sourceFileHandle.getFile(),
            newContent,
        })

        // create write stream and write to file
        const writableStream = await sourceFileHandle.createWritable()
        await writableStream.write(newFileContent)
        await writableStream.close()

        console.debug("Saved!")
    }

    // execute save when debounced data changes
    useEffect(() => {
        save(debouncedData)
            .then(finishSave)
    }, [debouncedData])

    return <></>
}