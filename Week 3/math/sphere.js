/*
 * An object type representing an implicit sphere.
 *
 * @param center A Vector3 object representing the position of the center of the sphere
 * @param radius A Number representing the radius of the sphere.
 * 
 * Example usage:
 * var mySphere = new Sphere(new Vector3(1, 2, 3), 4.23);
 * var myRay = new Ray(new Vector3(0, 1, -10), new Vector3(0, 1, 0));
 * var result = mySphere.raycast(myRay);
 * 
 * if (result.hit) {
 *   console.log("Got a valid intersection!");
 * }
 */

var Sphere = function(center, radius) {
  // Sanity checks (your modification should be below this where indicated)
  if (!(this instanceof Sphere)) {
    console.error("Sphere constructor must be called with the new operator");
  }

  this.center = center;
  this.radius = radius;

  // todo - make sure this.center and this.radius are replaced with default values if and only if they
  // are invalid or undefined (i.e. center should be of type Vector3 & radius should be a Number)
  // - the default center should be the zero vector
  // - the default radius should be 1
  // YOUR CODE HERE
  if(center == null){
    this.center = new Vector3(0,0,0);
  }
  if(radius == null){
    this.radius = 1;
  }

  // Sanity checks (your modification should be above this)
  if (!(this.center instanceof Vector3)) {
    console.error("The sphere center must be a Vector3");
  }

  if ((typeof(this.radius) != 'number')) {
    console.error("The radius must be a Number");
  }
};

Sphere.prototype = {
  
  //----------------------------------------------------------------------------- 
  raycast: function(r1) {
    // todo - determine whether the ray intersects has a VALID intersection with this
	//        sphere and if so, where. A valid intersection is on the is in front of
	//        the ray and whose origin is NOT inside the sphere

    // Recommended steps
    // ------------------
    // 0. (optional) watch the video showing the complete implementation of plane.js
    //    You may find it useful to see a different piece of geometry coded.

    // 1. review slides/book math
    
    // 2. identity the vectors needed to solve for the coefficients in the quadratic equation

    // 3. calculate the discriminant
    
    // 4. use the discriminant to determine if further computation is necessary 
    //    if (discriminant...) { ... } else { ... }

    // 5. return the following object literal "result" based on whether the intersection
    //    is valid (i.e. the intersection is in front of the ray AND the ray is not inside
    //    the sphere)
    //    case 1: no VALID intersections
    //      var result = { hit: false, point: null }
    //    case 2: 1 or more intersections
    //      var result = {
    //        hit: true,
    //        point: 'a Vector3 containing the CLOSEST VALID intersection',
    //        normal: 'a vector3 containing a unit length normal at the intersection point',
    //        distance: 'a scalar containing the intersection distance from the ray origin'
    //      }

    // An object created from a literal that we will return as our result
    // Replace the null values in the properties below with the right values
    var result = {
      hit: null,      // should be of type Boolean
      point: null,    // should be of type Vector3
      normal: null,   // should be of type Vector3
      distance: null, // should be of type Number (scalar)
    };

    var inside = new Vector3().fromTo(this.center, r1.origin);
    if(inside.length() < this.radius){
      result.hit = false;
      return result;
    }

    var aDirection = r1.direction.clone();
    var a = aDirection.dot(aDirection);

    var bDirection = r1.direction.clone();
    bDirection = bDirection.multiplyScalar(2);
    var bOrigin = r1.origin.clone();
    var bPart2 = bOrigin.subtract(this.center);
    var b = bDirection.dot(bPart2);

    var cOrigin = r1.origin.clone();
    var cVector = cOrigin.subtract(this.center);
    var cDot = cVector.dot(cVector)
    var cRadius = this.radius * this.radius;
    var c = cDot - cRadius;

    var quadB1 = b*b;
    var quadA1 = a*c;
    quadA1 = quadA1*4;
    var discriminant = quadB1 - quadA1;

    if(discriminant < 0){
      result.hit = false;
      return result;
    } else if(discriminant == 0){
      var equal = -b/(2*a);
      if(equal > 0){
        var alpha = r1.origin.clone();
        var beta = r1.direction.clone();
        alpha = alpha.add(beta.multiplyScalar(equal));

        result.hit = true;
        result.point = alpha;
        result.normal = new Vector3().fromTo(this.center, alpha).normalize();
        result.distance = equal;
        return result;
      } else {
        result.hit = false;
        return result;
      }
    } else {
      discriminant = Math.sqrt(discriminant);
      var pos = (-b+discriminant)/(2*a);
      var neg = (-b-discriminant)/(2*a);

      if((pos < 0 && neg < 0)){
        result.hit = false;
        return result;
      }

      var alpha1 = r1.origin.clone();
      var alpha2 = r1.direction.clone();
      alpha1 = alpha1.add(alpha2.multiplyScalar(pos));

      var alpha3 = r1.origin.clone();
      var alpha4 = r1.direction.clone();
      alpha3 = alpha3.add(alpha4.multiplyScalar(neg));

      result.hit = true;
      if(neg < pos){
        result.point = alpha3;
        result.normal = new Vector3().fromTo(this.center, alpha3).normalize();
        result.distance = neg;
        return result;
      } else if (pos < neg){
        result.point = alpha1;
        result.normal = new Vector3().fromTo(this.center, alpha1).normalize();
        result.distance = pos;
        return result;
      }
    }
  }
}

// EOF 00100001-10