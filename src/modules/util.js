

export function titleFromRunFileName(fileName) {
    let title = fileName
        .replace(".tsd", "")
        .replace("-", " ")

    title = title.slice(0, 1).toUpperCase() +
        title.slice(1)

    return title
}

export function deepSelect(obj, path) {
    return (typeof path === "string" ? path.split(".") : path)
        .reduce((accum, key) => accum?.[key], obj)
}

export function deepAssign(obj, path, value) {
    const shortPath = typeof path === "string" ? path.split(".") : [...path]
    const lastKey = shortPath.pop()
    deepSelect(obj, shortPath)[lastKey] = value
}

export function betterMax(arr) {
    if (arr.length)
        return arr.reduce((accum, current) => current > accum ? current : accum, arr[0])
}