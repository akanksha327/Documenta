const DEFAULT_MAX_UPLOAD_SIZE_MB = 10;
const DEFAULT_ALLOWED_MIME_TYPES = ['application/pdf'];
const DEFAULT_ALLOWED_EXTENSIONS = ['.pdf'];

function parseCsv(value: string | undefined, fallback: string[]) {
  const values = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return values && values.length > 0 ? values : fallback;
}

function parseUploadSizeMb(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_UPLOAD_SIZE_MB;
}

export const uploadConfig = {
  maxSizeMb: parseUploadSizeMb(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB),
  allowedMimeTypes: parseCsv(
    process.env.NEXT_PUBLIC_ALLOWED_UPLOAD_MIME_TYPES,
    DEFAULT_ALLOWED_MIME_TYPES
  ),
  allowedExtensions: parseCsv(
    process.env.NEXT_PUBLIC_ALLOWED_UPLOAD_EXTENSIONS,
    DEFAULT_ALLOWED_EXTENSIONS
  ),
};

export const maxUploadSizeBytes = uploadConfig.maxSizeMb * 1024 * 1024;

export function isAllowedUploadType(file: File) {
  const fileName = file.name.toLowerCase();
  const hasAllowedMimeType = uploadConfig.allowedMimeTypes.includes(file.type);
  const hasAllowedExtension = uploadConfig.allowedExtensions.some((extension) =>
    fileName.endsWith(extension.toLowerCase())
  );

  return hasAllowedMimeType || hasAllowedExtension;
}
