import { BiWorld } from "react-icons/bi"
import { IoAnalyticsSharp } from "react-icons/io5"
import { TbComponents, TbSquareRotated, TbDna, TbBoxModel2, TbCode } from "react-icons/tb"
import { FaShapes } from "react-icons/fa"


export const DocumentType = {
    Analysis: "analysis",
    SBOLComponentDefinition: "http://sbols.org/v2#ComponentDefinition",
    SBOLModuleDefinition: "http://sbols.org/v2#ModuleDefinition",
    // SBOLSequence: "http://sbols.org/v2#Sequence",
    SBML: "sbml",
    SedML: "sedml",
    OMEX: "omex",
}

export const FileType = {
    SBOL: "sbol",
    SBML: "sbml",
    SedML: "sedml",
    XML: "xml",
    Analysis: "analysis",
    OMEX: "omex",
}


export const DocumentTypes = Object.fromEntries(
    [
        {
            id: DocumentType.Analysis,
            title: "Analysis",
            listTitle: "Analyses",
            icon: IoAnalyticsSharp,
            createable: true,
            containingFileTypes: [
                FileType.Analysis
            ],
        },
        {
            id: DocumentType.SBOLComponentDefinition,
            title: "SBOL Component",
            listTitle: "Components",
            badgeLabel: "Component",
            icon: TbSquareRotated,
            createable: true,
            containingFileTypes: [
                FileType.SBOL
            ],
        },
        {
            id: DocumentType.SBOLModuleDefinition,
            title: "SBOL Module",
            listTitle: "Modules",
            badgeLabel: "Module",
            icon: TbComponents,
            createable: true,
            containingFileTypes: [
                FileType.SBOL
            ],
        },
        {
            id: DocumentType.SBML,
            title: "SBML Model",
            listTitle: "SBML Models",
            badgeLabel: "SBML",
            icon: TbBoxModel2,
            createable: false,
            containingFileTypes: [
                FileType.SBML
            ],
        },
        {
            id: DocumentType.SedML,
            title: "SedML File",
            listTitle: "SedML Files",
            badgeLabel: "SedML",
            icon: FaShapes,
            createable: false,
            containingFileTypes: [
                FileType.SedML
            ],
        },
        {
            id: DocumentType.OMEX,
            title: "OMEX Archive",
            listTitle: "OMEX Archives",
            badgeLabel: "OMEX",
            icon: BiWorld,
            createable: false,
            containingFileTypes: [
                FileType.OMEX
            ],
        },
    ]
    .map(item => [item.id, item])
)


export const FileTypes = Object.fromEntries(
    [
        {
            id: FileType.Analysis,
            title: "Analysis",
            listTitle: "Analyses",
            icon: IoAnalyticsSharp,
            extension: '.analysis',
            containedDocumentTypes: [
                DocumentType.Analysis
            ],
        },
        {
            id: FileType.SBOL,
            title: "SBOL File",
            listTitle: "SBOL Files",
            icon: TbComponents,
            extension: ".xml",
            containedDocumentTypes: [
                DocumentType.SBOLComponentDefinition, 
                DocumentType.SBOLModuleDefinition
            ],
        },
        {
            id: FileType.SBML,
            title: "SBML Model",
            listTitle: "SBML Models",
            icon: TbBoxModel2,
            extension: ".xml",
            containedDocumentTypes: [
                DocumentType.SBML,
            ],
        },
        {
            id: FileType.SedML,
            title: "SedML File",
            listTitle: "SedML Files",
            icon: FaShapes,
            extension: ".sedml",
            containedDocumentTypes: [
                DocumentType.SedML,
            ],
        },
        {
            id: FileType.OMEX,
            title: "OMEX Archive",
            listTitle: "OMEX Archives",
            icon: BiWorld,
            extension: ".omex",
            containedDocumentTypes: [
                DocumentType.OMEX,
            ],
        },
        {
            id: FileType.XML,
            title: "XML File",
            listTitle: "XML Files",
            icon: TbCode,
            extension: ".xml",
            containedDocumentTypes: [
            ],
        },
    ]
    .map(item => [item.id, item])
)


export function getDocumentType(id) {
    return DocumentTypes[id]
}

export function classifyFile(fileName) {
    return Object.values(DocumentTypes).find(
        ({ fileMatch }) => !!fileName?.match(fileMatch)
    )?.id
}