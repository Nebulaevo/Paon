import { vi, describe, expect, beforeEach, it } from "vitest"

const mockReadableStream = {
    pipe: vi.fn(() => {})
}

const mockChildProcess = {
    stderr: mockReadableStream,
    stdout: mockReadableStream,
    on: vi.fn(() => {})
}

const spawn = vi.fn((command, args, options) => {
    return mockChildProcess
})

const child_process = {
    spawn
}

export default child_process

export {
    spawn
}
