
/** Generates non-secure simple random ids */
function getSimpleRandomId(): string {
    return Math.random().toString(36).slice(2)
}

/** Returns an object allowing to generate unique ids
 * 
 * @returns key/value object {get: func, unregister: func} :
 * - `get()` : returns a unique id
 * - `unregister(id: string)` : removes a given id from the existing id set.
 */
function getUniqueIdGenerator() {
    
    const EXISTING_IDS = new Set<string>()
    
    /** Returns a unique ID
     * 
     * by storing generated ids in a set
     * 
     * (all ids are prefixed with 'id-' to insure it always starts with a letter)
     * 
     * @throws Error if while loop generating ids fails to create a unique id 20 times
     */
    function get(): string {
        let id;
        let iter = 0
        do {
            id = 'id-' + getSimpleRandomId() + '-' + getSimpleRandomId()
            iter ++

            if (iter > 20) throw new Error(
                'ID generation failed to generate a unique id 20 times in a row, '
                + 'while loop was forcfully closed'
            )
        } while (EXISTING_IDS.has(id))
    
        EXISTING_IDS.add(id)
        return id
    }

    /** Removes an id from the existing ids set
     * 
     * (allowing it to be generated again)
     */
    function unregister(id: string) {
        EXISTING_IDS.delete(id)
    }

    return {
        get, 
        unregister
    }
}

export { getSimpleRandomId, getUniqueIdGenerator }