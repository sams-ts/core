
class NotFoundException extends Error {
    constructor(message = "NotFoundException") {
        super(JSON.stringify({ message, status: 404 }))
    }
}

export default NotFoundException