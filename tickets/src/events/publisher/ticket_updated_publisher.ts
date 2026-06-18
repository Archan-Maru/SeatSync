import {Publisher,Subjects,TicketUpdatedEvent} from '@sgtickets/common';
import { natsWrapper } from '../../nats_wrapper';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated=Subjects.TicketUpdated;
}

