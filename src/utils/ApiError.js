class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        Statck = "",
    ){
        super(message)
        this.statusCode =statusCode
        this.data = null
        this.message = message
        this.success =false
        this.errors = errors
        if(Statck){
            this.stack=Statck
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}