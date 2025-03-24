import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { CryptoRepository } from './repositories/crypto.repository';
import { Crypto, CryptoSchema } from './entities/crypto.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Crypto.name, schema: CryptoSchema }
    ]),
  ],
  controllers: [CryptoController],
  providers: [CryptoService, CryptoRepository],
  exports: [CryptoService, CryptoRepository],
})
export class CryptoModule {} 