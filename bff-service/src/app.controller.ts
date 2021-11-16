import { All, Controller, HttpStatus, Param, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { RecipientNameInterceptor } from './recipient-name.interceptor';

@Controller()
@UseInterceptors(RecipientNameInterceptor)

export class AppController {
  constructor(private readonly appService: AppService) {}

  @All(':recipientName')
  processRecipient(@Param('recipientName') recipientName: string, @Req() req: Request) {
    return this.appService.getResponse(recipientName, req);
  }
}
