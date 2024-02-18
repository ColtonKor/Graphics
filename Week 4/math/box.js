var Box = function(min, max) {
    // sanity checks -----------
    if (!(this instanceof Box)) {
      console.error("Box constructor must be called with the new operator");
    }
  
    this.min = min;
    this.max = max;


    if (min === undefined) {
      this.min = new Vector3(0, .5, 0);
    }
    if (max === undefined) {
      this.max = new Vector3(0, 0.75, 0);
    }
};
  
Box.prototype = {
    //----------------------------------------------------------------------------- 
    raycast: function(ray) {
      var result = {
        hit: false,      // Initialize as false
        point: null,    // Will be set if an intersection occurs
        normal: null,   // Will be set if an intersection occurs
        distance: null, // Will be set if an intersection occurs
    };

    var xMin = (this.min.x - ray.origin.x) / ray.direction.x;
    var yMin = (this.min.y - ray.origin.y) / ray.direction.y;
    var zMin = (this.min.z - ray.origin.z) / ray.direction.z;

    var min = Math.max(xMin, yMin, zMin);

    var xMax = (this.max.x - ray.origin.x) / ray.direction.x;
    var yMax = (this.max.y - ray.origin.y) / ray.direction.y;
    var zMax = (this.max.z - ray.origin.z) / ray.direction.z;

    var max = Math.min(xMax, yMax, zMax);

    if(max >= min){
      result.hit = true;
      var temp = ray.direction.clone().multiplyScalar(min).add(ray.origin);
      result.point = temp;
      result.distance = min;
    }

    return result;
  }
}
  // EOF 00100001-10