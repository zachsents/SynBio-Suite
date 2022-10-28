

export async function findFilesInDirectory(dirHandle) {
    const files = []

    // loop through async iterator of file names (called keys here)
    for await (const handle of dirHandle.values()) {
        if (handle.kind == 'file') {
            // addFileMetadata(handle)
            files.push(handle)
        }
    }

    return files
}

// function addFileMetadata(handle) {
//     // handle.id = uuidv4()
//     // handle.id = handle.name
//     // handle.objectType = classifyFile(handle.name)
// }