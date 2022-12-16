import { forwardRef } from 'react'
import { Tabs as MantineTabs } from "@mantine/core"
import TabLabel from './TabLabel'
import { usePanelActions } from '../../modules/state/panelStore'
import { removeUnderscores } from '../../modules/documentParser'
import { usePanelDocument, usePanelType } from '../../modules/state/hooks'

const Tab = forwardRef(({ id, ...props }, ref) => {

    const documentName = usePanelDocument(id, "name")
    const panelType = usePanelType(id)
    const {close: closePanel} = usePanelActions()

    return (
        <MantineTabs.Tab value={id} ref={ref} {...props}>
            <TabLabel
                title={removeUnderscores(documentName)}
                icon={panelType.icon}
                id={id}
                onClose={closePanel}
            />
        </MantineTabs.Tab>
    )
})

function Content({ id, ...props }) {

    const panelType = usePanelType(id)

    return (
        <MantineTabs.Panel value={id} {...props}>
            <panelType.component id={id} />
        </MantineTabs.Panel>
    )
}


export default {
    Tab,
    Content
}

