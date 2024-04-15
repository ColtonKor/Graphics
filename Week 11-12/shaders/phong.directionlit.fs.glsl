precision mediump float;

uniform vec3 uLightDirection;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // diffuse contribution
    // todo #1 normalize the light direction and store in a separate variable
    vec3 normalLight = normalize(uLightDirection);
    // todo #2 normalize the world normal and store in a separate variable
    vec3 normalWorld = normalize(vWorldNormal);
    // todo #3 calculate the lambert term
    float lambert = dot(normalLight, normalWorld);

    // specular contribution
    // todo #4 in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 eye = normalize(vec3(uCameraPosition.x - vWorldPosition.x, uCameraPosition.y - vWorldPosition.y, uCameraPosition.z - vWorldPosition.z));
    // todo #5 in world space, calculate the reflection vector (normalized)
    float temp = lambert * 2.0;
    vec3 tempNormalWorld = vec3(normalWorld.x * temp, normalWorld.y * temp, normalWorld.z * temp);
    vec3 reflection = vec3(tempNormalWorld.x - normalLight.x, tempNormalWorld.y - normalLight.y, tempNormalWorld.z - normalLight.z);
    // todo #6 calculate the phong term
    float phong = pow(max(dot(reflection, eye), 0.0), 64.0);

    // combine
    // todo #7 apply light and material interaction for diffuse value by using the texture color as the material
    vec4 material = texture2D(uTexture, vTexcoords);
    vec3 light = vec3(1.0, 1.0, 1.0);
    // todo #8 apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
    vec3 sMaterial = vec3(0.3, 0.3, 0.3);


    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.1;
    vec3 diffuseColor = material.rgb * light * lambert;
    vec3 specularColor = light * sMaterial * phong;

    // todo #9
    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(finalColor, 1.0);
}

// EOF 00100001-10