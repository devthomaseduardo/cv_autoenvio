"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: configService.get('FRONTEND_URL', 'http://localhost:5173'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1');
    if (nodeEnv !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('JobTailor API')
            .setDescription('🎯 AI-Powered Professional Job Matching System\n\n' +
            'Paste a job URL → AI analyzes → tailors your resume → generates cover letter → tracks applications.')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .addTag('auth', 'Authentication & Authorization')
            .addTag('users', 'User Profile Management')
            .addTag('jobs', 'Job Discovery & Analysis')
            .addTag('resumes', 'Resume Management & Tailoring')
            .addTag('applications', 'Application Tracking')
            .addTag('ai', 'AI Engine')
            .addTag('analytics', 'Dashboard & Analytics')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
            },
        });
        logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    }
    app.enableShutdownHooks();
    await app.listen(port);
    logger.log(`🚀 JobTailor running on http://localhost:${port}/api/v1`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
//# sourceMappingURL=main.js.map