import produce from "immer"
import create from "zustand"
import { parseFile } from "../modules/documentParser"
import { findFilesInDirectory } from "../modules/fileSystem"
import { createActionsHook, createFromEntityTemplate } from "./entityTemplate"

export const useDocumentStore = create((set, get) => {
    const { actions: templateActions, ...template } = createFromEntityTemplate(set, get)

    return {
        ...template,
        actions: {
            ...templateActions,

            openDirectory: async directoryHandle => {
                // read directory to get file list
                const fileHandles = await findFilesInDirectory(directoryHandle)

                const documents = []
                const files = []

                // parse documents out of each file
                await Promise.all(fileHandles.map(async fileHandle => {
                    const file = await fileHandle.getFile()
                    const documentsInFile = await parseFile(await file.text(), file.name)

                    // add file with links to documents
                    files.push({
                        name: file.name,
                        handle: fileHandle,
                        documents: documentsInFile.map(doc => doc.id),
                        sbol: !!documentsInFile.sbol,
                    })

                    // add documents
                    documents.push(documentsInFile)
                }))

                // add documents to store
                get().actions.addMany(documents.flat())

                // add files to store
                get().setFiles(files)
            },

            addDocumentsToFile: (documentIds, fileName) => set(produce(draft => {
                const file = draft.files.find(file => file.name == fileName)
                documentIds.forEach(docId => !file.documents.includes(docId) && file.documents.push(docId))
            }))
        },
        files: [],
        setFiles: files => set(() => ({ files }))
    }
})

export const useDocumentActions = createActionsHook(useDocumentStore)
export const getDocumentState = useDocumentStore.getState