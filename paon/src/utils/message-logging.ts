/* Utility functions logging colored messages to the console */

type colorCodes_T = {
    blue: number,
    green: number,
    yellow: number,
    red: number
}
type colorName_T = keyof colorCodes_T

type icons_T = {
        paon: string,
        lightning: string,
        building: string,
        parcel: string,
        skull: string,
        key: string,
        tools: string,
        antenna: string,
        globe: string,
        ok: string,
        gear: string,
        folder: string,
        document: string,
        
        warning: string,
        checked: string,
        error: string,
        noEntry: string,
}
type iconName_T = keyof icons_T

type messageFormattingdOptions_T = {
    iconName?: iconName_T,
    color?: colorName_T
}

type messageLoggingOptions_T = {
    iconName?: iconName_T,
}


/** function logging a message to console (classic) */
function consoleMessage( message:string, options?:messageLoggingOptions_T ): void {
    const iconName = options?.iconName
    message = _formatMessage( 
        message, 
        { iconName } 
    )
    console.log( message )
}

/** function logging a message to console (blue) */
function consoleBlueMessage(  message:string, options?:messageLoggingOptions_T ): void {
    const iconName = options?.iconName
    message = _formatMessage( 
        message, 
        { iconName: iconName, color: 'blue' } 
    )
    console.log( message )
}

/** function logging a message to console (green) */
function consoleSucessMessage(  message:string, options?:messageLoggingOptions_T ): void {
    const iconName = options?.iconName
    message = _formatMessage( 
        message, 
        { iconName: iconName, color: 'green' } 
    )
    console.log( message )
}

/** function logging an "warn" a message to console (yellow) */
function consoleWarnMessage( message:string, options?:messageLoggingOptions_T ): void {
    const iconName = options?.iconName
    message = _formatMessage( 
        message, 
        { iconName: iconName, color: 'yellow' } 
    )
    console.warn( message )
}

/** function logging an "error" a message to console (red) */
function consoleErrorMessage( message:string, options?:messageLoggingOptions_T ): void {
    const iconName = options?.iconName
    message = _formatMessage( 
        message, 
        { iconName: iconName, color: 'red' } 
    )
    console.error( message )
}

/* ------------------------- Private Helpers ------------------------------- */

function _getIcon( iconName: iconName_T ): string | undefined {
    const icons: icons_T = {
        paon: '🦚',
        lightning: '⚡',
        building: '🏗️ ', // additionnal space needed
        parcel: '📦',
        skull: '💀',
        key: '🔑',
        tools: '🔧',
        antenna: '📡',
        globe: '🌐',
        ok: '👌',
        gear: '⚙️',
        folder: '📂',
        document: '📄',

        warning: '⚠️ ', // additionnal space needed
        checked: '✅',
        error: '❌',
        noEntry: '⛔',
    }
    const icon = icons[iconName] || undefined
    return icon
}

/** gets color number for formating console message */
function _getColorCode( color:colorName_T ): number | undefined {
    const colorCodes: colorCodes_T = {
        blue: 34,
        green: 32,
        yellow: 33,
        red: 31
    }
    const colorCode = colorCodes[color] || undefined

    return colorCode
}

/** adds color and insert icon for a message */
function _formatMessage( 
        message: string, 
        { iconName, color }: messageFormattingdOptions_T 
): string {
    const icon = iconName ? _getIcon( iconName ) : undefined
    const colorCode = color ? _getColorCode( color ) : undefined

    message = icon ? `${icon} ${message}` : message

    return colorCode ? `\x1b[${colorCode}m${message}\x1b[0m` : message
}


export {
    consoleMessage,
    consoleBlueMessage,
    consoleSucessMessage,
    consoleWarnMessage,
    consoleErrorMessage
}