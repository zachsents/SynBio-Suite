

async function parseFile({ content, name }) {
    // construct params for serialization
    const params = new URLSearchParams()
    params.append("fileName", name)

    // construct URL
    const endpointUrl = `${import.meta.env.VITE_API_LOCATION}/parseFile?${params.toString()}`
    console.debug(`[API] Fetching ${endpointUrl}`)

    // make request
    const resp = await fetch(endpointUrl, {
        method: "post",
        body: content,
    })

    // parse response
    return await resp.json()
}


async function mergeSBOLFiles({ sourceFile, sourceContent, newFile, newContent }) {

    // create FormData object
    const formData = new FormData()

    // add files
    formData.append("source", sourceFile ?? new File([sourceContent], "source.xml"))
    formData.append("new", newFile ?? new File([newContent], "new.xml"))

    // construct URL
    const endpointUrl = `${import.meta.env.VITE_API_LOCATION}/mergeSBOLFiles`
    console.debug(`[API] Fetching ${endpointUrl}`)

    // make request
    const resp = await fetch(endpointUrl, {
        method: "post",
        body: formData,
    })

    // parse response
    return await resp.text()
}


export default {
    parseFile,
    mergeSBOLFiles,
}