
const MAX_SIZE_BYTES = 55 * 1024;
const DEFAULT_MAX_DIMENSION = 400;

type ImageSource = File | Blob | HTMLVideoElement;

type CompressedImage = {
  base64: string;
  contentType: string;
};

function loadImage(source: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load the selected image."));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Image compression failed."));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not encode the compressed image."));
        return;
      }

      const commaIndex = reader.result.indexOf(",");

      resolve(reader.result.substring(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error("Could not read the compressed image."));
    };

    reader.readAsDataURL(blob);
  });
}

export async function compressImage(
  source: ImageSource,
  targetSize = DEFAULT_MAX_DIMENSION,
  initialQuality = 0.85
): Promise<CompressedImage> {
  if (!Number.isFinite(targetSize) || targetSize < 1) {
    throw new Error("Invalid image dimensions setting.");
  }

  let drawable: HTMLImageElement | HTMLVideoElement;
  let originalWidth: number;
  let originalHeight: number;

  if (source instanceof HTMLVideoElement) {
    drawable = source;
    originalWidth = source.videoWidth;
    originalHeight = source.videoHeight;

    if (!originalWidth || !originalHeight) {
      throw new Error("Camera is not ready. Please try again.");
    }
  } else {
    drawable = await loadImage(source);
    originalWidth = drawable.naturalWidth;
    originalHeight = drawable.naturalHeight;
  }

  if (!originalWidth || !originalHeight) {
    throw new Error("Invalid image dimensions.");
  }

  // Resize proportionally. Do not crop the client's face.
  const initialScale = Math.min(
    1,
    targetSize / originalWidth,
    targetSize / originalHeight
  );

  let width = Math.max(
    1,
    Math.round(originalWidth * initialScale)
  );

  let height = Math.max(
    1,
    Math.round(originalHeight * initialScale)
  );

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser cannot process this image.");
  }

  const qualities = [
    Math.min(0.95, Math.max(0.25, initialQuality)),
    0.75,
    0.65,
    0.55,
    0.45,
    0.35,
    0.25,
  ];

  while (true) {
    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);
    context.drawImage(drawable, 0, 0, width, height);

    for (const quality of qualities) {
      const blob = await canvasToBlob(canvas, quality);

      // Check the actual encoded JPEG size, not Base64 characters.
      if (blob.size <= MAX_SIZE_BYTES) {
        return {
          base64: await blobToBase64(blob),
          contentType: "image/jpeg",
        };
      }
    }

    // Keep shrinking until the actual JPEG fits the limit.
    if (width === 1 && height === 1) {
      throw new Error(
        "Could not compress this photo below 55 KB."
      );
    }

    const nextWidth = Math.max(1, Math.floor(width * 0.8));
    const nextHeight = Math.max(1, Math.floor(height * 0.8));

    // Ensure progress even when one dimension is already 1 pixel.
    width = nextWidth === width && width > 1
      ? width - 1
      : nextWidth;

    height = nextHeight === height && height > 1
      ? height - 1
      : nextHeight;
  }
}
