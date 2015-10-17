export interface IAttributes {
    [index: string]: any;
}
export default class HTML {
    static CreateElement(name: string, attributes?: IAttributes, children?: Array<HTMLElement>): HTMLElement;
    static SetAttributes(el: HTMLElement, attributes: IAttributes): void;
}
