import formats from '@rdfjs/formats-common'
import { Readable } from 'readable-stream'


export async function parseSBOL(sbolContent, fileName) {

    // create stream from SBOL content
    const inputStream = Readable.from([sbolContent])
    const output = formats.parsers.import("application/rdf+xml", inputStream)

    // wait until stream is finished
    const quads = []
    await new Promise((resolve) => {
        output.on("data", quad => quads.push(quad))
        output.on("end", () => resolve())
    })


    // get ModuleDefinitions
    const modDefIds = quads
        .filter(quad => quad.object.value == "http://sbols.org/v2#ModuleDefinition")
        .map(quad => quad.subject.value)

    // get root MDs
    const rootModDefIds = filterRoots(modDefIds, quads)

    // get ComponentDefinitions
    const compDefIds = quads
        .filter(quad => quad.object.value == "http://sbols.org/v2#ComponentDefinition")
        .map(quad => quad.subject.value)

    // get root CDs
    const rootCompDefIds = filterRoots(compDefIds, quads)

    console.log(`Component Definitions: ${compDefIds.length} total, ${rootCompDefIds.length} root`)
    console.log(`Module Definitions: ${modDefIds.length} total, ${rootModDefIds.length} root`)

    // map CDs to document objects
    const compDefs = rootCompDefIds.map(id => ({
        id: `${fileName}/${id}`,
        uri: id,
        name: findSBOLProperty(id, "displayId", quads),
        shortName: findProperty(id, "http://purl.org/dc/terms/title", quads),
        type: "http://sbols.org/v2#ComponentDefinition",
        sourceFile: fileName,
        dependencies: findDependencies(id, quads),
    }))
    
    // map MDs to document objects
    const modDefs = rootModDefIds.map(id => ({
        id: `${fileName}/${id}`,
        uri: id,
        name: findSBOLProperty(id, "displayId", quads),
        shortName: findProperty(id, "http://purl.org/dc/terms/title", quads),
        type: "http://sbols.org/v2#ModuleDefinition",
        sourceFile: fileName,
        dependencies: findDependencies(id, quads),
    }))

    return {
        fileType: "sbol",
        documents: [...compDefs, ...modDefs],
    }
}


/**
 * Recursively finds dependencies for a given URI.
 *
 * @param {string} uri
 * @param {import('@rdfjs/types').Quad[]} quads
 * @param {string[]} [existing=[]] Existing dependencies
 * @return {string[]} 
 */
function findDependencies(uri, quads, existing = []) {
    const newDeps = quads.filter(quad => 
        // find quads with our subject
        quad.subject.value == uri &&

        // filter out ones we already have
        !existing.includes(quad.object.value) &&

        // only get ones that have a type
        quads.find(q => q.subject.value == quad.object.value && q.predicate.value == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
    )

    // add them to existing array
    newDeps.forEach(quad => existing.push(quad.object.value))

    // recurse
    newDeps.forEach(quad => findDependencies(quad.object.value, quads, existing))

    return existing
}


/**
 * Finds an SBOL property for a URI in the graph.
 *
 * @param {string} uri
 * @param {string} property
 * @param {import('@rdfjs/types').Quad[]} quads
 * @return {string} 
 */
function findSBOLProperty(uri, property, quads) {
    return findProperty(uri, `http://sbols.org/v2#${property}`, quads)
}


/**
 * Finds a property for a URI given the predicate in the graph.
 *
 * @param {string} uri
 * @param {string} predicate
 * @param {import('@rdfjs/types').Quad[]} quads
 * @return {string} 
 */
function findProperty(uri, predicate, quads) {
    return quads.find(quad => quad.subject.value == uri && quad.predicate.value == predicate)?.object.value
}


/**
 * Filters a list of URIs by which ones are roots; that is, ones that are not referenced
 * by any other objects (with the exception of a few blacklisted ones).
 *
 * @param {string[]} ids
 * @param {import('@rdfjs/types').Quad[]} quads
 * @return {string[]} 
 */
function filterRoots(ids, quads) {

    const excludedPredicates = [
        "http://sbols.org/v2#persistentIdentity",
        "https://sbolcanvas.org/objectRef",
    ]

    return ids.filter(
        id => !quads
            .filter(quad => !excludedPredicates.includes(quad.predicate.value))
            .find(quad => quad.object.value == id)
    )
}