import { HttpException } from '@nestjs/common';

export class RecipientNotFoundException extends HttpException {
  constructor() {
    super('Cannot process request', 502);
  }
}
