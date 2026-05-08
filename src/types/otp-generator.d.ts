declare module 'otp-generator' {
  export interface Options {
    digits?: boolean;
    lowerCaseAlphabets?: boolean;
    upperCaseAlphabets?: boolean;
    specialChars?: boolean;
  }
  function generate(length?: number, options?: Options): string;
  export default { generate };
}
