import DragTabs from "./DragTabs"
import { useActivePanel, useOpenPanel, usePanelIds, useReorderPanels } from '../../redux/hooks/panelsHooks'
import Panel from "./Panel"
import CenteredTitle from "../CenteredTitle"
import { useLocalStorage } from "@mantine/hooks"
import WelcomeScreen from "../WelcomeScreen"
import { DummyAnalysisFileHandle, useBrowserCompatbility } from "../BrowserCompatiblityProvider"
import { useEffect } from "react"

export default function Panels() {

    // panel states
    const panelIds = usePanelIds()
    const [activePanel, setActivePanel] = useActivePanel()
    const reorderPanels = useReorderPanels()

    // first time visitor
    const [firstTime, setFirstTime] = useLocalStorage({ key: 'first-time-visiting', defaultValue: true })

    // browser compatibility
    const { fileSystemCompatible } = useBrowserCompatbility()
    const openPanel = useOpenPanel()
    useEffect(() => {
        if(!fileSystemCompatible) {
            openPanel(DummyAnalysisFileHandle)
            setFirstTime(false)
        }
    }, [fileSystemCompatible])

    return (
        <div style={{ flexGrow: 1 }}>
            {panelIds.length ?
                <DragTabs
                    tabComponent={Panel.Tab}
                    contentComponent={Panel.Content}
                    tabIds={panelIds}
                    active={activePanel}
                    onSelect={setActivePanel}
                    onReorder={reorderPanels}
                /> :
                firstTime && fileSystemCompatible ?
                    <WelcomeScreen /> :
                    <CenteredTitle>Open a file to start</CenteredTitle>}
        </div>
    )
}
