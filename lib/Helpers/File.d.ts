export default class File {
    private static Check(req, mimeType?);
    static Exists(url: string, mimeType?: string): boolean;
    static ExistsAsync(url: string, success: (e: Event) => any, error: (e: Event) => any, mimeType?: string): void;
    static ReadFileAsync(url: string, success: (data: any) => any, error: (errStatus: number) => any): void;
    static ReadXmlAsync(url: string, success: (xml: XMLDocument) => any, error: (errStatus: number) => any): void;
    static Download(blob: Blob, name: string): void;
    private static CurrentDateTime();
    static StartDownloadingWav(blob: Blob): void;
    static StartDownloadingXml(text: string): void;
}
