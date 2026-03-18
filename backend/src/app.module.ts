import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  databaseConfig,
  elasticsearchConfig,
  redisConfig,
  jwtConfig,
} from './config';
import {
  User,
  Organization,
  Policy,
  Clause,
  COU,
  Tag,
  Scene,
  SceneTemplate,
} from './entities';

const entities = [
  User,
  Organization,
  Policy,
  Clause,
  COU,
  Tag,
  Scene,
  SceneTemplate,
];
import { AuthModule } from './modules/auth/auth.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { COUsModule } from './modules/cous/cous.module';
import { SearchModule } from './modules/search/search.module';
import { ScenesModule } from './modules/scenes/scenes.module';
import { TagsModule } from './modules/tags/tags.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AIModule } from './modules/ai/ai.module';
import { ImportExportModule } from './modules/import-export/import-export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, elasticsearchConfig, redisConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PoliciesModule,
    COUsModule,
    SearchModule,
    ScenesModule,
    TagsModule,
    UserSettingsModule,
    AnalyticsModule,
    AIModule,
    ImportExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
