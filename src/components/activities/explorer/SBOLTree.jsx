import { Text } from '@mantine/core'
import { useMemo } from 'react'
import shallow from 'zustand/shallow'
import { DocumentTypes, getDocumentType } from '../../../modules/documentTypes'
import { useDocumentStore } from '../../../state/documentStore'
import ExplorerAccordion from './ExplorerAccordion'
import ExplorerListItem from './ExplorerListItem'


export default function SBOLTree() {

    const files = useDocumentStore(s => s.files)

    return (
        <ExplorerAccordion
            // topMargin
            noBottomBorder
            uppercase={false}
            data={files.filter(file => file.sbol).map(file => ({
                id: file.name,
                title: file.name,
                content: <SBOLFile file={file} />
            }))}
        />
    )
}

function SBOLFile({ file }) {

    const documents = useDocumentStore(s => file.documents.map(docId => s.entities[docId]), shallow)

    const [modules, components, sequences] = useMemo(() => [
        documents.filter(doc => doc.type == DocumentTypes.SBOLModuleDefinition),
        documents.filter(doc => doc.type == DocumentTypes.SBOLComponentDefinition),
        documents.filter(doc => doc.type == DocumentTypes.SBOLSequence),
    ], [documents])

    const [ModuleIcon, ComponentIcon, SequenceIcon] = useMemo(() => [
        getDocumentType(DocumentTypes.SBOLModuleDefinition).icon,
        getDocumentType(DocumentTypes.SBOLComponentDefinition).icon,
        getDocumentType(DocumentTypes.SBOLSequence).icon,
    ], [])

    return <ExplorerAccordion
        noBottomBorder
        data={[
            {
                id: "modules", title: "Modules", titleInfo: modules.length, content: modules.map(doc =>
                    <ExplorerListItem
                        documentId={doc.id}
                        {...doc}
                        // if it has a short name, use that and put full name in paranthesis
                        {...(doc.shortName && { name: doc.shortName, nameInfo: doc.name })}
                        source={undefined}
                        icon={<ModuleIcon />}
                        key={doc.id}
                    />
                )
            },
            {
                id: "components", title: "Components", titleInfo: components.length, content: components.map(doc =>
                    <ExplorerListItem
                        documentId={doc.id}
                        {...doc}
                        // if it has a short name, use that and put full name in paranthesis
                        {...(doc.shortName && { name: doc.shortName, nameInfo: doc.name })}
                        source={undefined}
                        icon={<ComponentIcon />}
                        key={doc.id}
                    />
                )
            },
            {
                id: "sequences", title: "Sequences", titleInfo: sequences.length, content: sequences.map(doc =>
                    <ExplorerListItem
                        documentId={doc.id}
                        {...doc}
                        // if it has a short name, use that and put full name in paranthesis
                        {...(doc.shortName && { name: doc.shortName, nameInfo: doc.name })}
                        source={undefined}
                        icon={<SequenceIcon />}
                        key={doc.id}
                    />
                )
            },
        ]}
    />
}

function Modules({ documentList }) {

    // make sure document is module
    if (document.type != DocumentTypes.SBOLModuleDefinition)
        return <Text size="xs">Not an SBOL2 Module</Text>

    return (
        <ExplorerAccordion
            data={[]}
        />
    )
}