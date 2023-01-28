import { createSlice } from "@reduxjs/toolkit"
import { Activities } from "../../activities"

/**
 * This module is creating a Redux slice for managing "activities" in the application's 
 * state. The createSlice function is used to create a slice of the Redux store for the 
 * activities. The initial state is an object containing two properties: "states" and 
 * "active". The "states" property is an object whose keys are the ids of the activities 
 * and the values are the initial state objects of these activities. The initial state 
 * objects are obtained from the Activities object imported from the "../../activities" 
 * module. "active" property is set to the first key of initialActivities. The slice has 
 * a reducer, setActive, that is used to set the active activity. The setActive is used 
 * to set the active activity by updating the "active" property of the state with the 
 * payload of the action. The reducer and actions fields are exported and can be used 
 * to access the reducer and actions for this slice respectively.
 */

const initialActivities = Object.fromEntries(
    Object.values(Activities).map(act => ([ act.id, act.initialState || {} ]))
)

export const activitiesSlice = createSlice({
    name: 'activities',
    initialState: {
        states: initialActivities,
        active: Object.keys(initialActivities)[0]
    },
    reducers: {
        setActive: (state, action) => {
            state.active = action.payload
        },
    }
})


export default {
    reducer: activitiesSlice.reducer,
    actions: activitiesSlice.actions,
}