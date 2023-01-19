import { memo, useState } from 'react'
import { Group, Menu, Text, Tooltip, useMantineTheme } from '@mantine/core'
// import commands from "../../../modules/commands"
import DragObject from '../../DragObject'
import { usePanelActions } from '../../../modules/state/panelStore'
import { TbTrash } from 'react-icons/tb'
import { useDocument, useDocumentStore } from '../../../modules/state/documentStore'
import shallow from 'zustand/shallow'
import { openConfirmModal } from '@mantine/modals'


export default function ExplorerListItem({ documentId, icon, showSource }) {

    const theme = useMantineTheme()

    // grab some actions
    const { open: openPanel } = usePanelActions()
    const deleteFile = useDocumentStore(s => s.deleteFile)

    // grab document info
    const { name, source, type, entireFile } = useDocument(documentId, doc => ({
        name: doc.name,
        source: doc.sourceFile,
        type: doc.type,
        entireFile: doc.entireFile,
    }), shallow)

    // context menu state
    const [contextMenuOpen, setContextMenuOpen] = useState(false)

    // right click handler for opening context menu
    const handleRightClick = event => {
        event.preventDefault()
        setContextMenuOpen(true)
    }

    // function for deleting
    const handleDelete = async () => {

        // open a modal to confirm deletion
        openConfirmModal({
            title: `Delete ${source}`,
            children: (
                <Text size="sm">
                    Are you sure you want to delete {source}?
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: "red" },
            cancelProps: { color: "" },
            onCancel: () => {
                setContextMenuOpen(false)
            },
            onConfirm: () => {
                deleteFile(source)
            },
        })
    }

    // create drag object up here to avoid repeating ourselves
    const dragObject = <DragObject
        title={showSource ?
            <Group spacing="xs">
                <Text size="sm">{name}</Text>
                <Text size="sm" color="dimmed">{source}</Text>
            </Group> : name
        }
        documentId={documentId}
        type={type}
        icon={icon}
        onDoubleClick={() => openPanel(documentId)}
        onContextMenu={handleRightClick}
    />

    // context menu children -- separated so we can hide the menu if there are none
    const contextMenuChildren = [
        <Menu.Item
            color="red"
            icon={<TbTrash />}
            onClick={handleDelete}
        >
            Delete {source}
        </Menu.Item>
    ]

    const menuTarget = (
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
    )

    return contextMenuChildren.length ?
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
                {menuTarget}
            </Menu.Target>
            <Menu.Dropdown>
                {contextMenuChildren}
            </Menu.Dropdown>
        </Menu>
        :
        menuTarget
}


const menuStyles = theme => ({
    dropdown: {
        backgroundColor: theme.colors.dark[5]
    }
})