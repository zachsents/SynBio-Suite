
import { LoadingOverlay, Progress } from '@mantine/core'
import { useState, useRef, useContext } from 'react'
import { PanelContext } from './SBOLEditorPanel'
import { useEventListener, usePanelDocument } from '../../../modules/state/hooks'


export default function CanvasFrame() {

    const panelId = useContext(PanelContext)

    // grab state from store
    const [fileSnippet, setFileSnippet] = usePanelDocument(panelId, "data", true)

    // handle changes in SBOL
    const setSBOLContent = async newSnippetContent => {
        setFileSnippet(newSnippetContent)
        console.debug("Received SBOL from child.")
    }

    // iframe reference
    const iframeRef = useRef()

    // loading states
    const [iframeLoaded, setIFrameLoaded] = useState(false)
    const [sbolContentLoaded, setSbolContentLoaded] = useState(!fileSnippet)
    const loadProgress = 10 + (iframeLoaded + sbolContentLoaded) * 45

    // handle incoming messages from iframe
    useEventListener(window, "message", ({ data, source, origin }) => {

        // make sure source is this iframe
        if (source != iframeRef.current.contentWindow)
            return

        // handle simple string messages
        switch (data) {
            case 'graphServiceLoadedSBOL':
                setSbolContentLoaded(true)
                return
        }

        // handle object payloads
        if (data?.sbol)
            setSBOLContent(data.sbol)
    })

    // handle iframe load
    const handleIFrameLoad = () => {
        setIFrameLoaded(true)
        setSbolContentLoaded(!fileSnippet) // skip loading SBOL if there's no SBOL

        // post message
        iframeRef.current.contentWindow.postMessage(
            fileSnippet ?
                { sbol: fileSnippet } : // either send SBOL content
                'hello canvas',         // or send dummy message
            import.meta.env.VITE_SBOL_CANVAS_URL
        )
    }

    return (
        <div style={containerStyle}>
            <iframe
                // src={import.meta.env.VITE_SBOL_CANVAS_URL + '?ignoreHTTPErrors=true'}
                src={import.meta.env.VITE_SBOL_CANVAS_URL}
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