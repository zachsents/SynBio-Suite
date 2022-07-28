import { useState, useRef, useEffect } from "react"
import { Tabs } from '@mantine/core'
import TabLabel from "./TabLabel"
import CenteredTitle from "../CenteredTitle"
import SimulatorPanel from "./simulator/SimulatorPanel"


export default function DragTabs({ tabs, active, onSelect, onClose, onReorder }) {

    // drag states
    const tabRefs = useRef([])
    const [dragState, setDragState] = useState()

    // update tab refs
    useEffect(() => {
        tabRefs.current = tabRefs.current.slice(0, tabs.length)
    }, [tabs])


    // drag handlers

    const handleMouseDown = index => event => {
        if (event.button == 0) {
            dragState ?
                handleMouseLeave() :
                setDragState({
                    index,
                    start: [event.clientX, event.clientY],
                    width: tabRefs.current[index].clientWidth
                })
        }
    }

    const handleMouseMove = event => {
        if (dragState) {
            const diffX = event.clientX - dragState.start[0]
            const diffY = Math.abs(event.clientY - dragState.start[1])

            // calculate new position and clamp to array bounds
            const newPos = Math.max(
                Math.min(
                    Math.round(diffX / dragState.width + dragState.index),
                    tabRefs.current.length - 1
                ),
                0
            )

            // update position of tab
            const transform = Math.max(diffX, -dragState.index * dragState.width)   // clip to left edge
            tabRefs.current[dragState.index].style.transform = `translateX(${transform}px)`
            tabRefs.current[dragState.index].style.zIndex = 1000

            // transform other tabs
            const proposedOrder = []
            tabRefs.current.forEach((_, i) => i != dragState.index && proposedOrder.push(i))
            proposedOrder.splice(newPos, 0, dragState.index)    // splice in dragged item
            proposedOrder.forEach((originalIndex, newIndex) => {
                if (originalIndex != dragState.index) {
                    const transform = (newIndex - originalIndex) * dragState.width
                    tabRefs.current[originalIndex].style.transform = `translateX(${transform}px)`
                }
            })

            // drag has gone too far off axis
            diffY > 100 && handleMouseLeave()

            setDragState({ ...dragState, newPos })
        }
    }

    const handleMouseLeave = event => {
        if (dragState) {
            tabRefs.current.forEach(element => element.style.transform = 'none')
            tabRefs.current[dragState.index].style.zIndex = 1
        }
        setDragState(null)
    }

    const handleMouseUp = event => {
        if (dragState) {
            if (dragState.newPos != null) {
                onReorder({
                    from: dragState.index,
                    to: dragState.newPos,
                    select: true
                })
            }
            handleMouseLeave()
        }
    }

    return (
        tabs.length ?
            <div
                style={containerStyle}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}>
                <Tabs variant="outline" styles={tabsStyles} value={active} >
                    <Tabs.List>
                        {tabs.map((tab, i) =>
                            <Tabs.Tab
                                onMouseDown={handleMouseDown(i)}
                                onMouseUp={() => onSelect(tab.id)}
                                ref={el => tabRefs.current[i] = el}
                                key={tab.id}
                                value={tab.id}
                            >
                                <TabLabel
                                    title={tab.title}
                                    icon={tab.icon}
                                    id={tab.id}
                                    onClose={onClose}
                                />
                            </Tabs.Tab>
                        )}
                    </Tabs.List>
                    {tabs.map(tab =>
                        <Tabs.Panel key={tab.id} value={tab.id}>
                            {tab.content}
                        </Tabs.Panel>
                    )}
                </Tabs>
            </div> :
            <CenteredTitle>Open a file to start</CenteredTitle>
    )
}

const containerStyle = {
    minHeight: '100vh'
}

const scrollBarWidth = 8

const tabsStyles = theme => ({
    tabsList: {
        paddingLeft: 10,
        paddingTop: 5,
        whiteSpace: 'nowrap',
        display: 'block',
    },
    tab: {
        padding: 0,
        display: 'inline-block',
        position: 'relative',
        backgroundColor: theme.colors.dark[7],
        '&:hover': {
            backgroundColor: theme.colors.dark[6]
        },
        '&[data-active]': {
            borderColor: theme.colors.dark[3] + ' !important',
            backgroundColor: theme.colors.dark[6] + ' !important',
        }
    },
    panel: {
        padding: 0
    },
    tabsListWrapper: {
        overflowX: 'scroll',    // fallback
        overflowX: 'overlay',
        overflowY: 'hidden',

        // scrollbar styles

        '&::-webkit-scrollbar': {
            display: 'block',
            height: scrollBarWidth
        },

        '&::-webkit-scrollbar-button': {
            display: 'none'
        },

        '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
        },

        '&::-webkit-scrollbar-track-piece': {
            backgroundColor: 'transparent'
        },

        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: scrollBarWidth / 2,
        },

        '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: theme.colors.dark[4],
        }
    }
})