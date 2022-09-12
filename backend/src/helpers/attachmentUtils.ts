import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
  constructor(
    private readonly s3 = createS3Bucket(),
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION,10)) {
  }

  async getUploadUrl(todoId: string): Promise<string> {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }

  getAttachmentUrl(todoId: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

  async deleteAttachment(todoId: string) {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: todoId
    }).promise()
  }
}

function createS3Bucket() {
  return new XAWS.S3({
    signatureVersion: 'v4',
    region: process.env.REGION,
  })
}
