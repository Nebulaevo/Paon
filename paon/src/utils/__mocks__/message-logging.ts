/** Mock for custom logging utils, preventing logs when running tests */

import { vi } from 'vitest'

const consoleMessage = vi.fn()
const consoleBlueMessage = vi.fn()
const consoleSucessMessage = vi.fn()
const consoleWarnMessage = vi.fn()
const consoleErrorMessage = vi.fn()

export {
    consoleMessage,
    consoleBlueMessage,
    consoleSucessMessage,
    consoleWarnMessage,
    consoleErrorMessage,
}