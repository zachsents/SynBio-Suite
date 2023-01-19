import produce from "immer"
import create from "zustand"
import shallow from "zustand/shallow"
import api from "../api"
import { findFilesInDirectory } from "../fileSystem"
import { createActionsHook, createFromEntityTemplate } from "./entityTemplate"
import { getPanelState } from "./panelStore"


export const useDocumentStore = create((set, get) => {

    return {
        documents: createFromEntityTemplate(
            setter => set(state => ({
                documents: {
                    ...state.documents,
                    ...setter(state.documents)
                }
            })),
            () => get().documents
        ),

        openDirectory: async directoryHandle => {
            // read directory to get file list
            const fileHandles = await findFilesInDirectory(directoryHandle)

            const documents = []
            const files = []

            // parse documents out of each file in parallel
            await Promise.all(
                fileHandles.map(async fileHandle => {
                    const file = await fileHandle.getFile()

                    // parse file using API
                    const { fileType, documents: documentsInFile } = await api.parseFile({
                        content: await file.text(),
                        name: file.name,
                    })

                    // add file with links to documents
                    files.push({
                        name: file.name,
                        handle: fileHandle,
                        type: fileType,
                        documents: documentsInFile.map(doc => doc.id),
                    })

                    // add documents
                    documents.push(documentsInFile)
                })
            )

            // add documents to store
            get().documents.actions.setAll(documents.flat())

            // add files to store
            get().setFiles(files)
        },

        workingDirectory: null,
        setWorkingDirectory: newWorkDir => set({ workingDirectory: newWorkDir }),

        files: [],
        setFiles: files => set(() => ({ files })),
        addDocumentsToFile: (documentIds, fileName) => set(produce(draft => {
            const file = draft.files.find(file => file.name == fileName)
            documentIds.forEach(docId => !file.documents.includes(docId) && file.documents.push(docId))
        })),

        updateFile: async (fileName, newContent) => {
            const oldDocs = Object.values(get().documents.entities).filter(doc => doc.sourceFile == fileName)

            // parse new file content to get new list of documents
            const { documents: newDocs } = await api.parseFile({
                content: newContent,
                name: fileName,
            })

            set(produce(draft => {
                // update document list for file
                draft.files.find(file => file.name == fileName).documents = newDocs.map(doc => doc.id)

                // remove old documents
                const oldDocIds = oldDocs.map(doc => doc.id)
                oldDocIds.forEach(docId => {
                    delete draft.documents.entities[docId]
                })
                draft.documents.ids = draft.documents.ids.filter(id => !oldDocIds.includes(id))

                // add new documents
                newDocs.forEach(doc => {
                    draft.documents.ids.push(doc.id)
                    draft.documents.entities[doc.id] = doc
                })
            }))
        },

        deleteFile: async fileName => {
            // delete actual file
            await get().workingDirectory.removeEntry(fileName)

            // figure out which documents to remove
            const docsToRemove = Object.values(get().documents.entities)
                .filter(doc => doc.sourceFile == fileName)
                .map(doc => doc.id)

            // close panels
            docsToRemove.forEach(docId => getPanelState().actions.closePanelForDocument(docId))
            
            // remove associated documents
            get().documents.actions.removeMany(docsToRemove)

            // remove file
            set(s => ({
                files: s.files.filter(file => file.name != fileName)
            }))
        },
    }
})

export const useDocumentActions = createActionsHook(useDocumentStore, s => s.documents)
export const getDocumentStoreState = useDocumentStore.getState


export function usePartialDocuments(keys = []) {
    return useDocumentStore(
        // selector
        s => s.documents.ids.map(
            id => ({
                id,
                ...Object.fromEntries(
                    keys.map(key => [key, s.documents.entities[id][key]])
                ),
            })
        ),
        // comparison function
        (oldList, newList) => {
            return Object.keys(newList[0] ?? {}).every(
                key => shallow(
                    oldList.map(doc => doc[key]),
                    newList.map(doc => doc[key])
                )
            )
        }
    )
}


export function useDocument(id, selector, equality) {
    return useDocumentStore(s => {
        const doc = s.documents.entities[id]
        return selector?.(doc) ?? doc
    }, equality)
}


export function getFileByName(fileName) {
    return getDocumentStoreState().files.find(file => file.name == fileName)
}