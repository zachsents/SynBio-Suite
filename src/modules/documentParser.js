import { parseStringPromise as parseXMLString, Builder as XMLBuilder } from "xml2js"
// const { parseStringPromise: parseXMLString, Builder: XMLBuilder } = require("xml2js")
import path from "path"


export async function parseFile(content, fileName) {
    
    // Analysis case
    if(path.extname(fileName) == ".analysis")
        return [{
            id: fileName,
            name: documentNameFromFileName(fileName),
            type: "synbio.doc-type.analysis",
            data: JSON.parse(content),
            entireFile: true,
            source: fileName,
        }]
    
    // XML case
    if([".xml", ".sbol", ".sbml", ".sedml"].includes(path.extname(fileName)))
        return await parseXMLFile(content, fileName)
    
    // TODO: implement OMEX case

    // default case -- all other files, return nothing
    return []
}

async function parseXMLFile(content, fileName) {

    // SBML case
    if(/<sbml.*>/.test(content))
        return await parseSBML(content, fileName)
    
    // SBOL case
    if(/<sbol.*>/.test(content))
        return await parseSBOL(content, fileName)

    // SedML case
    if(/<sedML.*>/.test(content))
        return await parseSedML(content, fileName)

    // default case
    return [{
        id: fileName,
        type: "xml",
        data: await parseXMLString(content),
        xml: content,
        entireFile: true,
        source: fileName,
    }]
}

const xmlBuilder = new XMLBuilder({
    headless: true
})

async function parseSBOL(sbolContent, fileName) {
    const { "rdf:RDF": doc } = await parseXMLString(sbolContent)
    const topLevelObjects = Object.keys(doc)
        .filter(key => key != "$")
        .map(key => doc[key].map(topLevelObj => ({
            id: `${fileName}/${topLevelObj.$["rdf:about"]}`,
            pid: topLevelObj.$["rdf:about"],
            name: topLevelObj["sbol:displayId"]?.[0],
            shortName: topLevelObj["dcterms:title"]?.[0].trim() || undefined,
            type: `synbio.doc-type.${key}`,
            data: topLevelObj,
            xml: xmlBuilder.buildObject({ [key]: topLevelObj }),
            entireFile: false,
            source: fileName,
        })))
        .flat()

    // find dependencies
    topLevelObjects.forEach(x => {
        x.dependencies = findSBOLDependencies(x.pid, topLevelObjects)
        // find dependencies that are also top level objects
        x.localDependencies = x.dependencies.map(dep => topLevelObjects.find(obj => obj.pid == dep)?.id).filter(dep => !!dep)
    })

    topLevelObjects.sbol = true
    return topLevelObjects
}

async function parseSedML(sedmlContent, fileName) {
    const doc = await parseXMLString(sedmlContent)

    return [{
        id: fileName,
        name: documentNameFromFileName(fileName),
        type: "synbio.doc-type.sedml",
        data: doc,
        xml: sedmlContent,
        entireFile: true,
        source: fileName,
        dependencies: findSedMLDependencies(doc)
    }]
}

async function parseSBML(sbmlContent, fileName) {
    const doc = await parseXMLString(sbmlContent)

    return doc.sbml.model.map(model => ({
        id: `${fileName}/${model.$.id}`,
        name: model.$.id,
        type: "synbio.doc-type.sbml",
        data: model,
        xml: sbmlContent,
        entireFile: false,
        source: fileName,
        dependencies: findSBMLDependencies(doc)
    }))
}

function findSBOLDependencies(subjectId, documents) {
    const subject = documents.find(doc => doc.pid == subjectId)
    return subject ? [...new Set([...subject.xml.matchAll(/rdf:resource="(.+?)"/g)]
        .map(match => match[1])
        .filter(dep => !subject.xml.includes(`rdf:about="${dep}"`))
        .map(dep => [
            dep,
            ...findSBOLDependencies(dep, documents.filter(doc => doc.pid != subjectId))
        ])
        .flat())] : []
}

function findSedMLDependencies(document) {
    return document.sedML?.listOfModels?.[0]?.model?.map(model => model.$.source) || []
}

function findSBMLDependencies(document) {
    return document.sbml?.["comp:listOfExternalModelDefinitions"]?.[0]?.["comp:externalModelDefinition"]
        ?.map(externalModule => externalModule.$["comp:source"]) || []
}

function documentNameFromFileName(fileName) {
    return fileName.replace(path.extname(fileName), "")
}

export function removeUnderscores(name) {
    return name?.replaceAll("_", " ") ?? ""
}