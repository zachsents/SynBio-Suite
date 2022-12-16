import { Badge } from '@mantine/core'
import { useContext } from 'react'
import { RuntimeStatus } from '../../../modules/runtimeStatus'
import { usePanelDocument } from '../../../modules/state/hooks'
import { PanelContext } from './SimulatorPanel'

export default function StatusBadge() {

    const panelId = useContext(PanelContext)
    const status = usePanelDocument(panelId, "data.runtimeStatus")

    return RuntimeStatus.running(status) ?
        <div style={{ position: 'relative' }}>
            <Badge
                styles={badgeStyle}
                color="green"
                size='md'
                variant='dot'
            >
                Running
            </Badge>
        </div> :
        <></>
}

const badgeStyle = theme => ({
    root: {
        position: 'absolute',
        top: 10,
        right: 30,
        '&::before': {
            animation: 'fading 1.3s infinite'
        }
    }
})