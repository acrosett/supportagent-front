declare module 'pdf-parse' {
  interface PDFInfo { [key: string]: any }
  interface PDFMetadata { [key: string]: any }
  interface PDFVersion { [key: string]: any }
  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata | null
    version: string | PDFVersion
    text: string
  }

  function pdf(dataBuffer: ArrayBuffer | Uint8Array | Buffer, options?: any): Promise<PDFData>
  export = pdf
}
