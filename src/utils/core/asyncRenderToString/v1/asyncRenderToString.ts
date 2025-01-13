import stream from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import type { PipeableStream } from 'react-dom/server'

type func_T = () => any

class HtmlWritable extends stream.Writable {
    chunks: any[] = []
    html = ''

    getHtml() {
        return this.html
    }

    _write(chunk:any, _encoding:BufferEncoding, callback:func_T) {
        this.chunks.push(chunk)
        callback()
    }

    _final(callback:func_T) {
        this.html = Buffer.concat(this.chunks).toString();
        callback()
    }
}

/** async function rendering react app asynchronously to allow Suspense and dynamically imported components
 * 
 * (Because renderToString doesn't allow Suspense or dynamic imports...)
 * 
 * ⚙️ Internally we just pipe the result of "renderToPipeableStream" to a writable stream and extract the result to a string.
 * 
 * @example
 * const html = await renderToStringAsync(
 *      <StrictMode><App { ...myProps }/></StrictMode>
 * )
 * 
*/
async function renderToStringAsync( children: React.ReactNode ): Promise<string> {
    return new Promise( (resolve, reject) => {

        const writable = new HtmlWritable()

        const stream: PipeableStream = renderToPipeableStream(
            children,
            {
                onAllReady() {
                    stream.pipe(writable)
                },
                onError( error:unknown ) {
                    reject(error)
                }
            }
        )

        writable.on( 'finish', () => {
            const html = writable.getHtml()
            resolve(html)
        })
    })
}

export default renderToStringAsync