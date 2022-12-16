import { Button, Popover, Slider, Switch, Text } from '@mantine/core'
import { useContext } from 'react'
import { GoSettings } from 'react-icons/go'
import { usePanelDocument } from '../../../modules/state/hooks'
import { PanelContext } from './SimulatorPanel'

export default function ChartOptions() {

    const panelId = useContext(PanelContext)

    const [useWhiteBackground, setUseWhiteBackground] =
        usePanelDocument(panelId, "data.chartOption_useWhiteBackground", true, false)

    const [truncateSpeciesNames, setTruncateSpeciesNames] =
        usePanelDocument(panelId, "data.chartOption_trucateSpeciesNames", true, true)

    const [showTitles, setShowTitles] =
        usePanelDocument(panelId, "data.chartOption_showTitles", true, false)

    const [showGrid, setShowGrid] =
        usePanelDocument(panelId, "data.chartOption_showGrid", true, true)

    const [showLegendWithEvery, setShowLegendWithEvery] =
        usePanelDocument(panelId, "data.chartOption_showLegendWithEvery", true, false)

    const [chartWidth, setChartWidth] =
        usePanelDocument(panelId, "data.chartOption_width", true, 100)

    const [chartHeight, setChartHeight] =
        usePanelDocument(panelId, "data.chartOption_height", true, 400)

    const [gapBetweenCharts, setGapBetweenCharts] =
        usePanelDocument(panelId, "data.chartOption_gapBetween", true, 20)

    return (

        <Popover position='bottom-end'>
            <Popover.Target>
                <Button variant='outline' leftIcon={<GoSettings />} >Chart Options</Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Switch
                    label="Use white background"
                    checked={useWhiteBackground}
                    onChange={event => setUseWhiteBackground(event.currentTarget.checked)}
                    mb={10}
                />

                <Switch
                    label="Show chart titles"
                    checked={showTitles}
                    onChange={event => setShowTitles(event.currentTarget.checked)}
                    mb={10}
                />

                <Switch
                    label="Show grid"
                    checked={showGrid}
                    onChange={event => setShowGrid(event.currentTarget.checked)}
                    mb={10}
                />

                <Switch
                    label="Truncate species names"
                    checked={truncateSpeciesNames}
                    onChange={event => setTruncateSpeciesNames(event.currentTarget.checked)}
                    mb={10}
                />

                <Switch
                    label="Show legend with every chart"
                    checked={showLegendWithEvery}
                    onChange={event => setShowLegendWithEvery(event.currentTarget.checked)}
                    mb={10}
                />

                <Text size='sm' mb={6}>Chart width</Text>
                <Slider
                    value={chartWidth}
                    onChange={setChartWidth}
                    marks={[
                        { value: 25, label: '' },
                        { value: 50, label: '' },
                        { value: 75, label: '' },
                    ]}
                    label={label => label + '%'}
                    labelAlwaysOn={true}
                    min={0}
                    max={100}
                    step={5}
                    styles={sliderStyles}
                    mb={40}
                />

                <Text size='sm' mb={6}>Chart height</Text>
                <Slider
                    value={chartHeight}
                    onChange={setChartHeight}
                    marks={[
                        { value: 200, label: '' },
                        { value: 400, label: '' },
                        { value: 600, label: '' },
                    ]}
                    labelAlwaysOn={true}
                    min={0}
                    max={800}
                    step={25}
                    styles={sliderStyles}
                    mb={40}
                />

                <Text size='sm' mb={6}>Gap between charts</Text>
                <Slider
                    value={gapBetweenCharts}
                    onChange={setGapBetweenCharts}
                    marks={[
                        { value: 10, label: '' },
                        { value: 20, label: '' },
                        { value: 30, label: '' },
                    ]}
                    label={label => label + '%'}
                    labelAlwaysOn={true}
                    min={0}
                    max={40}
                    step={5}
                    styles={sliderStyles}
                    mb={40}
                />
            </Popover.Dropdown>
        </Popover>
    )
}


const sliderStyles = theme => ({
    label: {
        transform: "translateY(54px)"
    }
})
