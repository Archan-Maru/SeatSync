import express from 'express';
import "express-async-errors";
import { currentUserRouter, signinRouter, signoutRouter, signupRouter } from './routes'
import { errorHandler, NotFoundError } from '@sgtickets/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);

app.use(express.json());

app.use(
    cookieSession({
        signed: false,
        secure: true
    })
)

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};