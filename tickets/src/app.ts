import express from 'express';
import "express-async-errors";
import { errorHandler, NotFoundError,currentUser } from '@sgtickets/common';
import cookieSession from 'cookie-session';
import {createTicketRouter,showTicketRouter,indexTicketRouter,updateTicketRouter} from './routes'

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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};