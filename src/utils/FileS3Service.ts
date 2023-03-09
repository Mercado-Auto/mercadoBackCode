import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class FileS3Service {
  public async uploadFile(
    imageBuffer: Buffer,
    fileName: string,
    Bucket: string,
  ) {
    const s3 = new S3();
    return await s3
      .upload({
        Bucket,
        Body: imageBuffer,
        Key: fileName,
        ACL: 'public-read',
      })
      .promise();
  }
  public async deleteFile(key: string, Bucket: string) {
    const s3 = new S3();
    return await s3
      .deleteObject({
        Bucket,
        Key: key,
      })
      .promise();
  }
}
