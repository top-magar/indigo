/**
 * AWS Infrastructure — S3 (storage) + SES (email)
 */
export { uploadToS3, type UploadOptions, type UploadResult } from "./s3"
export { sendEmailViaSES, type SendEmailOptions, type EmailResult } from "./ses"
