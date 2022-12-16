import { parseStringPromise as parseXMLString, Builder as XMLBuilder } from "xml2js"
import { parseSBOL } from "./sbol.js"
import path from "path"


export async function run(context, req) {
    try {
        context.res = {
            body: await parseFile(req.body, req.query.fileName)
        }
    }
    catch (err) {
        console.log("Encountered an error parsing", req.query.fileName)
        console.error(err)
    }
}


export async function parseFile(content, fileName) {

    console.log("Parsing", fileName)

    // Analysis case
    if (path.extname(fileName) == ".analysis")
        return {
            fileType: "analysis",
            documents: [{
                id: fileName,
                name: documentNameFromFileName(fileName),
                type: "analysis",
                data: content,
                entireFile: true,
                sourceFile: fileName,
            }]
        }

    // XML case
    if ([".xml", ".sbol", ".sbml", ".sedml"].includes(path.extname(fileName)))
        return await parseXMLFile(content, fileName)

    // TODO: implement OMEX case

    console.log("Done.\n")

    // default case -- all other files, return nothing
    return {
        fileType: null,
        documents: [],
    }
}


async function parseXMLFile(content, fileName) {

    // SBML case
    if (/<sbml.*>/.test(content))
        return await parseSBML(content, fileName)

    // SBOL case
    if (/<sbol.*>/.test(content))
        return await parseSBOL(content, fileName)

    // SedML case
    if (/<sedML.*>/.test(content))
        return await parseSedML(content, fileName)

    // default case
    return {
        fileType: "xml",
        documents: [{
            id: fileName,
            name: documentNameFromFileName(fileName),
            type: "xml",
            data: await parseXMLString(content),
            xml: content,
            entireFile: true,
            sourceFile: fileName,
        }],
    }
}


async function parseSedML(sedmlContent, fileName) {
    const doc = await parseXMLString(sedmlContent)

    return {
        fileType: "sedml",
        documents: [{
            id: fileName,
            name: documentNameFromFileName(fileName),
            type: "sedml",
            data: doc,
            entireFile: true,
            sourceFile: fileName,
            dependencies: findSedMLDependencies(doc)
        }],
    }
}

async function parseSBML(sbmlContent, fileName) {
    const doc = await parseXMLString(sbmlContent)

    return {
        fileType: "sbml",
        documents: doc.sbml.model.map(model => ({
            id: `${fileName}/${model.$.id}`,
            name: model.$.id,
            type: "sbml",
            data: model,
            entireFile: false,
            sourceFile: fileName,
            dependencies: findSBMLDependencies(doc)
        })),
    }
}


function findSedMLDependencies(document) {
    return document.sedML?.listOfModels?.[0]?.model?.map(model => model.$.source) || []
}

function findSBMLDependencies(document) {
    return document.sbml?.["comp:listOfExternalModelDefinitions"]?.[0]?.["comp:externalModelDefinition"]
        ?.map(externalModule => externalModule.$["comp:source"]) || []
}

export function documentNameFromFileName(fileName) {
    return fileName.replace(path.extname(fileName), "")
}