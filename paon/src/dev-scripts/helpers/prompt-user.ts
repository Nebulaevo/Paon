import readLine from 'node:readline/promises'


async function promptUser( message: string ): Promise<string> {
    
    // we make sure there's a space at the end of prompt message
    if ( !message.endsWith(' ') ) {
        message += ' '
    }
    
    // we display an "are you sure" prompt to user
    const rl = readLine.createInterface({ 
        input: process.stdin, 
        output: process.stdout 
    })
    const userResponse = await rl.question( message )
    rl.close()

    return userResponse
}

export default promptUser