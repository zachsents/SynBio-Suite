import { ActionIcon, Box, Button, Divider, Image, ScrollArea, Space, Stack, Tabs, ThemeIcon, Title, Tooltip } from '@mantine/core'
import { useState } from 'react'
import { IconFiles } from "@tabler/icons"
import ColorSchemeToggle from "../../components/mantineui/ColorSchemeToggle"
import { useRef } from 'react'
import { useEffect } from 'react'
import { useForceUpdate } from '@mantine/hooks'
import ExplorerActivityView from './explorer/ExplorerActivityView'


const activities = [
    { label: "Local Explorer", value: "explorer", icon: IconFiles, component: ExplorerActivityView }
]


export default function Activities() {

    // activity state
    const [activeActivity, setActiveActivity] = useState(activities[0].value)

    // refs for calculating ScrollArea height
    const panelRefs = useRef([])
    const titleRefs = useRef([])

    // force update on mount to get refs correct height
    const forceUpdate = useForceUpdate()
    useEffect(() => {
        forceUpdate()
    }, [])
    
    return (
        <Tabs
            value={activeActivity}
            onTabChange={setActiveActivity}
            variant='default'
            orientation='vertical'
            allowTabDeactivation={true}
            styles={tabStyles}
        >
            <Tabs.List>
                {activities.map(act =>
                    <Tabs.Tab value={act.value} key={act.value}>
                        <Tooltip label={act.label} position="right">
                            <Box p="sm">
                                <act.icon size={30} />
                            </Box>
                        </Tooltip>
                    </Tabs.Tab>
                )}
                <Space h="xl" sx={{ flexGrow: 1, }} />
                <ColorSchemeToggle />
                <Space h="xl" />
            </Tabs.List>

            {activities.map((act, i) =>
                <Tabs.Panel
                    value={act.value}
                    ref={el => el?.offsetHeight > 0 && (panelRefs.current[i] = el.offsetHeight)}
                    key={act.value}
                >
                    <Title
                        order={6}
                        px="xs"
                        py="sm"
                        ref={el => el?.offsetHeight > 0 && (titleRefs.current[i] = el.offsetHeight)}
                    >
                        Local Explorer
                    </Title>
                    <Divider size={2} />

                    <ScrollArea style={{ height: (panelRefs.current[i] ?? 0) - (titleRefs.current[i] ?? 0) }}>
                        <act.component />
                    </ScrollArea>
                </Tabs.Panel>
            )}
        </Tabs>
    )
}


const tabStyles = theme => {
    const dark = theme.colorScheme == 'dark'

    return {
        tabsList: {
            backgroundColor: dark ? theme.colors.dark[5] : theme.colors.gray[2],
            // minHeight: '100vh'
            alignItems: "center",
            overflow: "visible",
        },
        tab: {
            padding: 0,
            overflow: "visible",
        },
        tabLabel: {
            overflow: "visible",

        },
        panel: {
            backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[1],
            width: 260,
            padding: 0,
        },
    }
}