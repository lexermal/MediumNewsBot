import { URL } from "url";
import { SourceType } from "../entity/Source";

export function getSource(url: URL): [SourceType, string] {
    if (url.hostname !== "medium.com") {
        return [SourceType.DOMAIN, url.hostname];
    }

    const urlParts = url.pathname.split("/");
    if (url.pathname.startsWith("/tag/")) {
        return [SourceType.TAG, urlParts[2]];
    }

    if (url.pathname.startsWith("/@")) {
        return [SourceType.USER, urlParts[1].substr(1)];
    }

    return [SourceType.PUBLICATION, urlParts[1]];  // eg. /personal-growth
}