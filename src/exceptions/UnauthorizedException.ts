
class UnauthorizedException extends Error {
    constructor(message = "UnauthorizedException") {
        super(JSON.stringify({ message, status: 401 }));
    }
}

export default UnauthorizedException