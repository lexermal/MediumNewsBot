export function convertTagToCheckableString(tag: string) {
    return tag
        .replaceAll(".", "_")
        .replaceAll("-", "_")
        .replaceAll("+", "")
        .replaceAll(" ", "+");
}

export function convertToReadableTag(tag: string) {
    return tag.replaceAll("+", " ");
}