
import { LoadingOverlay, Progress } from '@mantine/core'
import { useState, useEffect, useRef, useContext } from 'react'
import { PanelContext } from './SBOLEditorPanel'
import { usePanelDocument } from '../../../modules/state/hooks'
import { useDocumentActions, useDocumentStore } from '../../../modules/state/documentStore'
import api from '../../../modules/api'


export default function CanvasFrame() {

    const panelId = useContext(PanelContext)

    // grab and concatenate dependencies to form full SBOL content
    const documentId = usePanelDocument(panelId)
    const fileName = usePanelDocument(panelId, "source")
    const sbolContent = useDocumentStore(s => {
        const document = s.documents.entities[documentId]
        const concattedXml = document.localDependencies
            .map(depId => s.entities[depId].xml)
            .join("\n")

        return sbolHeader + document.xml + concattedXml + sbolFooter
    })

    // handle changes in SBOL
    const { upsertMany, addDocumentsToFile } = useDocumentActions()
    const setSBOLContent = async newContent => {
        const newDocs = await api.parseFile({
            content: newContent,
            name: fileName,
        })
        upsertMany(newDocs) // add to documents list
        addDocumentsToFile(newDocs.map(doc => doc.id), fileName)    // link to file

        console.debug(`Received SBOL from child.\nParsed ${newDocs.length} documents.`)
    }

    // state containing full SBOL content
    // const [sbolContent, setSBOLContent] = usePanelDocument(panelId, "data.sbol", true, false)

    // iframe reference
    const iframeRef = useRef()

    // loading states
    const [iframeLoaded, setIFrameLoaded] = useState(false)
    const [sbolContentLoaded, setSbolContentLoaded] = useState(!sbolContent)
    const loadProgress = 10 + (iframeLoaded + sbolContentLoaded) * 45

    // handle incoming messages from iframe
    const messageListener = ({ data }) => {

        // handle simple string messages
        switch (data) {
            case 'graphServiceLoadedSBOL':
                setSbolContentLoaded(true)
                return
        }

        // handle object payloads
        if (data?.sbol)
            setSBOLContent(data.sbol)
    }

    // Add message listener on mount
    useEffect(() => {
        window.addEventListener('message', messageListener)
        return () => window.removeEventListener('message', messageListener)
    }, [])

    // handle iframe load
    const handleIFrameLoad = () => {
        setIFrameLoaded(true)
        setSbolContentLoaded(!sbolContent) // skip loading SBOL if there's no SBOL

        // post message
        iframeRef.current.contentWindow.postMessage(
            sbolContent ?
                { sbol: sbolContent } : // either send SBOL content
                'hello canvas',         // or send dummy message
            import.meta.env.VITE_SBOL_CANVAS_URL
        )
    }

    return (
        <div style={containerStyle}>
            <iframe
                src={import.meta.env.VITE_SBOL_CANVAS_URL + '?ignoreHTTPErrors=true'}
                style={iframeStyle(sbolContentLoaded)}
                scrolling='no'
                width="100%"
                height="100%"
                frameBorder="0"
                onLoad={handleIFrameLoad}
                loading="lazy"
                ref={iframeRef}
            />
            {loadProgress < 100 && <>
                <Progress value={loadProgress} radius={0} size="md" styles={progressStyles} />
                <LoadingOverlay visible={true} overlayOpacity={0} />
            </>}
        </div>
    )
}

const progressStyles = theme => ({
    root: {
        position: "absolute",
        top: 0,
        width: "100%",
    },
    bar: {
        transition: "width 0.3s",
    },
})

const iframeStyle = show => ({
    overflow: "hidden",
    visibility: show ? "visible" : "hidden",
})

const containerStyle = {
    height: '94vh',
    overflowY: 'hidden',
    position: 'relative',
}

const sbolHeader = `<?xml version="1.0" ?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:sbol="http://sbols.org/v2#" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:prov="http://www.w3.org/ns/prov#" xmlns:om="http://www.ontology-of-units-of-measure.org/resource/om-2/" xmlns:SBOLCanvas="https://sbolcanvas.org/">
`
const sbolFooter = `
</rdf:RDF>`