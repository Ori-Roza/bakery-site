import { describe, it, expect } from "vitest";
import {
  bufferToHex,
  hexToBase64,
  sanitizeFileName
} from "../src/utils/data-converters";

describe("bufferToHex", () => {
  it("converts simple buffer to hex string", () => {
    const buffer = new Uint8Array([255, 16, 0]).buffer;
    const result = bufferToHex(buffer);
    expect(result).toBe("ff1000");
  });

  it("converts zero bytes correctly", () => {
    const buffer = new Uint8Array([0, 0, 0]).buffer;
    const result = bufferToHex(buffer);
    expect(result).toBe("000000");
  });

  it("converts small values with leading zeros", () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer;
    const result = bufferToHex(buffer);
    expect(result).toBe("010203");
  });

  it("converts max byte value (255)", () => {
    const buffer = new Uint8Array([255]).buffer;
    const result = bufferToHex(buffer);
    expect(result).toBe("ff");
  });

  it("converts complex buffer", () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello" in ASCII codes
    const result = bufferToHex(buffer);
    expect(result).toBe("48656c6c6f");
  });

  it("handles single byte", () => {
    const buffer = new Uint8Array([42]).buffer;
    const result = bufferToHex(buffer);
    expect(result).toBe("2a");
  });

  it("handles empty buffer", () => {
    const buffer = new Uint8Array([]).buffer;
    const result = bufferToHex(buffer);
    expect(result).toBe("");
  });

  it("returns lowercase hex", () => {
    const buffer = new Uint8Array([171, 205, 239]).buffer; // ABCDEF in hex
    const result = bufferToHex(buffer);
    expect(result).toBe("abcdef");
  });
});

describe("hexToBase64", () => {
  it("converts hex string to base64", () => {
    const result = hexToBase64("48656c6c6f"); // "Hello" in hex
    expect(result).toBe("SGVsbG8=");
  });

  it("handles empty string", () => {
    const result = hexToBase64("");
    expect(result).toBe("");
  });

  it("handles null input", () => {
    const result = hexToBase64(null);
    expect(result).toBe("");
  });

  it("handles undefined input", () => {
    const result = hexToBase64(undefined);
    expect(result).toBe("");
  });

  it("converts hex with leading backslash-x prefix", () => {
    const result = hexToBase64("\\x48656c6c6f");
    expect(result).toBe("SGVsbG8=");
  });

  it("converts simple binary values", () => {
    const result = hexToBase64("0f");
    expect(result).toBe("Dw==");
  });

  it("converts all zeros", () => {
    const result = hexToBase64("000000");
    expect(result).toBe("AAAA");
  });

  it("converts all F values", () => {
    const result = hexToBase64("ffffff");
    expect(result).toBe("///8=");
  });

  it("returns valid base64 format", () => {
    const result = hexToBase64("48656c6c6f");
    // Base64 should only contain alphanumeric, +, /, and =
    expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
  });

  it("is reversible with proper decoding", () => {
    const hex = "54457374"; // "TEst" in hex
    const base64 = hexToBase64(hex);
    // Decode should give back original bytes
    const decoded = atob(base64);
    expect(decoded).toBe("TEst");
  });
});

describe("sanitizeFileName", () => {
  it("converts to lowercase", () => {
    const result = sanitizeFileName("HelloWorld");
    expect(result).toBe("helloworld");
  });

  it("replaces spaces with dashes", () => {
    const result = sanitizeFileName("hello world");
    expect(result).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    const result = sanitizeFileName("hello   world");
    expect(result).toBe("hello-world");
  });

  it("removes special characters", () => {
    const result = sanitizeFileName("hello@world#test");
    expect(result).toBe("helloworldtest");
  });

  it("removes Hebrew characters", () => {
    const result = sanitizeFileName("שלום עולם");
    expect(result).toBe("---"); // Spaces become dashes but Hebrew removed
  });

  it("handles slashes and backslashes", () => {
    const result = sanitizeFileName("hello/world\\test");
    expect(result).toBe("helloworldtest");
  });

  it("preserves underscores and dashes", () => {
    const result = sanitizeFileName("hello-world_test");
    expect(result).toBe("hello-world_test");
  });

  it("removes leading and trailing dashes", () => {
    const result = sanitizeFileName("-hello-world-");
    expect(result).toBe("hello-world");
  });

  it("removes consecutive dashes", () => {
    const result = sanitizeFileName("hello--world");
    expect(result).toBe("hello-world");
  });

  it("handles null input", () => {
    const result = sanitizeFileName(null);
    expect(result).toBe("file");
  });

  it("handles undefined input", () => {
    const result = sanitizeFileName(undefined);
    expect(result).toBe("file");
  });

  it("handles empty string", () => {
    const result = sanitizeFileName("");
    expect(result).toBe("file");
  });

  it("returns 'file' for input with only unsupported characters", () => {
    const result = sanitizeFileName("@#$%^&*()");
    expect(result).toBe("file");
  });

  it("returns 'file' for input with only spaces", () => {
    const result = sanitizeFileName("     ");
    expect(result).toBe("file");
  });

  it("handles mixed case with spaces and special chars", () => {
    const result = sanitizeFileName("Hello World @#$ Test!");
    expect(result).toBe("hello-world-test");
  });

  it("preserves numbers", () => {
    const result = sanitizeFileName("test 123 file 456");
    expect(result).toBe("test-123-file-456");
  });

  it("handles real-world filename", () => {
    const result = sanitizeFileName("My Product Image (2).png");
    expect(result).toBe("my-product-image-2png");
  });

  it("handles Hebrew product names", () => {
    const result = sanitizeFileName("עוגת שוקולד\\image.png");
    expect(result).toBe("imagepng");
  });
});
