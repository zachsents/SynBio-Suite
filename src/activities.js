import ExplorerActivityView from "./components/activities/explorer/ExplorerActivityView"
import BugReportView from "./components/activities/explorer/BugReportView"
import BuildActivityView from "./components/activities/explorer/BuildActivityView";
import GitHubView from "./components/activities/explorer/GitHubView";
import { FileIcon, RemoteControlIcon, BugReport } from "./icons"
import { RiGithubFill } from "react-icons/ri";
import { GiThorHammer} from "react-icons/gi";




export const Activities = {
    LocalFileExplorer: {
        id: "synbio.activity.local-file-explorer",
        title: "Local Explorer",
        component: ExplorerActivityView,
        icon: FileIcon
    },
    Build: {
        id: "synbio.activity.build",
        title: "Build Plan",
        component: BuildActivityView,
        icon: GiThorHammer,
    },
    // RemoteFileExplorer: {
    //     id: "synbio.activity.remote-file-explorer",
    //     title: "Remote Explorer",
    //     component: ExplorerActivityView,
    //     icon: RemoteControlIcon
    // },

    // Any activities below will be pushed to the bottom of the toolbar
    GitHub: {
        id: "synbio.activity.GitHub",
        title: "GitHub and Website ",
        component: GitHubView,
        icon: RiGithubFill,
        mt: 'auto'
    },

    BugReport: {
        id: "synbio.activity.bug-report",
        title: "Report Bug",
        component: BugReportView,
        icon: BugReport,   
    },
}
export function getActivity(id) {
    return Object.values(Activities).find(act => act.id == id)
}