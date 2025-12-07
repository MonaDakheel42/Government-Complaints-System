import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  //مثال على Unhandled Rejection
  @Get('test-rejection')
  test2() {
    Promise.reject("TEST_UNHANDLED_REJECTION");
  }

}
