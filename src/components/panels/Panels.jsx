import DragTabs from "./DragTabs"
import Panel from "./Panel"
import CenteredTitle from "../CenteredTitle"
import { useLocalStorage } from "@mantine/hooks"
import WelcomeScreen from "../WelcomeScreen"
import { usePanelActions, usePanelStore } from "../../modules/state/panelStore"
import { Box, Center, Text } from "@mantine/core"

export default function Panels() {

    // panel states
    const panelIds = usePanelStore(s => s.ids)
    const activePanel = usePanelStore(s => s.active)
    const { setActive: setActivePanel, reorder: reorderPanels } = usePanelActions()

    // first time visitor
    const [firstTime] = useLocalStorage({ key: 'first-time-visiting', defaultValue: true })

    return (
        panelIds.length ?
            <DragTabs
                tabComponent={Panel.Tab}
                contentComponent={Panel.Content}
                tabIds={panelIds}
                active={activePanel}
                onSelect={setActivePanel}
                onReorder={reorderPanels}
            /> :
            firstTime ?
                <WelcomeScreen /> :
                <CenteredTitle>Open a file to start</CenteredTitle>
    )
}
