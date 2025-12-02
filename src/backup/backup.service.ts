import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { DbService } from 'src/db/db.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BackupService {
  constructor(private prisma: DbService) {}

  private ensureBackupFolder() {
    const backupsDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }

    return backupsDir;
  }

  async createBackup() {
    const backupsDir = this.ensureBackupFolder();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `mysql-backup-${timestamp}.sql`;
    const filePath = path.join(backupsDir, fileName);

    const DB_USER = process.env.DB_USER;
    const DB_PASS = process.env.DB_PASS;
    const DB_NAME = process.env.DB_NAME;
    const DB_HOST = process.env.DB_HOST ?? "localhost";

    const dumpPath = `"C:\\xampp\\mysql\\bin\\mysqldump.exe"`;

    const command = `${dumpPath} -h ${DB_HOST} -u ${DB_USER} ${DB_PASS ? `-p${DB_PASS}` : ''} ${DB_NAME} > "${filePath}"`;

    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    await this.prisma.backupLog.create({
      data: { filename: fileName },
    });

    return {
      message: 'Backup created successfully.',
      filename: fileName,
    };
  }

  async listBackups() {
    return this.prisma.backupLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

@Cron(CronExpression.EVERY_DAY_AT_5PM)
async handleDailyBackup() {
  console.log('[Backup] Creating automatic backup at 5 PM...');
  await this.createBackup();
  console.log('[Backup] Automatic backup completed.');
}

}
