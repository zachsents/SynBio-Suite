import { useSelector, useDispatch } from 'react-redux'
import { activitySlice } from '../store'

const { actions } = activitySlice


// Selector hooks

/**
 * Hook that returns the current activities from the Redux store.
 *
 * @export
 * @return {*[]} 
 */
export function useActivities() {
    return /* activities */ useSelector(state => state.activities.states)
}

/**
 * Hook that allows a component to access and update the active 
 * activity in the Redux store.
 *
 * @export
 * @return {[*, Function]} 
 */
export function useActiveActivity() {

    const dispatch = useDispatch()

    return [
        /* activeActivity */ useSelector(state => state.activities.active),
        /* setActiveActivity */ newActive => dispatch(actions.setActive(newActive))
    ]
}

// Other exports

export {
    actions as activityActions
}