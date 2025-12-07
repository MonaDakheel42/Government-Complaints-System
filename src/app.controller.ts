import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
@Get('test-error')
test() {
  throw new Error("TEST_UNCAUGHT_EXCEPTION");
}
@Get('test-rejection')
test2() {
  Promise.reject("TEST_UNHANDLED_REJECTION");
}

}
