import { sm2 } from "sm-crypto";

const phoneRules: Record<string, RegExp> = {
  "+1": /^[2-9]\d{9}$/,
  "+7": /^[67]\d{9}$/,
  "+33": /^[67]\d{8}$/,
  "+34": /^[6-9]\d{8}$/,
  "+39": /^3\d{9}$/,
  "+44": /^7[1-9]\d{8}$/,
  "+49": /^1[5-7]\d{8}$/,
  "+55": /^[1-9]\d{10}$/,
  "+61": /^[4578]\d{8}$/,
  "+65": /^[89]\d{7}$/,
  "+81": /^[7890]\d{8}$/,
  "+82": /^1\d{7}$/,
  "+86": /^1[3-9]\d{9}$/,
  "+91": /^[6-9]\d{9}$/,
  "+234": /^[789]\d{9}$/,
  "+254": /^[17]\d{8}$/,
  "+255": /^[67]\d{8}$/,
  "+852": /^[569]\d{7}$/,
  "+853": /^6\d{7}$/,
  "+880": /^1[3-9]\d{8}$/,
  "+886": /^9\d{8}$/,
  "+966": /^5\d{8}$/,
  "+971": /^5\d{8}$/,
};

export function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function validateMobile(mobile: string, areaCode: string): boolean {
  const cleanMobile = normalizeMobile(mobile);
  return (phoneRules[areaCode] ?? /^\d{5,15}$/).test(cleanMobile);
}

export function internationalPhone(areaCode: string, mobile: string): string {
  return `${areaCode}${normalizeMobile(mobile)}`;
}

export function encryptPassword(
  publicKey: string,
  captcha: string,
  password: string,
): string {
  if (!publicKey || !/^(04)?[0-9a-f]{128}$/i.test(publicKey)) {
    throw new Error("Invalid SM2 public key.");
  }
  if (!captcha || !password) {
    throw new Error("Captcha and password are required.");
  }

  return `04${sm2.doEncrypt(`${captcha}${password}`, publicKey, 1)}`;
}

export function createCaptchaId(cryptoSource: Crypto | undefined = globalThis.crypto): string {
  if (typeof cryptoSource?.randomUUID === "function") {
    return cryptoSource.randomUUID();
  }

  if (typeof cryptoSource?.getRandomValues !== "function") {
    throw new Error("Secure random number generation is unavailable.");
  }

  const bytes = cryptoSource.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }
  return value;
}
