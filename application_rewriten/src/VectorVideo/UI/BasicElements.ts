module UI {
		
	/**
	 * Basic UI interface
	 */
	export interface IElement {
		GetHTML(): HTMLElement;
	}
	
	export class SimpleElement implements IElement {		
		/** The simple element */
		private element: HTMLElement;
		
		/**
		 * Create a simple HTML element, that can be part of a Panel
		 * @param	tag		Tag name or HTMLElement instance
		 * @param	content	Optional textual content of the tag 
		 */
		constructor(tag: string|HTMLElement, content?: string) {
			if(typeof tag === "string") {
				this.element = HTML.CreateElement(<string> tag);				
			} else {
				this.element = tag;
			}
			if(!!content) { // if content argument is passed
				this.element.textContent = content;				
			}
		}
		
		/**
		 * Getter of the element.
		 */
		public GetHTML() : HTMLElement { return this.element; }		
	}	
	
	
	/**
	 * A few concrete UI elements
	 */
	 
	/**
	 * Basic UI button
	 */
	export class Button extends SimpleElement {
		
		/**
		 * Create a basic button with a text in it
		 * @param	text	Button caption
		 * @param	onClick	Optional click event handler
		 */
		constructor(text: string, onClick?: Function) {
			super("button", text);			
			if(!!onClick) {
				this.GetHTML().onclick = (e) => onClick(); // no event arguments are passed on purpose
			}
		}
	}
	
	
	/**
	 * Basic UI button
	 */
	export class Paragraph extends SimpleElement {
		
		/**
		 * Create a basic button with a text in it
		 */
		constructor(text: string) {
			super("p", text);
		}
	}
	
	
	/**
	 * A composite UI element
	 */
	export class Panel implements IElement {
		
		/** The root element of the panel */
		private root: HTMLElement;
		
		/** Child buttons - in the order they were added */
		private elements: Array<IElement>;
		public get Children() : Array<IElement> { return this.elements; }
		
		/**
		 * Create a new specific panel 
		 * @param	tag		The tag name of the panel
		 * @param	id		The HTML ID of the panel
		 */
		constructor(tag: string, id: string) {			
			this.root = Helpers.HTML.CreateElement(tag, {
				id: id,
				class: "ui-panel"
			});
			this.elements = [];
		}
		
		/**
		 * Add another button to the collection.
		 * @param	btn		Button instance.
		 */
		public AddChild(el: IElement) : void {
			this.elements.push(el);
			this.root.appendChild(el.GetHTML());
		}
		
		/**
		 * Add muiltiple children.
		 * @param	elements	Array of elements
		 */
		public AddChildren(elements: Array<IElement>) : void {
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				this.AddChild(element);
			}
		}
		
		/**
		 * Returns the panel element with it's children
		 */
		public GetHTML() : HTMLElement { return this.root; }
		
	}

	
}