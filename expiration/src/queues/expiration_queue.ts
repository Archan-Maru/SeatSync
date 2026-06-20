import Queue from 'bull';
import {ExpirationCompletePublisher} from '../events/publishers/expiration_complete_pubishers';
import { natsWrapper } from '../nats_wrapper';

const expirationQueue = new Queue('order:expiration',{
    redis:{
        host:process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
   new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId:job.data.orderId,
   });
});

export {expirationQueue};