

async function parseFile({ content, name }) {
    const params = new URLSearchParams()
    params.append("fileName", name)

    const resp = await fetch(`${import.meta.env.VITE_API_LOCATION}/parseFile?${params.toString()}`, {
        method: "post",
        body: content,
    })

    return await resp.json()
}


export default {
    parseFile,
}