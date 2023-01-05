import formats from "@rdfjs/formats-common"
import produce from "immer"
import { Readable } from "readable-stream"
import { parseStringPromise, Builder as XMLBuilder } from "xml2js"


export async function parseSBOL(sbolContent, fileName) {

    // parse XML into object
    const parsedXml = await parseStringPromise(sbolContent)

    // create stream from SBOL content
    const inputStream = Readable.from([sbolContent])
    const output = formats.parsers.import("application/rdf+xml", inputStream)

    // read stream into array of RDF quads
    const quads = await new Promise((resolve) => {
        const quads = []
        output.on("data", quad => quads.push(quad))
        output.on("end", () => resolve(quads))
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
    const compDefs = rootCompDefIds.map(id => {

        // search for dependencies
        const dependencies = findDependencies(id, quads)

        return {
            id: `${fileName}/${id}`,
            uri: id,
            name: findSBOLProperty(id, "displayId", quads),
            shortName: findProperty(id, "http://purl.org/dc/terms/title", quads),
            type: "http://sbols.org/v2#ComponentDefinition",
            sourceFile: fileName,
            dependencies,
            snippet: buildDependencies(parsedXml, dependencies),
        }
    })

    // map MDs to document objects
    const modDefs = rootModDefIds.map(id => {

        // search for dependencies
        const dependencies = findDependencies(id, quads)

        return {
            id: `${fileName}/${id}`,
            uri: id,
            name: findSBOLProperty(id, "displayId", quads),
            shortName: findProperty(id, "http://purl.org/dc/terms/title", quads),
            type: "http://sbols.org/v2#ModuleDefinition",
            sourceFile: fileName,
            dependencies,
            snippet: buildDependencies(parsedXml, dependencies),
        }
    })

    // WILO: figuring out how to serialize only the SBOL content we need

    return {
        fileType: "sbol",
        documents: [...compDefs, ...modDefs],
    }
}


// These are predicates where the subject should be a dependency of the object
// (rather than vice versa)
const reverseDependencyPredicates = [
    "https://sbolcanvas.org/objectRef",
]


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

    // look for reverse dependencies
    const reverseDeps = quads.filter(quad =>
        // filter by reverse predicates
        reverseDependencyPredicates.includes(quad.predicate.value) && 

        // find quads with our object
        quad.object.value == uri &&

        // filter out ones we already have
        !existing.includes(quad.subject.value)
    )

    // add them to existing array
    reverseDeps.forEach(quad => existing.push(quad.subject.value))

    // recurse
    newDeps.forEach(quad => findDependencies(quad.object.value, quads, existing))
    reverseDeps.forEach(quad => findDependencies(quad.subject.value, quads, existing))

    return existing
}


function buildDependencies(parsedXmlObject, dependencies) {
    const xmlBuilder = new XMLBuilder()

    const filteredDocument = produce(parsedXmlObject, draft => {
        const rdf = draft["rdf:RDF"]

        Object.keys(rdf)
            .filter(key => key != "$")
            .forEach(key => {
                rdf[key] = rdf[key].filter(
                    item => dependencies.includes(item.$["rdf:about"])
                )
            })
    })

    return xmlBuilder.buildObject(filteredDocument)
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