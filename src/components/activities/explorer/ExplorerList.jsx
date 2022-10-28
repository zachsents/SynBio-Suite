import { Fragment, useState, memo, useCallback } from "react"
import CreateNewButton from "./CreateNewButton"
import { DocumentTypes } from '../../../modules/documentTypes'
import ExplorerListItem from './ExplorerListItem'
import { useDocumentStore } from '../../../state/documentStore'
import { documentListCompare } from '../../../state/entityTemplate'
import { FaSearch } from "react-icons/fa"
import { useDebouncedValue } from "@mantine/hooks"
import ExplorerAccordion from "./ExplorerAccordion"
import SBOLTree from "./SBOLTree"


export default function ExplorerList() {

    // grab list of partial documents
    const documents = useDocumentStore(s => s.ids.map(
        id => {
            const { name, type, source } = s.entities[id]
            return { id, name, type, source }
        }
    ), documentListCompare)

    // search state and handler
    const [rawSearchQuery, setSearchQuery] = useState("")
    const [searchQuery] = useDebouncedValue(rawSearchQuery, 400)

    return (
        <>
            {/* <TextInput value={rawSearchQuery} onChange={event => setSearchQuery(event.currentTarget.value)} mt={10} size="xs" icon={<FaSearch />} /> */}
            <ExplorerListItemContainer
                searchQuery={searchQuery}
                documents={documents}
            />
        </>
    )
}

const ExplorerListItemContainer = memo(({ searchQuery, documents }) => {

    const documentTypes = Object.values(DocumentTypes)

    // handle creation
    // WIP TO DO: implement creation
    const handleCreateObject = useCallback(() => { }, [])

    // count SBOL files
    const numberOfSbolFiles = useDocumentStore(s => s.files.filter(file => file.sbol).length)

    return (
        <ExplorerAccordion
            // topMargin
            defaultValue={[]}
            key={Math.random()}     // this forces re-render and fixes accordion heights
            data={[
                {
                    id: "sbol",
                    title: "SBOL Files",
                    titleInfo: numberOfSbolFiles,
                    content: <SBOLTree />
                },
                ...documentTypes.filter(dt => !dt.sbol).map(docType => {

                    // pick out the List Items we need
                    const docList = documents
                        .filter(doc => doc.type == docType.id && alignsWithSearch(doc.name, searchQuery))
                        .map(doc =>
                            <ExplorerListItem
                                documentId={doc.id} name={doc.name} type={doc.type} source={doc.source}
                                icon={docType.icon && <docType.icon />} key={doc.id}
                            />
                        )

                    return {
                        id: docType.id,
                        title: docType.listTitle,
                        titleInfo: docList.length,
                        content: <Fragment key={docType.id}>
                            {docType.createable &&
                                <CreateNewButton
                                    onCreate={handleCreateObject(docType.extension)}
                                    suggestedName={`New ${docType.title}`}
                                >
                                    New {docType.title}
                                </CreateNewButton>
                            }
                            {docList}
                        </Fragment>
                    }
                })
            ]}
        />
    )
})


function alignsWithSearch(item, query) {
    const terms = query.toLowerCase().split(/\s+/).filter(term => !!term)
    return !query || terms.some(term => item.toLowerCase().includes(term))
}