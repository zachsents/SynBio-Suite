import { Badge, Container, Group, Table, Text } from '@mantine/core'
import { useContext } from 'react'
import { getDocumentType } from '../../../modules/documentTypes'
import { parameterMap } from './ParameterForm'
import { PanelContext } from './SimulatorPanel'
import { TabValues as ParameterSources } from './AnalysisWizard'
import { usePanelDocument } from '../../../modules/state/hooks'
import { useDocument } from '../../../modules/state/documentStore'
import { removeUnderscores } from '../../../modules/documentParser'


export default function ReviewTable() {

    const panelId = useContext(PanelContext)

    const formValues = usePanelDocument(panelId, "data.formValues")
    const parameterSource = usePanelDocument(panelId, "data.parameterSource")

    const inputDocumentId = usePanelDocument(panelId, "data.componentDocument")
    const inputDocument = useDocument(inputDocumentId)
    const inputDocumentType = getDocumentType(inputDocument?.type)

    const environmentDocumentId = usePanelDocument(panelId, "data.environmentDocument")
    const environmentDocument = useDocument(environmentDocumentId)
    const environmentDocumentType = getDocumentType(environmentDocument?.type)

    const tableContents = () => {
        switch (parameterSource) {
            case ParameterSources.ENVIRONMENT:
                return <tr>
                    <td><Text weight={600}>Environment</Text></td>
                    <td>
                        <Group position='right'>
                            <Text weight={600}>{removeUnderscores(environmentDocument?.name)}</Text>
                            {environmentDocumentType?.badgeLabel &&
                                <Badge>{environmentDocumentType.badgeLabel}</Badge>}
                        </Group>
                    </td>
                </tr>
            case ParameterSources.PARAMETERS:
                return Object.entries(formValues)
                    .filter(([, value]) => value != null)
                    .map(([key, value], i) =>
                        <tr key={i}>
                            <td>{parameterMap[key]?.label}</td>
                            <td align='right' >{`${value}`.toUpperCase()}</td>
                        </tr>)
        }
    }

    return (
        <Container>
            <Table horizontalSpacing={20}>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><Text weight={600}>Input</Text></td>
                        <td>
                            <Group position='right'>
                                <Text weight={600}>{removeUnderscores(inputDocument?.name)}</Text>
                                {inputDocumentType?.badgeLabel &&
                                    <Badge>{inputDocumentType.badgeLabel}</Badge>}
                            </Group>
                        </td>
                    </tr>
                    {tableContents()}
                </tbody>
            </Table>
        </Container>
    )
}
