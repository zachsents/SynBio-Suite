import { ActionIcon, Button, Tooltip } from '@mantine/core'

export default function FolderSelect({ onSelect, icon, children, ...props }) {

    const handleClick = async () => {
        const directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'desktop'
        })

        onSelect?.(directoryHandle)
    }

    return icon ?
        <Tooltip label={children}>
            <ActionIcon variant="transparent" onClick={handleClick} {...props}>{icon}</ActionIcon>
        </Tooltip> :
        <Button onClick={handleClick} {...props}>{children || "Open Folder"}</Button>
}
