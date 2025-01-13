

/** the first time it is called, will send the request in a normal way, and cache it
 * on the next request, will returned the cached version at the same time as it sends a new request
 * and swap the result of the new request once it is received
 * 
 * (can be paired with pure caching)
 */
function useSwapRequest( ) {

}

export default useSwapRequest