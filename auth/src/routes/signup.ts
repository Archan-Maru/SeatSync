import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { BadRequestError,validateRequest } from '@sgtickets/common';
import { User } from '../models';
import jwt from 'jsonwebtoken';
import 'cookie-session';

const router = express.Router();

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password lenght must be between 4-20 charcters')
],validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
           throw new BadRequestError('Email already in use');
        }

        const user = User.build({ email, password });
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_KEY!
        );

        req.session={
            jwt:userJwt
        };

        return res.status(201).send(user);

    })

export { router as signupRouter }