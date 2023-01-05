import create from "zustand"
import shallow from "zustand/shallow"
import api from "../api"
import { findFilesInDirectory } from "../fileSystem"
import { createActionsHook, createFromEntityTemplate } from "./entityTemplate"


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
            get().documents.actions.addMany(documents.flat())

            // add files to store
            get().setFiles(files)
        },

        // ...template,
        // actions: {
        //     ...templateActions,



        //     addDocumentsToFile: (documentIds, fileName) => set(produce(draft => {
        //         const file = draft.files.find(file => file.name == fileName)
        //         documentIds.forEach(docId => !file.documents.includes(docId) && file.documents.push(docId))
        //     }))
        // },
        files: [],
        setFiles: files => set(() => ({ files }))
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


export function useDocument(id) {
    return useDocumentStore(s => s.documents.entities[id])
}


export function getFileByName(fileName) {
    return getDocumentStoreState().files.find(file => file.name == fileName)
}