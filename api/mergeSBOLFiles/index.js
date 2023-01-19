import produce from "immer"
import { parseStringPromise, Builder as XMLBuilder } from "xml2js"
import { parseFormDataBody } from "../formdata.js"

export async function run(context, req) {

    // parse FormData from request body
    const { source: sourceContent, old: oldContent, new: newContent } = await parseFormDataBody(req)

    // parse XML
    const sourceParsed = await parseStringPromise(sourceContent)
    // const oldSnippetParsed = await parseStringPromise(oldContent)
    const newSnippetParsed = await parseStringPromise(newContent)

    // produce new document
    const newDocument = produce(sourceParsed, draft => {

        // upsert all top-levels from new snippet
        iterateTopLevels(
            getRDF(newSnippetParsed),
            (topLevel, key) => {
                // remove any entries matching ID
                removeTopLevelsWithId(
                    getRDF(draft),
                    getId(topLevel)
                )

                // insert new entry
                getRDF(draft)[key].push(topLevel)
            }
        )

        // TO DO: prune removed top-levels
        // We need to find items that existed but weren't previously roots, but now are.
        // Alternatively, we could just prune any roots that don't have local URIs.
    })

    // serialize new document
    const xmlBuilder = new XMLBuilder()
    const newDocumentContent = xmlBuilder.buildObject(newDocument)

    context.res = {
        body: newDocumentContent
    }
}


function removeTopLevelsWithId(rdf, id) {
    Object.keys(rdf)
        .filter(key => key != "$")
        .forEach(key => {
            rdf[key] = rdf[key].filter(topLevel => getId(topLevel) != id)
        })
}


function iterateTopLevels(rdf, iterator) {
    Object.keys(rdf)
        .filter(key => key != "$")
        .forEach(key => {
            rdf[key].forEach(
                (topLevel, i, arr) => iterator(topLevel, key, i, arr)   // call with key as well
            )
        })
}

function getRDF(parsedXml) {
    return parsedXml["rdf:RDF"]
}

function getId(topLevel) {
    return topLevel.$["rdf:about"]
}