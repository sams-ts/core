
class CustomException extends Error {
    constructor(message: string, status: number) {
        super(JSON.stringify({ message, status }))
    }
}

export default CustomException