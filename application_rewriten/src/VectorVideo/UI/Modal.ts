/// <reference path="BasicElements" />
/// <reference path="../Helpers/HTML" />

module UI {
	
	export class Modal extends Panel {
				
		/** The part of the modal where the inputs are */
		protected body: Panel;
		
		
		/**
		 * Prepare the modal skeleton.
		 * @param 	name			Displayed title of the modal
		 * @param	buttonCaption  	The text that will be displayed in the 
		 */
		constructor(id: string, name: string, closeButton: string) {
			// intialise the panel
			super("div", id); 
			
			// build the modal
			var root = this.GetHTML();
			root.classList.add("ui-modal");
			
			// title
			var title: IElement = new SimpleElement("h1", name);
			title.GetHTML().classList.add("ui-modal-title");
			this.AddChild(title)
			
			// body
			this.body = new Panel("div", `${id}-body`);
			this.AddChild(this.body);
			
			// footer
			var submitBtn: Button = new Button(closeButton, this.Hide); 
			var footer: Panel = new Panel("div", `${id}-footer`);			
			footer.AddChild(submitBtn);
			this.AddChild(footer);
		}
		
		/**
		 * Show the modal
		 */
		public Show() : void {
			this.GetHTML().classList.add("ui-modal-shown");
		}
		
		/**
		 * Hide the modal
		 */
		public Hide() : void {
			this.GetHTML().classList.remove("ui-modal-shown");			
		}
		
	}
	
	/**
	 * The interface wrapping the results given by the modal
	 */
	export interface IModalResults {
		[index: string]: any;
	}
	
	/**
	 * 
	 */
	export class FormModal extends Modal {
		
		/** The inputs */
		private inputs: Array<SimpleElement>;
		
		/**
		 * @param	id				Modal element HTML id attribute
		 * @param	name			Modal title
		 * @param	closeButton		Close button caption
		 * @param	submitResults	Callback
		 */
		constructor(id: string, name: string, closeButton: string, private submitResults: (results: IModalResults) => any) {
			super(id, name, closeButton);
		}
		
		/**
		 * Add an input.
		 * @param	id		Identificator
		 */
		public AddInput(id: string, caption: string) : void {			
			this.AddFormField("input", id, caption);
		}
		
		/**
		 * Add an input.
		 * @param	id		Identificator
		 */
		public AddTextArea(id: string, caption: string) : void {			
			this.AddFormField("textarea", id, caption);
		}
		
		/**
		 * Add an input.
		 * @param	id		Identificator
		 */
	 	private AddFormField(type: string, id: string, caption: string) : void {			
			var label: IElement = new SimpleElement("label", caption);
			Helpers.HTML.SetAttributes(label.GetHTML(), {
				class: "ui-modal-label",
				"for": id,
			});
						
			var input: IElement = new SimpleElement(type);
			Helpers.HTML.SetAttributes(input.GetHTML(), {
				class: "ui-modal-input",
				name: id,
				type: "text",
			});
						
			var group: Panel = new Panel("div", `${id}-group`);
			group.AddChildren([ label, input ]);
			
			// put it into the form as next item 
			this.body.AddChild(group);
		}
		
		/**
		 * Submit the results when hiding
		 */
		public Hide() : void {
			// collect results
			var results: IModalResults;
			for (var i = 0; i < this.inputs.length; i++) {
				var input = this.inputs[i];
				var value: string = input.GetHTML().tagName === "input"
									? input.GetHTML().nodeValue
									: input.GetHTML().textContent; // textarea
									
				results[input.GetHTML().getAttribute("name")] = value;
			}
			
			// call user's callback
			if(!!this.submitResults) {
				this.submitResults(results);				
			}
			
			// close the modal
			super.Hide();
		}
	
	}
}