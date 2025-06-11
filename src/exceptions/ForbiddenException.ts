
class ForbiddenException extends Error {
    constructor(message = "ForbiddenException") {
        super(JSON.stringify({ message, status: 403 }))
    }
}

export default ForbiddenException