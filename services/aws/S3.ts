import {
  type _Object,
  type BucketLocationConstraint,
  type CompleteMultipartUploadCommandOutput,
  CreateBucketCommand,
  type CreateBucketCommandInput,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  type GetObjectCommandOutput,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutBucketEncryptionCommand,
  PutPublicAccessBlockCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import https from "https";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  private static instance: S3Service;
  private s3Client: S3Client;
  public readonly mainBucketName: string;
  private readonly env: string;

  private constructor() {
    this.env = process.env.NODE_ENV || "development";
    this.mainBucketName = `${this.env}-ecokeepr`;

    const clientConfig: S3ClientConfig = {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
      region: process.env.AWS_REGION as string,
      requestHandler: {
        httpOptions: {
          agent: new https.Agent({
            secureProtocol: "TLSv1_2_method",
            minVersion: "TLSv1.2",
          }),
        },
      },
    };

    this.s3Client = new S3Client(clientConfig);
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  private async ensureMainBucketExists(): Promise<void> {
    console.log(`Checking if bucket exists: ${this.mainBucketName}`);

    try {
      // Check if bucket exists
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.mainBucketName,
        }),
      );
      console.log(`Bucket ${this.mainBucketName} exists`);
    } catch (error: any) {
      if (
        error.$metadata?.httpStatusCode === 404 ||
        error.name === "NotFound" ||
        error.name === "NoSuchBucket"
      ) {
        console.log(`Bucket ${this.mainBucketName} not found, creating...`);
        try {
          // Create bucket configuration
          const createBucketCommand: CreateBucketCommandInput = {
            Bucket: this.mainBucketName,
          };

          // Only add LocationConstraint if not in us-east-1
          if (process.env.AWS_REGION !== "us-east-1") {
            createBucketCommand.CreateBucketConfiguration = {
              LocationConstraint: process.env
                .AWS_REGION as BucketLocationConstraint,
            };
          }

          // Create the bucket
          const createResult = await this.s3Client.send(
            new CreateBucketCommand(createBucketCommand),
          );
          console.log("Bucket created:", createResult);

          // Configure encryption
          await this.s3Client.send(
            new PutBucketEncryptionCommand({
              Bucket: this.mainBucketName,
              ServerSideEncryptionConfiguration: {
                Rules: [
                  {
                    ApplyServerSideEncryptionByDefault: {
                      SSEAlgorithm: "AES256",
                    },
                  },
                ],
              },
            }),
          );
          console.log("Bucket encryption configured");

          // Configure public access block
          await this.s3Client.send(
            new PutPublicAccessBlockCommand({
              Bucket: this.mainBucketName,
              PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true,
              },
            }),
          );
          console.log("Public access block configured");
        } catch (createError: any) {
          console.error("Failed to create bucket:", {
            name: createError.name,
            message: createError.message,
            code: createError.$metadata?.httpStatusCode,
          });
          throw createError;
        }
      } else {
        console.error("Unexpected error checking bucket:", {
          name: error.name,
          message: error.message,
          code: error.$metadata?.httpStatusCode,
        });
        throw error;
      }
    }
  }

  private getCompanyPrefix(companyId: string): string {
    return `companies/${companyId}/`;
  }

  public async initializeCompanyStorage(companyId: string): Promise<void> {
    console.log(`Initializing storage for company: ${companyId}`);
    try {
      await this.ensureMainBucketExists();
      const prefix = this.getCompanyPrefix(companyId);

      // Create a dummy file to establish the prefix
      await this.uploadFile(
        companyId,
        ".init",
        Buffer.from(""),
        "application/json",
      );
      console.log("Company storage initialized");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to initialize storage for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  public async uploadFile(
    companyId: string,
    key: string,
    data: Buffer | Uint8Array | string,
    contentType: string,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    console.log(`Uploading file for company ${companyId}, key: ${key}`);
    try {
      await this.ensureMainBucketExists();
      const prefix = this.getCompanyPrefix(companyId);
      const fullKey = `${prefix}${key}`;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.mainBucketName,
          Key: fullKey,
          Body: data,
          ContentType: contentType,
          ServerSideEncryption: "AES256",
        },
      });

      const result = await upload.done();
      console.log("File uploaded successfully");
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to upload file for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  public async downloadFile(
    companyId: string,
    key: string,
  ): Promise<GetObjectCommandOutput> {
    try {
      const prefix = this.getCompanyPrefix(companyId);
      const fullKey = `${prefix}${key}`;

      return await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.mainBucketName,
          Key: fullKey,
        }),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to download file for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  public async listFiles(
    companyId: string,
    prefix?: string,
  ): Promise<_Object[]> {
    try {
      const companyPrefix = this.getCompanyPrefix(companyId);
      const fullPrefix = prefix ? `${companyPrefix}${prefix}` : companyPrefix;

      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.mainBucketName,
          Prefix: fullPrefix,
        }),
      );

      return response.Contents || [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to list files for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  public async deleteFile(companyId: string, key: string): Promise<void> {
    try {
      const prefix = this.getCompanyPrefix(companyId);
      const fullKey = `${prefix}${key}`;

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.mainBucketName,
          Key: fullKey,
        }),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete file for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  public async deleteCompanyStorage(companyId: string): Promise<void> {
    try {
      const prefix = this.getCompanyPrefix(companyId);

      // List all objects with company prefix
      const listResponse = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.mainBucketName,
          Prefix: prefix,
        }),
      );

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        // Delete all objects with company prefix
        await this.s3Client.send(
          new DeleteObjectsCommand({
            Bucket: this.mainBucketName,
            Delete: {
              Objects: listResponse.Contents.map(({ Key }) => ({
                Key: Key as string,
              })),
            },
          }),
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete storage for company ${companyId}: ${errorMessage}`,
      );
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.ensureMainBucketExists();
      return true;
    } catch (error) {
      console.error("AWS S3Service connection test failed:", error);
      return false;
    }
  }

  public async getPresignedUrl(
    companyId: string,
    key: string,
    expiresInSeconds: number = 300
  ): Promise<string> {
    const prefix = this.getCompanyPrefix(companyId);
    const fullKey = `${prefix}${key}`;
    const command = new GetObjectCommand({
      Bucket: this.mainBucketName,
      Key: fullKey,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }
}

export default S3Service;
