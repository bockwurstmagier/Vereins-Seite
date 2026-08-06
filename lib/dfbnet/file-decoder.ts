export type DetectedEncoding = "utf-8" | "utf-8-bom" | "utf-16le" | "utf-16be";

export type DecodedUpload = {
  text: string;
  encoding: DetectedEncoding;
};

function swapUtf16Bytes(bytes: Uint8Array) {
  const swapped = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 2) {
    swapped[index] = bytes[index + 1] ?? 0;
    swapped[index + 1] = bytes[index] ?? 0;
  }
  return swapped;
}

export async function decodeCsvFile(file: File): Promise<DecodedUpload> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return {
      text: new TextDecoder("utf-16le").decode(bytes.subarray(2)),
      encoding: "utf-16le",
    };
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return {
      text: new TextDecoder("utf-16le").decode(swapUtf16Bytes(bytes.subarray(2))),
      encoding: "utf-16be",
    };
  }

  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return {
      text: new TextDecoder("utf-8").decode(bytes.subarray(3)),
      encoding: "utf-8-bom",
    };
  }

  const sampleLength = Math.min(bytes.length, 400);
  let zeroBytesAtOddPositions = 0;
  for (let index = 1; index < sampleLength; index += 2) {
    if (bytes[index] === 0) zeroBytesAtOddPositions += 1;
  }

  if (sampleLength > 20 && zeroBytesAtOddPositions / Math.floor(sampleLength / 2) > 0.35) {
    return {
      text: new TextDecoder("utf-16le").decode(bytes),
      encoding: "utf-16le",
    };
  }

  return { text: new TextDecoder("utf-8").decode(bytes), encoding: "utf-8" };
}
