import { createEntityAdapter, createSlice } from "@reduxjs/toolkit"

/**
 * This code is creating a Redux slice for managing a "working directory" in the 
 * application's state. The createEntityAdapter function from the @reduxjs/toolkit 
 * library is used to create an adapter for the working directory state, which allows 
 * for easy management of entities (in this case, the files in the working directory). 
 * The initial state of the working directory is obtained using the getInitialState 
 * method from the adapter. The createSlice function is then used to create a slice 
 * of the Redux store for the working directory, with the initial state being the 
 * state obtained from the adapter. The slice has several reducers, such as addFile, 
 * addFiles, setFiles, removeFile and setWorkingDirectory that are used to add, remove, 
 * set, and set the directory handle of files in the state. The selectors field exports 
 * the selectors from the adapter, which can be used to access specific parts of the 
 * state. 
 */

const workDirAdapter = createEntityAdapter()
const initialState = workDirAdapter.getInitialState()

const workDirSlice = createSlice({
    name: 'workingDirectory',
    initialState,

    /**
     * addFile and addFiles are used to add one or multiple files respectively while
     * setFiles is used to set all files to a new state. removeFile is used to remove 
     * a single file from the working directory state. setWorkingDirectory is used to 
     * update the directory handle of working directory state.
     */
    reducers: {
        addFile: workDirAdapter.addOne,
        addFiles: workDirAdapter.addMany,
        setFiles: workDirAdapter.setAll,
        removeFile: workDirAdapter.removeOne,
        setWorkingDirectory: (state, action) => {
            state.directoryHandle = action.payload
        },
    }
})


export default {
    reducer: workDirSlice.reducer,
    actions: workDirSlice.actions,
    selectors: workDirAdapter.getSelectors(state => state.workingDirectory),
}