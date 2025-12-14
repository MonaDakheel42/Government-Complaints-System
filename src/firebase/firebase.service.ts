import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DbService } from 'src/db/db.service';

@Injectable()
export class FirebaseService {
    constructor(
    @Inject('FIREBASE_ADMIN') private firebase: typeof admin,
    private db: DbService,
  ) {}
  async sendToCitizen(userId: number, title: string, body: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    try {
      const response = await this.firebase.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
      });
      console.log('FCM response:', response);
    } catch (err) {
      console.error('FCM error:', err);
    }
    // throw new ConflictException('فااااااااااااااااااااات');
  }
}
