import { memo, useState } from 'react'
import { Group, Menu, Text, Tooltip, useMantineTheme } from '@mantine/core'
// import commands from "../../../modules/commands"
import DragObject from '../../DragObject'
import { usePanelActions } from '../../../modules/state/panelStore'

export default memo(ExplorerListItem)

function ExplorerListItem({ documentId, name, nameInfo, type, source, icon }) {

    const theme = useMantineTheme()

    const { open: openPanel } = usePanelActions()

    // context menu states
    const [contextMenuOpen, setContextMenuOpen] = useState(false)

    // right click handler
    const handleRightClick = event => {
        event.preventDefault()
        setContextMenuOpen(true)
    }

    // command list
    const contextMenuCommands = [
        // commands.FileDelete
    ]

    // create drag object up here to avoid repeating ourselves
    const dragObject = <DragObject
        title={nameInfo ?
            <Group spacing="xs">
                <Text size="sm">{name}</Text>
                <Text size="sm" color="dimmed">{nameInfo}</Text>
            </Group> : name
        }
        documentId={documentId}
        type={type}
        icon={icon}
        onDoubleClick={() => openPanel(documentId)}
        onContextMenu={handleRightClick}
    />

    return (
        <Menu
            shadow="md"
            width={200}
            trigger=""
            opened={contextMenuOpen}
            onChange={setContextMenuOpen}
            withArrow={true}
            styles={menuStyles}
        >
            <Menu.Target>
                {/* have to wrap this in a div so it can add a ref */}
                <div>
                    {source ?
                        <Tooltip
                            label={<Text color={theme.colors.dark[1]}>Source: {source}</Text>}
                            color={theme.colors.dark[4]}
                            openDelay={700}
                        >
                            <div>{dragObject}</div>
                        </Tooltip>
                        :
                        dragObject
                    }
                </div>
            </Menu.Target>

            <Menu.Dropdown>
                {contextMenuCommands.map(cmd =>
                    <Menu.Item
                        key={cmd.id}
                        color={cmd.color}
                        icon={cmd.icon}
                        onClick={() => cmd.execute(documentId)}
                    >
                        {cmd.shortTitle}
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    )
}


const menuStyles = theme => ({
    dropdown: {
        backgroundColor: theme.colors.dark[5]
    }
})