import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [
    FirebaseService,
      {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(
              require(path.join(process.cwd(), 'firebase-service-account.json')),
            ),
          });
        }
        return admin;
      },
    },
  ],
  exports: [FirebaseService,'FIREBASE_ADMIN']
})
export class FirebaseModule {}
