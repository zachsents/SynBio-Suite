import { useEffect, useState } from 'react'
import { Container, Stepper, Group, Button, Tabs, Space } from "@mantine/core"
import Dropzone from '../../Dropzone'
import CenteredTitle from '../../CenteredTitle'
import { showNotification } from '@mantine/notifications'
import { TbComponents } from 'react-icons/tb'
import { IoAnalyticsSharp } from 'react-icons/io5'
import { BiWorld } from "react-icons/bi"
import ParameterForm from './ParameterForm'
import ReviewTable from './ReviewTable'
import { DocumentTypes } from '../../../modules/documentTypes'
import { useContext } from 'react'
import { pollStatus, submitAnalysis, terminateAnalysis } from '../../../modules/ibiosim'
import { useRef } from 'react'
import { PanelContext } from './SimulatorPanel'
import { useTimeout } from '@mantine/hooks'
import { RuntimeStatus } from '../../../modules/runtimeStatus'
import SimulationTimeline from './SimulationTimeline'
import { CgCheckO } from "react-icons/cg"
import { usePanelDocument } from '../../../state/hooks'
import { removeUnderscores } from '../../../modules/documentParser'
import { useDocumentStore } from '../../../state/documentStore'


export const TabValues = {
    ENVIRONMENT: 'environment',
    PARAMETERS: 'parameters',
    INPUT: 'input'
}


export default function AnalysisWizard() {

    const panelId = useContext(PanelContext)

    // file info
    const panelTitle = removeUnderscores(usePanelDocument(panelId, "name"))

    const [status, setStatus] = usePanelDocument(panelId, "data.runtimeStatus", true, false)
    const running = RuntimeStatus.running(status)
    const [, setRequestedAt] = usePanelDocument(panelId, "data.lastRequestedAt", true, false)

    // stepper states
    const numSteps = 3
    const [activeStep, setActiveStep] = usePanelDocument(panelId, "data.activeStep", true, 0)
    const nextStep = () => setActiveStep(activeStep < numSteps ? activeStep + 1 : activeStep)
    const prevStep = () => setActiveStep(activeStep > 0 ? activeStep - 1 : activeStep)

    // Step 1: select component
    const [componentId, setComponentId] = usePanelDocument(panelId, "data.componentDocument", true)
    const component = useDocumentStore(s => s.entities[componentId])
    const handleComponentChange = docId => {
        setComponentId(docId)
    }
    const isComponentOMEX = component?.type == DocumentTypes.OMEX

    // Step 2: select parameter source
    const [parameterSource, setParameterSource] = usePanelDocument(panelId, "data.parameterSource", true, TabValues.ENVIRONMENT)
    const [environmentId, setEnvironmentId] = usePanelDocument(panelId, "data.environmentDocument", true)
    const environment = useDocumentStore(s => s.entities[environmentId])
    const handleEnvironmentChange = docId => {
        setEnvironmentId(docId)
    }

    // form state
    const formValues = usePanelDocument(panelId, "data.formValues")
    const [formValidated, setFormValidated] = useState()

    // determine if we can move to next step or not
    let showNextButton = false
    switch (activeStep) {
        case 0: showNextButton = !!componentId
            break
        case 1: showNextButton =
            (parameterSource == TabValues.ENVIRONMENT && !!environmentId) ||
            (parameterSource == TabValues.PARAMETERS && formValidated) ||
            parameterSource == TabValues.INPUT
            break
    }

    // submission & response tracking
    const [results, setResults] = usePanelDocument(panelId, "data.results", true)
    const [orchestrationUris, setOrchestrationUris] = usePanelDocument(panelId, "data.orchestrationUris", true)

    const orchestrationUrisRef = useRef(orchestrationUris)  // have to use refs for access from setTimeout callback
    orchestrationUrisRef.current = orchestrationUris

    const pollingTimeout = useTimeout(async () => {

        console.debug(`${panelTitle}: Polling analysis status...`)
        const pollResult = await pollStatus(orchestrationUrisRef.current)

        setStatus(pollResult.runtimeStatus)

        // if there's no output, analysis is still running
        // so we should run another poll and return
        if (!pollResult.output) {
            pollingTimeout.start()
            return
        }

        // success case
        if (pollResult.runtimeStatus == RuntimeStatus.COMPLETED) {
            setResults(pollResult.output)
            console.debug(`${panelTitle}: Analysis complete.`)
            showNotification({
                message: `${panelTitle} has finished running.`,
                color: "green"
            })
            return
        }

        // failing case
        console.debug(`${panelTitle}: Analysis failed. Logging failed poll.`)
        console.debug(pollResult)
        showNotification({
            message: `${panelTitle} failed.`,
            color: "red"
        })

    }, 5000, { autoInvoke: running })

    const handleAnalysisRun = async () => {
        setStatus(RuntimeStatus.REQUESTED)
        setRequestedAt(Date.now())

        try {
            // start analysis
            const response = await submitAnalysis(
                component,
                parameterSource == TabValues.PARAMETERS ?
                    { parameters: formValues } :
                    parameterSource == TabValues.ENVIRONMENT ?
                        { environment } :
                        {}
            )

            setStatus(RuntimeStatus.ACCEPTED)
            setOrchestrationUris(response)
            pollingTimeout.start()
            console.debug(`${panelTitle}: Analysis accepted.`)
        }
        catch (error) {
            cancelAnalysis(RuntimeStatus.FAILED)
            console.error(`${panelTitle}: Error occurred running analysis:`, error)
            showNotification({
                message: `Encountered an error while running analysis for ${panelTitle}.`,
                color: "red"
            })
        }
    }

    // stop polling interval on unmount
    useEffect(() => pollingTimeout.clear, [])

    // function to cancel / fail analysis
    const cancelAnalysis = status => {
        setStatus(status)
        pollingTimeout.clear()
        terminateAnalysis(orchestrationUris)
    }

    // handle changing selected parameter source when input changes
    useEffect(() => {
        isComponentOMEX ?
            parameterSource == TabValues.ENVIRONMENT && setParameterSource(TabValues.INPUT) :
            parameterSource == TabValues.INPUT && setParameterSource(TabValues.ENVIRONMENT)
    }, [componentId])

    return (
        <Container style={stepperContainerStyle}>
            <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm">
                <Stepper.Step
                    allowStepSelect={activeStep > 0 && !running}
                    label="Select input file"
                    description="SBOL, SBML, or OMEX"
                    icon={<TbComponents />}
                >
                    <Dropzone
                        allowedTypes={[DocumentTypes.SBOLModuleDefinition, DocumentTypes.SBML, DocumentTypes.OMEX]}
                        item={component?.name}
                        onItemChange={handleComponentChange}
                    >
                        Drag & drop a component from the explorer
                    </Dropzone>
                </Stepper.Step>
                <Stepper.Step
                    allowStepSelect={activeStep > 1 && !running}
                    label="Choose parameter source"
                    description="Select archive or manually enter"
                    icon={<BiWorld />}
                >
                    <Space h='xl' />
                    <Tabs position='center' value={parameterSource} onTabChange={setParameterSource} >
                        <Tabs.List grow>
                            {isComponentOMEX ?
                                <Tabs.Tab value={TabValues.INPUT}>
                                    Use parameters from input archive
                                </Tabs.Tab> :
                                <Tabs.Tab value={TabValues.ENVIRONMENT}>
                                    Select an environment archive
                                </Tabs.Tab>}
                            <Tabs.Tab value={TabValues.PARAMETERS}>
                                Manually enter parameters
                            </Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value={TabValues.ENVIRONMENT}>
                            <Dropzone
                                allowedTypes={[DocumentTypes.OMEX]}
                                item={environment?.name}
                                onItemChange={handleEnvironmentChange}
                            >
                                Drag & drop an environment from the explorer
                            </Dropzone>
                        </Tabs.Panel>
                        <Tabs.Panel value={TabValues.PARAMETERS}>
                            <ParameterForm onValidation={validation => setFormValidated(!validation.hasErrors)} />
                        </Tabs.Panel>
                        <Tabs.Panel value={TabValues.INPUT}>
                            <CenteredTitle color="green" leftIcon={<CgCheckO />} height={100}>{component?.name}</CenteredTitle>
                        </Tabs.Panel>
                    </Tabs>
                </Stepper.Step>
                <Stepper.Step
                    allowStepSelect={activeStep > 2 && !running}
                    label="Run analysis"
                    description="Execute on iBioSim server"
                    icon={<IoAnalyticsSharp />}
                    loading={running}
                >
                    <Space h='lg' />
                    <Group grow style={{ alignItems: 'flex-start' }}>
                        <ReviewTable />
                        <SimulationTimeline />
                    </Group>
                </Stepper.Step>
                <Stepper.Completed>
                    <CenteredTitle height={150}>Analysis is in progress...</CenteredTitle>
                    <Button color='red'>Cancel</Button>
                </Stepper.Completed>
            </Stepper>
            <Group position="center" mt="xl">
                {running ?
                    <Button color='red' onClick={() => cancelAnalysis(RuntimeStatus.CANCELLED)}>
                        Cancel
                    </Button> :
                    <>
                        <Button
                            variant="default"
                            onClick={prevStep}
                            sx={{ visibility: activeStep == 0 || activeStep == 3 ? 'hidden' : 'visible' }}
                        >
                            Back
                        </Button>
                        {activeStep < 2 ?
                            <Button
                                onClick={nextStep}
                                sx={{ visibility: showNextButton ? 'visible' : 'hidden' }}
                            >
                                Next step
                            </Button> :
                            <Button
                                type="submit"
                                // gradient={{ from: "canvasBlue", to: "indigo" }}
                                gradient={{ from: "blue", to: "indigo" }}
                                variant="gradient"
                                radius="xl"
                                onClick={handleAnalysisRun}
                            >
                                Run Analysis
                            </Button>}
                    </>}
            </Group>
        </Container>
    )
}


const stepperContainerStyle = {
    marginTop: 40,
    padding: '0 40px',
    flexDirection: 'column'
}
