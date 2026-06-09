import express from 'express';
import "express-async-errors";
import { currentUserRouter, signinRouter, signoutRouter, signupRouter } from './routes'
import { errorHandler } from './middlewares/index'
import { NotFoundError } from './errors/index'
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
    try {
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
        console.log('Connected');
    } catch (error) {
        console.log(error);
    }
};

app.listen(3000, () => {
    console.log("listening on 3000");
})

start();