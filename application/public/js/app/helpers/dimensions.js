/**
 * Created by rozsival on 11/04/15.
 */

var Dimensions = (function() {

    function Dimensions(width, height) {
        if(typeof width === "object") {
            this.width = width.width;
            this.height= width.height;
        } else {
            this.width = width;
            this.height = height;
        }
    }

    return Dimensions;

})();