import { createEntityAdapter, createSlice } from "@reduxjs/toolkit"

/**
 * This module is creating a Redux slice for managing "panels" in the application's state.
 * The createEntityAdapter function from the @reduxjs/toolkit library is used to create
 * an adapter for the panels state, which allows for easy management of entities (in this
 * case, the panels). The initial state of the panels is obtained using the
 * getInitialState method from the adapter. The createSlice function is then used to
 * create a slice of the Redux store for the panels, with the initial state being the
 * state obtained from the adapter. The slice has several reducers, such as openPanel,
 * closePanel, setActive, closeAll, and updateOne, that are used to add, remove, update,
 * and reorder panels in the state. The selectors field exports the selectors from the
 * adapter, which can be used to access specific parts of the state.
 */

const panelsAdapter = createEntityAdapter()
const initialState = panelsAdapter.getInitialState()

const panelsSlice = createSlice({
    name: 'panels',
    initialState,
    reducers: {
        openPanel: (state, action) => {
            panelsAdapter.addOne(state, action.payload)
            state.active = action.payload.id
        },
        closePanel: (state, action) => {
            panelsAdapter.removeOne(state, action.payload)
            if (state.active == action.payload)
                state.active = state.ids[0]
        },
        setActive: (state, action) => {
            state.active = action.payload
        },
        closeAll: panelsAdapter.removeAll,
        updateOne: panelsAdapter.updateOne,
        reoder: (state, action) => {
            const { from, to } = action.payload
            state.ids.splice(
                to, 0, state.ids.splice(from, 1)[0]
            )
        }
    }
})


export default {
    reducer: panelsSlice.reducer,
    actions: panelsSlice.actions,
    selectors: panelsAdapter.getSelectors(state => state.panels),
}