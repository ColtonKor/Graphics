precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    //vec3 lightDirection01 = normalize(uLightPosition);
    vec3 lightDirection01 = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal01 = normalize(vWorldNormal);
    vec3 directionToEye01 = normalize(uCameraPosition - vWorldPosition);
    vec3 reflection01 = 2.0 * dot(worldNormal01, lightDirection01) * worldNormal01 - lightDirection01;

    float lambert = max(dot(worldNormal01, lightDirection01), 0.0);
    float reflectionDotEyeDir = max(dot(reflection01, directionToEye01), 0.0);
    float specularIntensity = pow(reflectionDotEyeDir, 64.0);

    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    vec3 ambient = albedo * 0.1;
    vec3 diffuseColor = albedo * lambert;
    vec3 specularColor = vec3(0.3, 0.3, 0.3) * specularIntensity;
    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(finalColor, 1.0);
}
