import type { SsrRequestData } from '#paon/template-server/data-models/ssr-request-data'
import HtmlDocument from '#paon/utils/html-parsing'


type headAssemblingKwargs_T = {
    renderingMode: 'CSR',
    requestData?: undefined,
    renderedMetas?: undefined
} | {
    renderingMode: 'SSR',
    requestData: SsrRequestData,
    renderedMetas: string
}

type bodyAssemblingKwargs_T = {
    placeholder: string,
    renderedApp: string
}

/** Extract the content of `<head>` and `<body>` "fragments" from the given html document */
class TemplateFragments {
    #filePath: string

    #head: string
    #body: string
    
    /**
     * @param baseHtmlFile (string) the html document to extract the `<head>` and `<body>` fragments
     * 
     * @param filePath (string) path of the html file (for logging)
    */
    constructor(baseHtmlFile: string, filePath: string) {
        this.#filePath = filePath

        const document = new HtmlDocument(baseHtmlFile)

        const head = document.selectElement({ 
            query: {tagName: 'head'}
        })
        const body = document.selectElement({
            query: {tagName: 'body'}}
        )

        if (!head) this.#throwParsingError('failed to find <head> tag')
        if (!body) this.#throwParsingError('failed to find <body> tag')
        
        this.#head = HtmlDocument.renderHtmlContent(head)
        this.#body = HtmlDocument.renderHtmlContent(body)
    }

    /** Renders the `<head>` fragment of the document.
     * 
     * Extracts the original `<head>` content and appends
     * request-specific tags before returning the final HTML string:
     *  - Injects the "rendering-mode" meta (CSR / SSR)
     *  - For SSR : injects the initial page props as json tag
     * - For SSR : injects optionnal head fragment returned by the rendering function (`MetaHat`)
     * 
     * @param kwargs.renderingMode - "CSR" or "SSR" for the "rendering-mode" meta
     * 
     * @param kwargs.requestData (Only SSR) SsrRequestData instance for the initial page props json 
     * 
     * @param kwargs.renderedMetas (Only SSR) - optionnal head fragment returned by the rendering function (`MetaHat`)
    */
    assembleHeadFragment(kwargs: headAssemblingKwargs_T) {
        const {
            renderingMode,
            requestData,
            renderedMetas = ''
        } = kwargs

        if (renderingMode === 'CSR') return this.#head
            + this.#getRenderingModeTag(renderingMode)

        return this.#head
            + this.#getRenderingModeTag(renderingMode)
            + requestData.getInitialPagePropsAsJsonTag()
            + renderedMetas
    }

    /** Renders the `<body>` fragment of the document.
     * 
     * - For SSR : replaces the placeholder  by the rendered App
     * - For CSR : removes the placeholder (no rendered App)
     * 
     * @param kwargs.placeholder (string) the placeholder string in the document that should be replaced by the rendered App
     * 
     * @param kwargs.renderedApp (string) (Only SSR) rendered html app
    */
    assembleBodyFragment(kwargs:bodyAssemblingKwargs_T) {
        const {
            placeholder,
            renderedApp
        } = kwargs

        return this.#body
            .replace(placeholder, renderedApp)
    }

    /** Renders the "rendering-mode" meta */
    #getRenderingModeTag( renderingMode: 'CSR' | 'SSR' ) {
        return `<meta name="rendering-mode" content="${renderingMode}">`
    }

    /** Shortcut to throw an error because the document parsing has failed */
    #throwParsingError(reason: string): never {

        let message = 'TemplateFragments instance failed to parse index.html document '
        message += `at ${this.#filePath} : ${reason}`

        throw new Error(message)
    }
}

export default TemplateFragments
export type { TemplateFragments }
