import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import S3Service from "@/services/aws/S3";

// Load environment variables
dotenv.config();

async function validateEnvironment(): Promise<boolean> {
  console.log("\n=== Environment Validation ===");
  const requiredVars = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing);
    return false;
  }

  console.log({
    region: process.env.AWS_REGION,
    accessKeyId: `****${process.env.AWS_ACCESS_KEY_ID?.slice(-4)}`,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    environment: process.env.NODE_ENV || "development",
  });

  return true;
}

async function validateAwsCredentials(): Promise<boolean> {
  console.log("\n=== AWS Credentials Validation ===");
  try {
    const config: S3ClientConfig = {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION!,
    };

    const client = new S3Client(config);
    // Try a simple operation to verify credentials
    await client.config.credentials();
    console.log("AWS credentials are valid");
    return true;
  } catch (error) {
    console.error("AWS credentials validation failed:", error);
    return false;
  }
}

async function testS3Operations() {
  console.log("\n=== S3 Operations Test ===");
  const s3Service = S3Service.getInstance();
  const testCompanyId = `test-company-${Date.now()}`;

  try {
    // Test 1: Connection
    console.log("\n1. Testing S3 Connection...");
    const isConnected = await s3Service.testConnection();
    if (!isConnected) throw new Error("Connection test failed");
    console.log("✅ Connection successful");

    // Test 2: Company Storage Initialization
    console.log("\n2. Testing Company Storage Initialization...");
    await s3Service.initializeCompanyStorage(testCompanyId);
    console.log("✅ Company storage initialized");

    // Test 3: File Upload
    console.log("\n3. Testing File Upload...");
    const testContent = JSON.stringify({ test: "data" });
    await s3Service.uploadFile(
      testCompanyId,
      "test.json",
      testContent,
      "application/json",
    );
    console.log("✅ File uploaded successfully");

    // Test 4: List Files
    console.log("\n4. Testing File Listing...");
    const files = await s3Service.listFiles(testCompanyId);
    console.log("Files found:", files.length);
    files.forEach((file) => console.log(` - ${file.Key}`));
    console.log("✅ File listing successful");

    // Test 5: Download File
    console.log("\n5. Testing File Download...");
    const downloadedFile = await s3Service.downloadFile(
      testCompanyId,
      "test.json",
    );
    const streamToString = (stream: any) =>
      new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    const content = await streamToString(downloadedFile.Body);
    console.log("Downloaded content:", content);
    console.log("✅ File download successful");

    // Test 6: Delete Files
    console.log("\n6. Testing File Deletion...");
    await s3Service.deleteCompanyStorage(testCompanyId);
    console.log("✅ Company storage cleanup successful");

    return true;
  } catch (error) {
    console.error("Test failed:", error);
    // Attempt cleanup even if tests fail
    try {
      await s3Service.deleteCompanyStorage(testCompanyId);
      console.log("Cleanup completed after error");
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError);
    }
    return false;
  }
}

async function runAllTests() {
  console.log("=== Starting S3 Integration Tests ===\n");

  // Step 1: Validate Environment
  if (!(await validateEnvironment())) {
    console.error("❌ Environment validation failed");
    return;
  }
  console.log("✅ Environment validation passed\n");

  // Step 2: Validate AWS Credentials
  if (!(await validateAwsCredentials())) {
    console.error("❌ AWS credentials validation failed");
    return;
  }
  console.log("✅ AWS credentials validation passed\n");

  // Step 3: Test S3 Operations
  const operationsResult = await testS3Operations();
  if (!operationsResult) {
    console.error("❌ S3 operations tests failed");
    return;
  }

  console.log("\n=== All Tests Completed Successfully ===");
}

// Run the tests
runAllTests().catch(console.error);
