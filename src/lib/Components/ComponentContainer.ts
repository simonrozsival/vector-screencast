import { Component, ComponentFactory, ComponentParams } from './Component';
import { Panel } from '../UI/BasicElements';
import VideoEvents from '../Helpers/VideoEvents';

//export namespace VectorScreencast.Components {
	
	export default class ComponentContainer {
		
		/** Contents of this container */
		protected components: { [index: string]: Component };
		
		protected componentFactories: { [index: string]: ComponentFactory };
		
		constructor(protected uiLayer: Panel, protected events: VideoEvents) {
			this.components = {};
			this.componentFactories = {};
		}
		
		AddComponent(type: string, id: string, params: ComponentParams) {
			if(!!this.components[id]) {
				throw new Error(`ComponentContainer already contains a component with ID of '${id}'`);
			}		
			
			if(!this.componentFactories[type]) {
				throw new Error(`ComponentContainer does not have any factory for type '${type}'`);
			}
			
			let c = this.components[id] = this.componentFactories[type](id, params, this.events);
			this.uiLayer.AddChild(c.GetUIElement()); // attach the HTML to the DOM
		}
		
		RemoveComponent(id: string) {
			let c: Component = this.components[id];
			if(!c) { throw new Error(`ComponentContainer does not contain any component with an ID of '${id}'`); }
			
			this.uiLayer.RemoveChild(c.GetUIElement());
		}
		
		ExecuteCommand(targetId: string, cmd: string, params: ComponentParams) {
			let c: Component = this.components[targetId];
			if(!c) { throw new Error(`ComponentContainer does not contain any component with an ID of '${targetId}'`); }
			
			c.ExecuteCommand(cmd, params);
		}
		
		RegisterFactory(type: string, factory: ComponentFactory) {
			if(!!this.componentFactories[type]) {
				throw new Error(`ComponentContainer already contains a component factory for type '${type}'`);
			}
			this.componentFactories[type] = factory;
		}
	}	
	
//}