import AWS from "aws-sdk";
import https from "https";

export default class S3 {
  private static instance: S3;
  private s3: AWS.S3;
  private readonly bucketPrefix: string = "company-";

  private constructor() {
    this.s3 = new AWS.S3({
      // Force SSL/TLS for all operations
      sslEnabled: true,
      // Enforce minimum TLS version
      httpOptions: {
        agent: new https.Agent({
          secureProtocol: "TLSv1_2_method",
          minVersion: "TLSv1.2",
        }),
      },
    });
  }

  public static getInstance(): S3 {
    if (!S3.instance) {
      S3.instance = new S3();
    }
    return S3.instance;
  }

  /**
   * Creates a new S3 bucket for a company with proper encryption settings
   * @param companyId - Unique identifier for the company
   * @returns Promise<string> - Returns the bucket name if successful
   */
  public async createCompanyBucket(companyId: string): Promise<string> {
    const bucketName = this.generateBucketName(companyId);

    try {
      await this.s3
        .createBucket({
          Bucket: bucketName,
          // Optionally specify a region
          // CreateBucketConfiguration: { LocationConstraint: 'eu-west-1' }
        })
        .promise();

      // Enable server-side encryption by default for all objects in the bucket
      await this.s3
        .putBucketEncryption({
          Bucket: bucketName,
          ServerSideEncryptionConfiguration: {
            Rules: [
              {
                ApplyServerSideEncryptionByDefault: {
                  SSEAlgorithm: "AES256",
                },
              },
            ],
          },
        })
        .promise();

      // Block public access to the bucket
      await this.s3
        .putPublicAccessBlock({
          Bucket: bucketName,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
          },
        })
        .promise();

      return bucketName;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to create bucket for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Uploads a file to a company's bucket with encryption
   * @param companyId - Company identifier
   * @param key - File key/path in the bucket
   * @param data - File data to upload
   * @param contentType - MIME type of the file
   */
  public async uploadFile(
    companyId: string,
    key: string,
    data: Buffer | Uint8Array | string,
    contentType: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const bucketName = this.generateBucketName(companyId);

    try {
      return await this.s3
        .upload({
          Bucket: bucketName,
          Key: key,
          Body: data,
          ContentType: contentType,
          // Ensure encryption in transit
          ServerSideEncryption: "AES256",
        })
        .promise();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to upload file for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Downloads a file from a company's bucket
   * @param companyId - Company identifier
   * @param key - File key/path in the bucket
   */
  public async downloadFile(
    companyId: string,
    key: string,
  ): Promise<AWS.S3.GetObjectOutput> {
    const bucketName = this.generateBucketName(companyId);

    try {
      return await this.s3
        .getObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to download file for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Lists all files in a company's bucket
   * @param companyId - Company identifier
   * @param prefix - Optional prefix to filter files
   */
  public async listFiles(
    companyId: string,
    prefix?: string,
  ): Promise<AWS.S3.ObjectList> {
    const bucketName = this.generateBucketName(companyId);

    try {
      const response = await this.s3
        .listObjects({
          Bucket: bucketName,
          Prefix: prefix,
        })
        .promise();

      return response.Contents || [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to list files for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Deletes a file from a company's bucket
   * @param companyId - Company identifier
   * @param key - File key/path in the bucket
   */
  public async deleteFile(companyId: string, key: string): Promise<void> {
    const bucketName = this.generateBucketName(companyId);

    try {
      await this.s3
        .deleteObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete file for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Generates a consistent bucket name for a company
   * @param companyId - Company identifier
   * @returns string - Bucket name
   */
  private generateBucketName(companyId: string): string {
    return `${this.bucketPrefix}${companyId}`.toLowerCase();
  }

  public async deleteBucket(companyId: string): Promise<void> {
    const bucketName = this.generateBucketName(companyId);

    try {
      // First, delete all objects in the bucket
      const objects = await this.s3
        .listObjects({ Bucket: bucketName })
        .promise();
      if (objects.Contents && objects.Contents.length > 0) {
        await this.s3
          .deleteObjects({
            Bucket: bucketName,
            Delete: {
              Objects: objects.Contents.map(({ Key }) => ({
                Key: Key as string,
              })),
            },
          })
          .promise();
      }

      // Then delete the bucket itself
      await this.s3.deleteBucket({ Bucket: bucketName }).promise();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete bucket for company ${companyId}: ${errorMessage}`,
      );
    }
  }
}
