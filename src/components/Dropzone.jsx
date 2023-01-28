import { Center, Title, Text, Group, useMantineTheme, ActionIcon, Stack } from "@mantine/core"
import { Dropzone as MantineDropzone } from "@mantine/dropzone"

import { CgCheckO } from "react-icons/cg"
import { IoClose } from "react-icons/io5"
import { TbFile } from "react-icons/tb"
import { getFile } from "../redux/hooks/workingDirectoryHooks"


export default function Dropzone({ children, allowedTypes, item, onItemChange }) {

    const theme = useMantineTheme()

    const handleDrop = ([file]) => {
        onItemChange?.(file)
    }

    const handleSyntheticDrop = async event => {
        const fileId = event.dataTransfer.getData("fileId")

        if(!Object.values(allowedTypes).flat().some(ext => fileId.endsWith(ext)))
            return

        const fileHandle = getFile(fileId)
        onItemChange?.(await fileHandle?.getFile())
    }

    return item ?
        <Center sx={successStyles.container} >
            <CgCheckO style={successStyles.icon(theme)} />
            <Title order={3} sx={successStyles.title}>{item}</Title>
            <ActionIcon sx={successStyles.removeIcon} onClick={() => onItemChange?.(null)} ><IoClose /></ActionIcon>
        </Center>
        :
        <MantineDropzone
            onDrop={handleDrop}
            onReject={(files) => console.log('rejected files', files)}
            // maxSize={3 * 1024 ** 2}
            accept={allowedTypes}
            multiple={false}
            radius="lg"
            sx={theme => ({
                "&[data-reject], &[data-accept]": {
                    backgroundColor: theme.colors[theme.primaryColor][8],
                },
            })}
            onDropCapture={handleSyntheticDrop}
        >
            <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                <MantineDropzone.Accept>
                    <TbFile size={24} />
                </MantineDropzone.Accept>
                <MantineDropzone.Reject>
                    <TbFile size={24} />
                </MantineDropzone.Reject>
                <MantineDropzone.Idle>
                    <TbFile size={24} />
                </MantineDropzone.Idle>

                <Stack align="center" spacing="xs">
                    <Text size="xl" inline>
                        Drag & drop a file
                    </Text>
                    <Text size="sm" color="dimmed">
                        {children}
                    </Text>
                </Stack>
            </Group>
        </MantineDropzone>

    // return (
    //     item ?
    //         <Center sx={successStyles.container} >
    //             <CgCheckO style={successStyles.icon(theme)} />
    //             <Title order={3} sx={successStyles.title}>{item}</Title>
    //             <ActionIcon sx={successStyles.removeIcon} onClick={() => onItemChange(null)} ><IoClose /></ActionIcon>
    //         </Center> :
    //         <Center
    //             sx={containerStyle(allowedToDrop)}
    //             onDragOver={handleDragOver}
    //             onDragLeave={handleDragLeave}
    //             onDrop={handleDrop}
    //         >
    //             {allowedToDrop == null ?
    //                 <Title order={3} sx={titleStyle}>{children}</Title> :
    //                 allowedToDrop ?
    //                     <Text sx={iconStyle}><AiOutlineSmile /></Text> :
    //                     <Title order={3} sx={errorTitleStyle}>Item not allowed</Title>}
    //         </Center>
    // )
}

const successStyles = {
    container: theme => ({
        padding: "20px 30px",
        margin: "20px auto",
        width: "80%",
        borderRadius: 15,
        border: "3px solid " + theme.colors.green[6]
    }),
    icon: theme => ({
        color: theme.colors.green[6],
        fontSize: 22,
    }),
    title: theme => ({
        color: theme.colors.green[6],
        fontWeight: 600,
        marginLeft: 10
    }),
    removeIcon: theme => ({
        color: theme.other.inactiveColor,
        fill: theme.other.inactiveColor,
        fontSize: 20,
        marginLeft: 'auto',
        '&:hover': {
            color: theme.colors.red[5],
            fill: theme.colors.red[5],
        }
    })
}

const errorTitleStyle = theme => ({
    color: theme.colors.red[5],
    fontWeight: 600
})

const titleStyle = theme => ({
    color: theme.colors.dark[3],
    fontWeight: 600
})

const containerStyle = allowedToDrag => theme => ({
    padding: "60px 0",
    margin: "20px auto",
    width: "80%",
    borderRadius: 15,
    ...(allowedToDrag == null ?
        {
            border: "3px dashed " + theme.colors.dark[4]        // neutral case
        } :
        allowedToDrag ?
            {
                border: "3px dashed " + theme.colors.blue[6],    // good case
                padding: "50px 0"
            } :
            {
                border: "3px dashed " + theme.colors.red[6]     // bad case
            })
})

const iconStyle = theme => ({
    color: theme.colors.blue[6],
    fontSize: 30
})