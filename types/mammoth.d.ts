declare module 'mammoth' {
  interface ConvertToHtmlOptions {
    includeDefaultStyleMap?: boolean
    styleMap?: string[]
    convertImage?: (image: any) => Promise<any>
  }
  interface Result {
    value: string
    messages: Array<{ type: string; message: string }>
  }
  export function convertToHtml(input: ArrayBuffer | Uint8Array | Buffer | { arrayBuffer: () => Promise<ArrayBuffer> }, options?: ConvertToHtmlOptions): Promise<Result>
  export function extractRawText(input: ArrayBuffer | Uint8Array | Buffer | { arrayBuffer: () => Promise<ArrayBuffer> }): Promise<Result>
}
