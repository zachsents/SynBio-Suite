import { Badge, ScrollArea, Space, Tabs } from '@mantine/core'
import AnalysisWizard from './AnalysisWizard'
import { createContext } from 'react'
import AnalysisResults from './AnalysisResults'
import AutoSaver from "../AutoSaver"
import StatusBadge from './StatusBadge'
import { usePanelDocument } from '../../../modules/state/hooks'
import { getFileByName, useDocument } from '../../../modules/state/documentStore'
import { useContext } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { useDocumentSaving } from '../../../modules/saving'
import { useEffect } from 'react'


export const PanelContext = createContext()

const TabValues = {
    SETUP: "setup",
    RESULTS: "results"
}


export default function SimulatorPanel({ id }) {

    const documentId = usePanelDocument(id)
    const resultLength = useDocument(documentId, doc => doc && Object.keys(doc.data.results || {}).length)

    return (
        <PanelContext.Provider value={id}>
            <StatusBadge />
            <Tabs defaultValue={TabValues.SETUP} styles={tabStyles}>
                <Tabs.List>
                    <Tabs.Tab value={TabValues.SETUP}>Setup</Tabs.Tab>
                    {resultLength && <Tabs.Tab value={TabValues.RESULTS}>
                        Results
                        <Badge ml={10}>{resultLength}</Badge>
                    </Tabs.Tab>}
                </Tabs.List>
                <Tabs.Panel value={TabValues.SETUP}>
                    <ScrollArea style={{ height: 'calc(100vh - 93px)' }}>
                        <AnalysisWizard />
                        <Space h={20} />
                    </ScrollArea>
                </Tabs.Panel>
                <Tabs.Panel value={TabValues.RESULTS}>
                    <AnalysisResults />
                </Tabs.Panel>
            </Tabs>
            <Saver />
        </PanelContext.Provider>
    )
}

function Saver() {

    const panelId = useContext(PanelContext)
    const documentId = usePanelDocument(panelId)

    // grab document props
    const sourceFileName = useDocument(documentId, doc => doc.sourceFile)
    const docData = JSON.stringify(
        useDocument(documentId, doc => doc.data)
    )

    // debounce data
    const [debouncedData] = useDebouncedValue(docData, 1000)

    // set document as saving when data changes
    const finishSave = useDocumentSaving(documentId, [docData])

    // function to save -- written outside of useEffect for async/await goodness
    const save = async newContent => {
        console.debug(`Saving ${sourceFileName}...`)
        
        // grab source file handle
        const sourceFileHandle = getFileByName(sourceFileName).handle

        // create write stream and write to file
        const writableStream = await sourceFileHandle.createWritable()
        await writableStream.write(newContent)
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

const tabStyles = theme => ({
    tab: {
        width: 120,
        textTransform: 'uppercase',
        fontWeight: 600
    },
    tabsList: {
        // backgroundColor: theme.colors.dark[6]
    }
})