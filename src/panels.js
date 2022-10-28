import SBOLEditorPanel from "./components/panels/sbol-editor/SBOLEditorPanel";
import SimulatorPanel from "./components/panels/simulator/SimulatorPanel";
import { CanvasIcon, SimulationIcon } from "./icons";
import { DocumentTypes } from "./modules/documentTypes";


export const PanelTypes = {
    Simulator: {
        id: "synbio.panel-type.simulator",
        title: "iBioSim Analysis",
        component: SimulatorPanel,
        objectTypes: [ DocumentTypes.Analysis ],
        icon: SimulationIcon,

        deserialize: content => {
            try {
                return JSON.parse(content)
            }
            catch {
                return {}
            }
        },

        serialize: panel => {
            const { id, fileHandle, type, ...restOfPanel } = panel
            return JSON.stringify(restOfPanel)
        }
    },
    SBOLEditor: {
        id: "synbio.panel-type.sbol-editor",
        title: "SBOL Canvas",
        component: SBOLEditorPanel,
        objectTypes: [ DocumentTypes.SBOLComponentDefinition, DocumentTypes.SBOLModuleDefinition ],
        icon: CanvasIcon,

        deserialize: content => ({
            sbol: content
        }),

        serialize: panel => panel.sbol
    }
}

export function getPanelType(id) {
    return Object.values(PanelTypes).find(pt => pt.id == id)
}

export function getPanelTypeForDocument(docType) {
    return Object.values(PanelTypes).find(pt => pt.objectTypes.includes(docType))
}
