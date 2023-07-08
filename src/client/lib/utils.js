export const isDefined = (value) => {
    return value!==undefined && value !== null && value !=='';
}

export const NoopFunction = () => {};