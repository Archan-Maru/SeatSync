import express from 'express';
import "express-async-errors";
import { errorHandler, NotFoundError,currentUser } from '@sgtickets/common';
import cookieSession from 'cookie-session';
import {newOrderRouter,showOrderRouter,indexOrderRouter,deleteOrderRouter} from './routes';

const app = express();
app.set('trust proxy', true);

app.use(express.json());

app.use(
    cookieSession({
        signed: false,
        secure: true
    })
)

app.use(currentUser);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};