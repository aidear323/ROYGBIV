precision lowp float;
precision lowp int;

#define LOG2 1.442695
#define ALPHA_TEST 0.5

varying vec3 vColor;
varying vec2 vUV;
varying float vAlpha;
varying float hasDiffuseFlag;
varying float hasAlphaFlag;
varying float hasAOFlag;
varying float hasEmissiveFlag;

uniform vec4 fogInfo;
uniform mat3 textureMatrix;
uniform sampler2D diffuseMap;
uniform sampler2D alphaMap;
uniform sampler2D aoMap;
uniform sampler2D emissiveMap;
uniform float aoIntensity;
uniform float emissiveIntensity;


void main(){

  vec2 transformedUV = vUV;

  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);

  if (hasDiffuseFlag > 0.0){
    diffuseColor = texture2D(diffuseMap, transformedUV);
  }

  gl_FragColor = vec4(vColor, vAlpha) * diffuseColor;

  if (hasAlphaFlag > 0.0){
    float val = texture2D(alphaMap, transformedUV).g;
    gl_FragColor.a *= val;
    if (val <= ALPHA_TEST){
      discard;
    }
  }

  if (hasAOFlag > 0.0){
    float ao = (texture2D(aoMap, transformedUV).r - 1.0) * aoIntensity + 1.0;
    gl_FragColor.rgb *= ao;
  }

  if (hasEmissiveFlag > 0.0){
    vec4 emissiveColor = texture2D(emissiveMap, transformedUV);
    vec3 totalEmissiveRadiance = vec3(emissiveIntensity, emissiveIntensity, emissiveIntensity);
    totalEmissiveRadiance *= emissiveColor.rgb;
    gl_FragColor.rgb += totalEmissiveRadiance;
  }

  if (fogInfo[0] >= -50.0){
    float fogDensity = fogInfo[0];
    float fogR = fogInfo[1];
    float fogG = fogInfo[2];
    float fogB = fogInfo[3];
    float z = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = exp2(-fogDensity * fogDensity * z * z * LOG2);
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    gl_FragColor = vec4(mix(vec3(fogR, fogG, fogB), gl_FragColor.rgb, fogFactor), gl_FragColor.a);
  }

}