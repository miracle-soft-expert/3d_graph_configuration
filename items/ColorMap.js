var ColorMap = function() {};

ColorMap.prototype.initialize = function() {
	this.obj = new THREE.Object3D();
	this.multiplier = 1;
	//variables
	var top = 100;
	var bot = 0;
	var uniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib.phong.uniforms,	{
			_TopCutoff        : { value: top },
			_BottomCutoff     : { value: bot },
			//obj coordinates :defines color limits
			_TopColorLimit    : { value: top },
			_BottomColorLimit : { value: bot },
			//obj coordinates  defines white and black limits
			_MaxHeight        : { value: top },
			_MinHeight        : { value: bot },
			//HSL colors top and bot
			_TopColorHSL      : { value: new THREE.Vector3(1, 0.8, 0.5)},
			_BottomColorHSL   : { value: new THREE.Vector3(0.58, 0.8, 0.5)},
			//
			emissive: { value: new THREE.Color(0x050505) },
			specular: { value: new THREE.Color(0x111111) },
			shininess: { value: 100 }
		}
	]);
	//
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		side 	: THREE.DoubleSide,
		vertexShader	: Shaders.vert,
		fragmentShader	: Shaders.frag,
		depthWrite	: true,
		lights		: true,
	});
	//
	this.color_map = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100, 312, 312),
		material);
	this.color_map.geometry.translate(0, 100, 0);
	this.color_map.geometry.rotateX(Math.PI * 0.5);
	this.color_map.rotation.x = -Math.PI * 0.5;
	this.color_map.scale.set(1, 1, 2);
	this.color_map.position.set(0, -100, 0);
	this.obj.add(this.color_map);
};

ColorMap.prototype.setUp = function() {
};
