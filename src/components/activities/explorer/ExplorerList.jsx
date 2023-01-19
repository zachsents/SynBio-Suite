import { useState, memo } from "react"
// import CreateNewButton from "./CreateNewButton"
import { DocumentTypes, FileTypes } from '../../../modules/documentTypes'
import ExplorerListItem from './ExplorerListItem'
import { usePartialDocuments } from '../../../modules/state/documentStore'
import { useDebouncedValue } from "@mantine/hooks"
import ExplorerAccordion from "./ExplorerAccordion"
import CreateNewButton from "./CreateNewButton"


export default function ExplorerList() {

    // grab list of partial documents
    const documents = usePartialDocuments(["name", "type"])

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


function ExplorerListItemContainer({ searchQuery, documents = [] }) {

    // handle creation
    // WIP TO DO: implement creation
    // const handleCreateObject = useCallback(() => { }, [])

    // make map of list item components
    const documentListItems = Object.fromEntries(
        documents.map(doc => {
            const Icon = DocumentTypes[doc.type]?.icon
            return [
                doc.id,
                <ExplorerListItem
                    documentId={doc.id}
                    icon={Icon && <Icon />}
                    showSource={documents.some(d => d.id != doc.id && d.name == doc.name && d.type == doc.type)}
                    key={doc.id}
                />
            ]
        })
    )

    return (
        <ExplorerAccordion
            // topMargin
            defaultValue={[]}
            key={Math.random()}     // this forces re-render and fixes accordion heights
            data={
                Object.values(FileTypes).map(fileType => {

                    const docTypes = fileType.containedDocumentTypes.map(docTypeId => {

                        const docType = DocumentTypes[docTypeId]

                        const docList = documents.filter(
                            doc => docTypeId == doc.type && alignsWithSearch(doc.name, searchQuery)
                        )
                            .map(doc => documentListItems[doc.id])

                        return {
                            id: docTypeId,
                            title: docType.listTitle,
                            titleInfo: docList.length,
                            content: <>
                            <CreateNewButton />
                            {docList}
                            </>,
                        }
                    })

                    // calculate number of items
                    const numItems = docTypes.reduce((sum, cur) => sum + cur.content.length, 0)

                    // see if it should be visible or not
                    const visible = numItems > 0 || !fileType.hideIfEmpty

                    return visible && {
                        id: fileType.id,
                        title: fileType.listTitle,
                        titleInfo: numItems,
                        content: docTypes.length == 1 ?
                            docTypes[0].content
                            :
                            <ExplorerAccordion
                                noBottomBorder
                                data={docTypes}
                            />
                    }
                })
                    .filter(item => !!item)
            }
        />
    )
}


function alignsWithSearch(item, query) {
    const terms = query.toLowerCase().split(/\s+/).filter(term => !!term)
    return !query || terms.some(term => item.toLowerCase().includes(term))
}