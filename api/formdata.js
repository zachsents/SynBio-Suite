import busboy from "busboy"


export function parseFormDataBody(req) {

    return new Promise((resolve, reject) => {

        const result = {}

        // setup BusBoy to parse FormData
        const bb = busboy({ headers: req.headers })

        // listen for files
        bb.on("file", (fieldName, file) => {
            const buffers = []

            file.on("data", data => {
                buffers.push(data)
            })
            
            file.on("end", () => {
                result[fieldName] = Buffer.concat(buffers).toString()
            })
        })

        // listen for string fields
        bb.on("field", (fieldName, val) => {
            result[fieldName] = val
        })

        // listen for stream finish
        bb.on("finish", () => {
            resolve(result)
        })

        // handle errors
        bb.on("error", err => {
            reject(err)
        })

        // write body into busboy stream
        bb.write(req.body)
        bb.end()
    })
}