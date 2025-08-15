import MurmurHash3 from "imurmurhash";

// Base62 encoding
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase62(num: number): string {
  let str = "";
  do {
    str = alphabet[num % 62] + str;
    num = Math.floor(num / 62);
  } while (num > 0);
  return str;
}

export function shortUrlId(text: string): string {
  const hash = MurmurHash3(text).result(); // integer
  return toBase62(hash); // URL-safe short string
}
