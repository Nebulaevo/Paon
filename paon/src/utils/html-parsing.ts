import { isArray, isString } from 'sniffly'
import { 
    parse as parseHtml,
    parseFragment as parseHtmlFragment,
    serialize as serializeHtmlContent,
    type DefaultTreeAdapterTypes as HtmlNodeTypes
} from 'parse5'


type elementQuery_T = {
    tagName?: string,
    class?: string | string[],
    id?: string,
    hasAttr?: string | string[],
}

type elementSelectionKwargs_T = {
    query: elementQuery_T,
    exploreTemplateTags?: boolean
}

type BFSTraversalKwargs_T = {
    exploreTemplateTags: boolean
}

type AttributeList_T = HtmlNodeTypes.Element['attrs']

/** Parsed HTML document with tools to perform basic manipulations 
 * (built around the parse5 lib)
*/
class HtmlDocument {

    /** internal document tree (parsed with parse5) */
    #document: HtmlNodeTypes.Document

    /** Returns a meta tag as a string */
    static buildMetaTag(nameValue:string, contentValue:string): string {
        const documentFragment = parseHtmlFragment('<meta>')
        const metaTag = documentFragment.childNodes[0] as HtmlNodeTypes.Element
        metaTag.attrs = [
            { name: 'name', value: nameValue },
            { name: 'content', value: contentValue }
        ]

        return serializeHtmlContent(documentFragment)
    }

    /** Renders the inner content of the node to a string */
    static renderHtmlContent(node: HtmlNodeTypes.ParentNode): string {
        return serializeHtmlContent(node)
    }

    /** Adds the given content to the node's children 
     * 
     * @param node - (parse5 ParentNode) node we add content to
     * 
     * @param content - (parse5 ParentNode or string) the content we want to add, if string
    */
    static addContentToNode(node: HtmlNodeTypes.ParentNode, content: string | HtmlNodeTypes.ParentNode) {
        
        if (isString(content)){
            const documentFragment = parseHtmlFragment(content)
            node.childNodes.push(...documentFragment.childNodes)
        
        } else if (_isElement(content)) {
            node.childNodes.push(content)

        } else { // content is a document or document fragment
            node.childNodes.push(...content.childNodes)
        }
    }

    /** Replaces the node by the given content in the tree */
    static replaceNode(node: HtmlNodeTypes.ChildNode, content: string | HtmlNodeTypes.ParentNode) {
        const { parentNode } = node
        if (!parentNode) throw new Error(
            `Attempt to replace a node failed because it has no parent: ${node}`
        )
        
        const documentFragment = isString(content)
            ? parseHtmlFragment(content)
            : content

        // we build a new childNodes array where we replace
        // the desired node by the childNodes of the given
        // document fragment
        const updatedChildren = []
        for (const originalNode of parentNode.childNodes) {
            
            if (originalNode === node) {
                // we insert the new childNodes instead of the selected node
                for (const insertedNode of documentFragment.childNodes) {
                    updatedChildren.push(insertedNode)
                }
            } else {
                updatedChildren.push(originalNode)
            }
        }
        
        // we update the document tree with the new values
        node.parentNode = null // just to be sure
        parentNode.childNodes = updatedChildren
    }

    /**
     * @param document (string) the html document to parse
     */
    constructor(document: string) {
        this.#document = parseHtml(document)
    }

    /** Returns the first element found that matches the query (bfs traversal) or `undefined`
     * 
     * @param kwargs.exploreTemplateTags - (boolean) If true, `<template>` content is also expored
     * 
     * @param kwargs.query - object describing the desired elements (if query is empty we always return undefined)
     * 
     * - `query.tagName` (string) a tag name ('p', 'img'...)
     * - `query.class`  (string or list of strings) tag classes
     * - `query.id` (string) the tag id
     * - `query.hasAttr` (string or list of strings) attributes that should be defined on the tag ('src', 'style' ...)
    */
    selectElement(kwargs: elementSelectionKwargs_T) : HtmlNodeTypes.Element | undefined {
        
        const {
            query,
            exploreTemplateTags = false
        } = kwargs

        if (!this.#queryHasBeenDefined(query) ) return undefined

        const treeTraversalGen = this.#bfsTraversal({exploreTemplateTags})
        for (const node of treeTraversalGen) {
            if ( _isElement(node)
                && this.#satisfiesElmntQuery(node, query)
            ) return node
        }

        return undefined
    }

    /** Returns all the elements found that matches the query (bfs traversal)
     * 
     * @param kwargs.exploreTemplateTags - (boolean) If true, `<template>` content is also expored
     * 
     * @param kwargs.query - object describing the desired elements (if query is empty we always return undefined)
     * 
     * - `query.tagName` (string) a tag name ('p', 'img'...)
     * - `query.class`  (string or list of strings) tag classes
     * - `query.id` (string) the tag id
     * - `query.hasAttr` (string or list of strings) attributes that should be defined on the tag ('src', 'style' ...)
    */
    selectAllElements(kwargs: elementSelectionKwargs_T) : HtmlNodeTypes.Element[] {
        
        const {
            query,
            exploreTemplateTags = false
        } = kwargs

        if (!this.#queryHasBeenDefined(query) ) return []

        const results: HtmlNodeTypes.Element[] = []
        const treeTraversalGen = this.#bfsTraversal({exploreTemplateTags})
        for (const node of treeTraversalGen) {
            if ( _isElement(node)
                && this.#satisfiesElmntQuery(node, query)
            ) results.push(node)
        }

        return results
    }

    /** Serializes the current document to a HTML string */
    render(): string {
        return HtmlDocument.renderHtmlContent(this.#document)
    }

    /** Generator performing a BFS tree traversal on the document returning each node */
    * #bfsTraversal(kwargs: BFSTraversalKwargs_T) {
        const {
            exploreTemplateTags,
        } = kwargs

        const exploreQueu: HtmlNodeTypes.ChildNode[] = [...this.#document.childNodes]

        while (exploreQueu.length > 0) {

            const currentNode = exploreQueu.shift()
            if (currentNode) yield currentNode

            if (_isElement(currentNode)) {
                if (_isTemplateElement(currentNode)) {
                    if (exploreTemplateTags) exploreQueu.push(
                        ...currentNode.content.childNodes
                    )
                } else {
                    exploreQueu.push(...currentNode.childNodes)
                }
            }
        }
    }

    /** Checks that a query have been defined */
    #queryHasBeenDefined(query: elementQuery_T): boolean {

        const {
            tagName,
            id,
            class: className,
            hasAttr
        } = query

        if (isString(tagName, {nonEmpty:true})) return true

        if (isString(id, {nonEmpty:true})) return true

        if (_isNonEmptyListOrString(className)) return true

        if (_isNonEmptyListOrString(hasAttr)) return true

        return false
    }

    /** Returns true if the node satisfies the query */
    #satisfiesElmntQuery(node: HtmlNodeTypes.Element, query: elementQuery_T): boolean {
        const { attrs, tagName } = node

        if ( query.tagName 
            && tagName !== query.tagName
        ) return false

        if (query.id) {
            const idAttr = attrs.find( attr => attr.name === 'id' )

            if (!idAttr) return false
            if (idAttr.value !== query.id) return false
        }

        if (_isNonEmptyListOrString(query.class)) {
            const hasClasses = this.#hasClasses( attrs,
                isArray(query.class) ? query.class : [ query.class ]
            )
            if (!hasClasses) return false
        } 
        
        if (_isNonEmptyListOrString(query.hasAttr)) {
            const hasAttrs = this.#hasAttributes( attrs,
                isArray(query.hasAttr) ? query.hasAttr : [query.hasAttr]
            )
            if (!hasAttrs) return false
        }

        return true
    }

    /** Returns true if all the required classes are included in the node attrs */
    #hasClasses(nodeAttrs: AttributeList_T, classNames: string[]) {
        const classAttr = nodeAttrs.find( attr => attr.name === 'class' )
        if (!classAttr) return false

        const nodeClasses = classAttr.value.split(' ')

        for (const requiredClass of classNames) {
            const classExists = nodeClasses.find( cls => cls === requiredClass )
            if (!classExists) return false
        }

        return true
    }

    /** Returns true if all the required attributes are defined in the node attrs */
    #hasAttributes(nodeAttrs: AttributeList_T, requiredAttrs: string[]) {
        for (const requiredAttr of requiredAttrs) {
            const attrExists = nodeAttrs.find( attr => attr.name === requiredAttr )
            if (!attrExists) return false
        }
        return true
    }
}


// ℹ️ Defined outside of the class because they are non-specific enough
// that we might want to use it from the class and the instance

/** Returns true if the value is a non empty string, or a non empty list */
function _isNonEmptyListOrString(val:unknown) : val is string | string[] {
        return isString(val, {nonEmpty:true}) || isArray(val, {nonEmpty:true})
    }

/** Returns true if node is element type (a html tag or a template element) */
function _isElement(node?: HtmlNodeTypes.ChildNode | HtmlNodeTypes.ParentNode ): node is HtmlNodeTypes.Element {
    return !!( node  && ('tagName' in node))
}

/** Returns true if node is a `<template>` tag */
function _isTemplateElement(node: HtmlNodeTypes.Element ): node is HtmlNodeTypes.Template {
    return 'content' in node
}


export default HtmlDocument
export type { HtmlDocument, HtmlNodeTypes }