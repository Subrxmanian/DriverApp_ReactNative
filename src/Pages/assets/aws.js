import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ReadableStream } from 'web-streams-polyfill';
import 'react-native-url-polyfill/auto';
import Config from '../../../Config';
import { URL } from 'react-native-url-polyfill';
global.URL = URL;
global.ReadableStream = ReadableStream;
const s3Client = new S3Client({
  region: Config.AWS_REGION,
  credentials: {
    accessKeyId: Config.AWS_ACCESSKEYID,
    secretAccessKey: Config.AWS_SECRETACCESSKEY,
  },
});



const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: Config.AWS_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Signed URL Error:', error);
    throw error;
  }
};

export {  generateSignedUrl };