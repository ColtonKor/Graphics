var Cylinder = function(axis, radius, height) {
    // sanity checks -----------
    if (!(this instanceof Cylinder)) {
      console.error("Cylinder constructor must be called with the new operator");
    }
  
    this.axis = axis;
    this.radius = radius;
    this.height = height;


    if (axis === undefined) {
        this.axis = new Vector3(0, .5, 0);
    }
    if (radius === undefined) {
        this.radius = .2;
    }
    if(height == undefined){
        this.height = .4;
    }
};
  
Cylinder.prototype = {
    //----------------------------------------------------------------------------- 
    raycast: function(ray) {
      var result = {
        hit: false,      // Initialize as false
        point: null,    // Will be set if an intersection occurs
        normal: null,   // Will be set if an intersection occurs
        distance: null, // Will be set if an intersection occurs
    };
    var a = (ray.direction.x*ray.direction.x)+(ray.direction.z*ray.direction.z);
    var b = 2*((ray.origin.x*ray.direction.x)+(ray.origin.z*ray.direction.z));
    var c = ((ray.origin.x*ray.origin.x)+(ray.origin.z*ray.origin.z)-(this.radius*this.radius));

    var discriminant = (b*b)-(4*(a * c));

    if(discriminant < 0){
        return result;
    } else if(discriminant == 0){
        var quad = (-b)/(2*a);
        result.hit = true;
        result.point = origin.add(direction.multiplyScalar(quad));
        result.distance = quad;
        return result;
    } else {
        var pos = (-b + Math.sqrt(discriminant))/(2*a);
        var neg = (-b - Math.sqrt(discriminant))/(2*a);

        if((pos < 0 && neg < 0)){
            result.hit = false;
            return result;
        }

        var origin = ray.origin.clone();
        var direction = ray.direction.clone();
        var tempPos = origin.add(direction.multiplyScalar(pos));
        var tempNeg = origin.add(direction.multiplyScalar(neg));

        if(tempNeg.y > this.height || tempNeg.y < this.axis.y){
            result.hit = false;
            return result;
        }

        if(tempPos.y > this.height || tempPos.y < this.axis.y){
            result.hit = false;
            return result;
        }

        if(neg < pos){
            result.hit = true;
            result.point = tempNeg;
            result.distance = neg;
            return result;
        } else if (pos < neg){
            result.hit = true;
            result.point = tempPos;
            result.distance = pos;
            return result;
        }
        
    }
  }
}
  // EOF 00100001-10