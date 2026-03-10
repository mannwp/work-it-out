import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  const config = new DocumentBuilder()
    .setTitle('WorkItOut docs')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Collection JSON', '/docs-json')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
