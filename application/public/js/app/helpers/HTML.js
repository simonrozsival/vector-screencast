/**
 * Created by rozsival on 12/04/15.
 */


/**
 * HTML helper object.
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function}}
 */
var HTML = {

    createElement: function(name, attributes, children) {
        var el = document.createElement(name);
        HTML.setAttributes(el, attributes);
        if(!!children && Array.isArray(children)) {
            for(var i in children) {
                el.appendChild(children[i]);
            }
        }

        return el;
    },

    setAttributes: function(el, attributes) {
        for (var attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
    }


};