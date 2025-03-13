var Shaders = function() {};

Shaders.prototype.vert = `
#define PHONG1

varying vec3 vViewPosition;
varying vec3 vWorldPosition;


#ifndef FLAT_SHADED

    varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

    vNormal = normalize( transformedNormal );

#endif

    #include <begin_vertex>
    #include <displacementmap_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    vViewPosition = - mvPosition.xyz;

    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <shadowmap_vertex>

  vWorldPosition = transformed;
}
`;

Shaders.prototype.setUp = function() {
    this.uniforms = THREE.UniformsUtils.merge([
        THREE.ShaderLib.phong.uniforms, {
          //obj coordinates
          _TopCutoff        : { value: 0},
          _BottomCutoff     : { value: 0},
          //obj coordinates :defines color limits
          _TopColorLimit    : { value: 0},
          _BottomColorLimit : { value: 0},
          //obj coordinates  defines white and black limits
          _MaxHeight        : { value: 0},
          _MinHeight        : { value: 0},
          _ColorGradient  : { value : new THREE.Texture()},
          //HSL colors top and bot
          emissive: { value: new THREE.Color(0x050505) },
          specular: { value: new THREE.Color(0x111111) },
          shininess: { value: 100 },
          depthWrite : {value : 1}
        }
      ]);

      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        side : THREE.DoubleSide,
        vertexShader: this.vert,
        fragmentShader: this.frag,
        depthWrite: true,
        alphaTest : 0.1,
        lights: true,
        transparent: true,
      });
      var top = 100;
      var bot = 0;
      this.top = top;
      this.bot = bot;
      this.boxMaterial = this.material.clone();
      this.boxMaterial.uniforms._TopCutoff = top;
      this.boxMaterial.uniforms._BottomCutoff = bot;
      this.boxMaterial.uniforms._TopColorLimit.value    = top * 0.9;
	this.boxMaterial.uniforms._BottomColorLimit.value = bot * 0.05;
	this.boxMaterial.uniforms._MaxHeight.value        = top * 0.95;
	this.boxMaterial.uniforms._MinHeight.value        = bot * 0.0;
	//this.boxMaterial.transparent = false;
	this.canvas = document.createElement('canvas');
	this.canvas.width  = 200;
	this.canvas.height = 200;
	this.context = this.canvas.getContext('2d');
	this.canvasTexture = new THREE.CanvasTexture(this.canvas);
};

Shaders.prototype.setColorGradient = function(aColorGradient) {
	this.material.uniforms._ColorGradient.value = aColorGradient;
	this.boxMaterial.uniforms._ColorGradient.value = aColorGradient;
};

Shaders.prototype.setUniform = function(someParameters) {
	if (this.uniforms[someParameters.name].value.copy) {
		this.uniforms[someParameters.name].value.copy(someParameters.value);
		this.boxMaterial.uniforms[someParameters.name].value.copy(someParameters.value);
	}
	else {
		this.uniforms[someParameters.name].value = someParameters.value;
		this.boxMaterial.uniforms[someParameters.name].value = (Number(someParameters.value) / (this.max - this.min)) * this.top;
	}

};

Shaders.prototype.setColorGradientByArray = function(aColorGradientArray) {
  this.context.clearRect(0, 0, 200, 200);

	var grad = this.context.createLinearGradient(200, 0, 0, 0);
	for (var i = 0; i < aColorGradientArray.length; i++) {
		var cr = aColorGradientArray[i];
		grad.addColorStop(cr.stop,
			'rgba(' + cr.r + ',' + cr.g + ',' + cr.b + ',' + cr.a + ')');
	}
	this.context.fillStyle = grad;
	this.context.fillRect(0, 0, 200, 200);
	this.canvasTexture.needsUpdate = true;
	var _ColorGradient = this.canvasTexture;

	this.material.uniforms._ColorGradient.value = _ColorGradient;
	this.boxMaterial.uniforms._ColorGradient.value = _ColorGradient;
};

Shaders.prototype.frag = `
#define PHONG1

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;


#include <common>
#include <packing>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>


//###################################################################
//######################## BEGIN UNIFORMS ###########################

uniform sampler2D _ColorGradient;

varying vec3 vWorldPosition;
uniform float _TopCutoff;
uniform float _BottomCutoff;

uniform float _TopColorLimit;
uniform float _BottomColorLimit;

uniform float _MinHeight;
uniform float _MaxHeight;

uniform vec3 _TopColorHSL;
uniform vec3 _BottomColorHSL;


//######################### UNIFORMS END ############################
//###################################################################

float linear_map(float value,
                 float from_range_start_value,
                 float from_range_end_value,
                 float to_range_start_value,
                 float to_range_end_value)
{
    return ((value - from_range_start_value)/ (from_range_end_value - from_range_start_value)) * (to_range_end_value - to_range_start_value) + to_range_start_value;
}


vec4 calculate_diffuse_color()
{

  float top_cutoff    = max(_TopCutoff, _BottomCutoff);
  float bottom_cutoff = min(_TopCutoff, _BottomCutoff);

  float y = vWorldPosition.z;
  float alpha = 1.0;
  if(step( y, top_cutoff ) < 0.5)
      alpha = 0.0;
  if(step( bottom_cutoff, y ) < 0.5)
      alpha = 0.0;
  //float top_limit     = max(_TopColorLimit, _BottomColorLimit);
  //float bottom_limit  = min(_TopColorLimit, _BottomColorLimit);
  vec4 color = texture2D(_ColorGradient, vec2(linear_map(y, _MinHeight, _MaxHeight, 0.0, 1.0),0.0));
  return vec4(color.rgb, color.a * alpha);
  //return vec4(y,y,y,1.0);
}
void main() {

    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;
    diffuseColor.rgba = calculate_diffuse_color();
    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <normal_flip>
    #include <normal_fragment>
    #include <emissivemap_fragment>

    // accumulation
    #include <lights_phong_fragment>
    #include <lights_template>

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

    #include <envmap_fragment>

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #include <premultiplied_alpha_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
}
`;
