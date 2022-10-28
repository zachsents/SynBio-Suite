import { BiWorld } from "react-icons/bi"
import { IoAnalyticsSharp } from "react-icons/io5"
import { TbComponents, TbSquareRotated, TbDna, TbBoxModel2 } from "react-icons/tb"
import { FaShapes } from "react-icons/fa"

export const DocumentTypes = {
    "synbio.doc-type.analysis": {
        id: "synbio.doc-type.analysis",
        title: "Analysis",
        listTitle: "Analyses",
        icon: IoAnalyticsSharp,
        createable: true,
        extension: '.analysis',
    },
    "synbio.doc-type.sbol:ComponentDefinition": {
        id: "synbio.doc-type.sbol:ComponentDefinition",
        title: "SBOL Component",
        listTitle: "SBOL Components",
        icon: TbSquareRotated,
        createable: true,
        extension: '.sbol',
        badgeLabel: "Component",
        sbol: true,
    },
    "synbio.doc-type.sbol:ModuleDefinition": {
        id: "synbio.doc-type.sbol:ModuleDefinition",
        title: "SBOL Module",
        listTitle: "SBOL Modules",
        icon: TbComponents,
        createable: true,
        badgeLabel: "Module",
        sbol: true,
    },
    "synbio.doc-type.sbol:Sequence": {
        id: "synbio.doc-type.sbol:Sequence",
        title: "SBOL Sequence",
        listTitle: "SBOL Sequences",
        icon: TbDna,
        createable: false,
        badgeLabel: "Sequence",
        sbol: true,
    },
    "synbio.doc-type.sbml": {
        id: "synbio.doc-type.sbml",
        title: "SBML Model",
        listTitle: "SBML Models",
        icon: TbBoxModel2,
        createable: false,
        badgeLabel: "SBML",
    },
    "synbio.doc-type.sedml": {
        id: "synbio.doc-type.sedml",
        title: "SedML File",
        listTitle: "SedML Files",
        icon: FaShapes,
        createable: false,
        badgeLabel: "SedML",
    },
    "synbio.doc-type.omex-archive": {
        id: "synbio.doc-type.omex-archive",
        title: "OMEX Archive",
        listTitle: "OMEX Archives",
        icon: BiWorld,
        createable: false,
        badgeLabel: "OMEX",
    },
}

// add aliases
Object.defineProperties(DocumentTypes, {
    Analysis: {
        value: "synbio.doc-type.analysis"
    },
    SBOLComponentDefinition: {
        value: "synbio.doc-type.sbol:ComponentDefinition"
    },
    SBOLModuleDefinition: {
        value: "synbio.doc-type.sbol:ModuleDefinition"
    },
    SBOLSequence: {
        value: "synbio.doc-type.sbol:Sequence"
    },
    SBML: {
        value: "synbio.doc-type.sbml"
    },
    SedML: {
        value: "synbio.doc-type.sedml"
    },
    OMEX: {
        value: "synbio.doc-type.omex-archive"
    },
})

export function getDocumentType(id) {
    return DocumentTypes[id]
}

export function classifyFile(fileName) {
    return Object.values(DocumentTypes).find(
        ({ fileMatch }) => !!fileName?.match(fileMatch)
    )?.id
}