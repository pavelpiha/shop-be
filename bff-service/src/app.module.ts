import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RecipientNameInterceptor } from './recipient-name.interceptor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, RecipientNameInterceptor],
})
export class AppModule {}
