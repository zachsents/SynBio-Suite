import { Tabs, Center } from '@mantine/core'
import { createContext } from 'react'
import PanelSaver from '../PanelSaver'
import CanvasFrame from './CanvasFrame'

export const PanelContext = createContext()

export default function SBOLEditorPanel({ id }) {

    return (
        <PanelContext.Provider value={id}>
            {/* <Tabs styles={tabStyles} active={activeTab} onTabChange={setActiveTab}>
                <Tabs.Tab label="Design" >
                    <DesignView />
                </Tabs.Tab>
                <Tabs.Tab label="Export" >
                    <Center sx={centerStyle}>
                        <h3>COMING SOON</h3>
                        <p>Export to SBOL, render images, etc.</p>
                    </Center>
                </Tabs.Tab>
                <Tabs.Tab label="Upload" >
                    <Center sx={centerStyle}>
                        <h3>COMING SOON</h3>
                        <p>Upload to SynBioHub</p>
                    </Center>
                </Tabs.Tab>
            </Tabs> */}
            <CanvasFrame />
            <PanelSaver id={id} />
        </PanelContext.Provider>
    )
}

const centerStyle = {
    minHeight: '50vh',
    flexDirection: 'column'
}

const tabStyles = theme => ({
    tabControl: {
        width: 120,
        textTransform: 'uppercase',
        fontWeight: 600
    },
    tabsList: {
        // backgroundColor: theme.colors.dark[6]
    }
})