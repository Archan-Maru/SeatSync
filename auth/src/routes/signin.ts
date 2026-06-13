import express,{Request,Response} from "express";
import {body} from 'express-validator';
import {validateRequest,BadRequestError} from '@sgtickets/common';
import {User} from '../models';
import {Password} from '../services/password';
import jwt from 'jsonwebtoken';
import 'cookie-session';

const router = express.Router();

router.post('/api/users/signin', [body('email').isEmail().withMessage('Email must be valid')],body('password').trim().notEmpty().withMessage('You must supply a password'),
 validateRequest,
 async (req:Request, res:Response) => {
    
   const {email,password}=req.body;

   const user=await User.findOne({email});

   if(!user){
    throw new BadRequestError('Invalid credentials');
   }

   const passwordMatch=await Password.compare(user.password,password);

   if(!passwordMatch){
    throw new BadRequestError('Invalid credentials');
   }

   const userJwt = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_KEY!
        );

        req.session={
            jwt:userJwt
        };

        return res.status(200).send(user);

})

export { router as signinRouter }