import { SetMetadata } from '@nestjs/common';

export const CHECK_ID_EXISTS_KEY = 'check_id_exists';
export const CheckIdExists = (table: string, idField: string = 'id') =>
  SetMetadata(CHECK_ID_EXISTS_KEY, { table, idField });
