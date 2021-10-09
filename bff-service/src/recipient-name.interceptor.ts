import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RecipientNotFoundException } from './recipient-not-found-exception';

@Injectable()
export class RecipientNameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const host = context.switchToHttp();
    const recipientName = host.getRequest().params.recipientName;

    if (!recipientName || !process.env[recipientName]) {
      console.error('RecipientNotFoundException');
      throw new RecipientNotFoundException();
    }
    return next.handle();
  }
}
