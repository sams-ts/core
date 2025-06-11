
class BadRequestException extends Error {
    constructor(message = "BadRequestException") {
        super(JSON.stringify({ message, status: 400 }));
    }
}

export default BadRequestException