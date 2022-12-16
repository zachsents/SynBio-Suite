import { createEntityAdapter } from "@reduxjs/toolkit"
import { generateId } from "../randomIds"
import shallow from 'zustand/shallow'
import produce from "immer"
import _ from "lodash"


export function createFromEntityTemplate(set, get) {
    const adapter = createEntityAdapter()

    return {
        ...adapter.getInitialState(),
        // ^ ids: [], entites: {}

        // some selectors that we want at the top level
        find: id => get().entities[id],

        /*
            Nesting actions inside an object makes it easy to select all of them
            at once, which doesn't hinder performance because this branch never changes.
        */
        actions: {
            // adding
            addOne: entity => {
                const entityWithId = ensureEntityHasId(entity)      // auto-generate an ID if the passed entity doesn't have one
                set(state => adapter.addOne(state, entityWithId))   // add the fixed entity to the store 
                return entityWithId.id    // return id so we can use it later
            },
            addMany: entities => set(state => adapter.addMany(state, entities)),

            // setting -- add or replace
            setOne: entity => set(state => adapter.setOne(state, entity)),
            setMany: entities => set(state => adapter.setMany(state, entities)),
            setAll: entities => set(state => adapter.setAll(state, entities)),

            // removing
            removeOne: id => set(state => adapter.removeOne(state, id)),
            removeMany: ids => set(state => adapter.removeMany(state, ids)),
            removeAll: () => set(state => adapter.removeAll(state)),

            // updating
            updateOne: (id, changes) => set(state => adapter.updateOne(state, { id, changes })),
            updateMany: (ids, changes) => set(state => adapter.updateMany(state, ids.map((id, i) => ({ id, changes: changes[i] })))),

            // upserting -- add or update
            upsertOne: entity => set(state => adapter.upsertOne(state, entity)),
            upsertMany: entities => set(state => adapter.upsertMany(state, entities)),

            // deep setting properties
            deepSet: (id, path, value) => get().actions.setOne(
                produce(
                    get().entities[id],
                    draft => _.set(draft, path, value)
                )
            )
        }
    }
}

export function createActionsHook(useStore, selector) {
    return () => useStore(        
        s => (selector?.(s) ?? s).actions
    )
}

function ensureEntityHasId(entity) {
    return entity.id ? entity : {
        ...entity,
        id: generateId()
    }
}

export function objectListCompare(oldList, newList) {
    return shallow(
        oldList.map(doc => doc.id),
        newList.map(doc => doc.id)
    )
}