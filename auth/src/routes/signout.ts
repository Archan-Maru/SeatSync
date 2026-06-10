 import express from "express";
 const router=express.Router();
 import 'cookie-session';

 router.post('/api/users/signout',(req,res)=>{
   
   req.session=null;
   res.send({});
 })

 export {router as signoutRouter}