

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


export default {
    parseFile,
}