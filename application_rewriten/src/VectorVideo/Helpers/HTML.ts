
/**
 * HTML helper.
 */
module Helpers {
    
    export interface IAttributes {
        [index: string]: any;
    }

    /**
     * 
     */
    export class HTML {
            
        /**
         * Create a HTML element with specified attributes and appended children (if any)
         */
        public static CreateElement(name: string, attributes?: IAttributes, children?: Array<HTMLElement>) : HTMLElement {
            var el = document.createElement(name);
            
            // set attributes right away - if passed
            if(!!attributes) {
                HTML.SetAttributes(el, attributes);                
            }
            
            if(!!children && Array.isArray(children)) {
                for(var i in children) {
                    el.appendChild(children[i]);
                }
            }
    
            return el;
        }
       
        /**
         * Add attributes to a HTML element
         */
        public static SetAttributes(el: HTMLElement, attributes: IAttributes) : void {
            for (var attr in attributes) {
                el.setAttribute(attr, attributes[attr]);
            }
        }

    }
    

};