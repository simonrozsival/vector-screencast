export interface IElement {
    GetHTML(): HTMLElement;
    HasClass(className: string): boolean;
    AddClass(className: string): IElement;
    AddClasses(...classes: Array<string>): IElement;
    RemoveClass(className: string): IElement;
    RemoveClasses(...classes: Array<string>): IElement;
}
export declare class SimpleElement implements IElement {
    private element;
    constructor(tag: string | HTMLElement, content?: string);
    GetHTML(): HTMLElement;
    HasClass(className: string): boolean;
    AddClass(className: string): IElement;
    AddClasses(...classes: Array<string>): IElement;
    RemoveClass(className: string): IElement;
    RemoveClasses(...classes: Array<string>): IElement;
}
export declare class Button extends SimpleElement {
    protected content: IElement;
    constructor(text: string, onClick?: (e: MouseEvent) => void);
    ChangeContent(content: string): Button;
}
export declare class IconButton extends Button {
    protected iconClass: string;
    protected icon: IElement;
    constructor(iconClass: string, content: string, onClick?: (e: Event) => void);
    ChangeIcon(iconClass: string): IconButton;
}
export declare class IconOnlyButton extends IconButton {
    constructor(iconClass: string, title: string, onClick?: (e: Event) => void);
    ChangeContent(content: string): IconButton;
}
export declare class Heading extends SimpleElement {
    constructor(level: number, text: string);
}
export declare class H2 extends Heading {
    constructor(text: string);
}
export declare class Panel implements IElement {
    private element;
    private elements;
    Children: Array<IElement>;
    constructor(tag: string, id?: string);
    AddChild(el: IElement): Panel;
    AddChildren(...elements: Array<IElement>): Panel;
    GetHTML(): HTMLElement;
    HasClass(className: string): boolean;
    AddClass(className: string): Panel;
    AddClasses(...classes: Array<string>): Panel;
    RemoveClass(className: string): Panel;
    RemoveClasses(...classes: Array<string>): Panel;
}
