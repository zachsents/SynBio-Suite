import create from "zustand"
import { getPanelTypeForDocument } from "../panels"
import { getDocumentState } from "./documentStore"
import { createActionsHook, createFromEntityTemplate } from "./entityTemplate"
import produce from "immer"
import { showNotification } from "@mantine/notifications"

export const usePanelStore = create((set, get) => {
    const { actions: templateActions, ...template } = createFromEntityTemplate(set, get)

    return {
        ...template,
        active: null,
        actions: {
            ...templateActions,

            setActive: panelId => set(() => ({ active: panelId })),

            open: documentId => {

                // look up document in store
                const document = getDocumentState().find(documentId)

                // grab panel type for whatever
                const panelTypeDef = getPanelTypeForDocument(document.type)

                // show error notification if there's no panel type
                if (!panelTypeDef) {
                    showNotification({
                        message: `There is no editor associated with this file type.`,
                        color: "red"
                    })
                    return
                }

                // add panel
                const panelId = get().actions.addOne({
                    type: panelTypeDef.id,
                    document: documentId,
                })

                // make new panel active
                get().actions.setActive(panelId)
            },

            close: panelId => {
                // remove panel
                get().actions.removeOne(panelId)

                // change active panel if this one was active
                get().active == panelId && get().actions.setActive(get().ids[0])
            },

            closeAll: () => {
                // remove all panels
                get().actions.removeAll()

                // set active panel to null
                get().actions.setActive(null)
            },

            reorder: (from, to) => set(state => produce(state, draft =>
                draft.ids.splice(
                    to, 0, draft.ids.splice(from, 1)[0]
                )
            )),
        }
    }
})

export const usePanelActions = createActionsHook(usePanelStore)
export const getPanelState = usePanelStore.getState