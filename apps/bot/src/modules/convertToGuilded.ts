import { type Tokens, type TokensList } from "marked";

export const createHeading = (headingType: "heading-large" | "heading-small", text: string) => {
    return {
        object: "block",
        type: headingType,
        data: {},
        nodes: [
            {
                object: "text",
                leaves: [
                    {
                        object: "leaf",
                        text,
                        marks: []
                    }
                ]
            }
        ]
    }
}

export const createText = (text: string) => {
    return {
        object: "block",
        type: "paragraph",
        data: {},
        nodes: [
            {
                object: "text",
                leaves: [
                    {
                        object: "leaf",
                        text,
                        marks: []
                    }
                ]
            }
        ]
    }
}

export const convertToGuilded = (tokens: TokensList) => {
    const startingPoint = {
        title: "Announcement",
        content: {
            object: "value",
            document: {
                object: "document",
                data: {},
                nodes: [] as Array<object>
            }
        },
        teamId: "lPMPVgaE",
        gameId: null,
        dontSendNotifications: false
    }

    tokens.forEach((token) => {
        switch (token.type) {
            case "heading":
                if (token.depth === 1 && startingPoint.title !== "Announcement") {
                    startingPoint.title = token.text;
                } else {
                    startingPoint.content.document.nodes.push(createHeading(token.depth <= 2 ? "heading-large" : "heading-small", token.text))
                }
                break;
            default:
                if (token.type !== "space" && token.type !== "table" && token.type !== "hr" && token.type !== "list" && token.type !== "checkbox" && token.type !== "html" && token.type !== "def" && token.type !== "br") return;
                startingPoint.content.document.nodes.push(createText((token as Tokens.Text).text))
                break;
        }
    })
}