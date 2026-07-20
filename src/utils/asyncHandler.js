// 1st way to make promise resolve reject  wrapper function 
const asyncHandler =(requstHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requstHandler(req,res,next))
        .catch((err)=> next(err))
    }
}

export {asyncHandler}



/*
// const asyncHandler = ()=>{}
// const asyncHandler = (function) => ()=> {}
// const asyncHandler = (func)=>async()=>{}

1st way to make try catch wrapper function

const asyncHandler = (func)=>async(req,res,next)=>{
    try{
        await func(req,res,next)
    }
    catch(err){
        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })
    }
}
    */