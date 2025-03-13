var Text = function() {};

var __text_geo, __text_mat;
var __init_text = true;

Text.prototype.initialize = function(params) {
	//
	if (__init_text) {
		__init_text = false;
		__text_geo = new THREE.PlaneGeometry(1, 1, 1);
		__text_mat = new THREE.MeshBasicMaterial({
			transparent : true,
			side : THREE.DoubleSide,
			alphaTest : 0.5,
			depthWrite : true
		});
	}
	this.obj3d = new THREE.Object3D();
	//
	//initializing text mesh, each text shares the same geometry, but a clone
	//of their material. This saves geo data, but let you draw different texts.
	this.mesh = new THREE.Mesh(__text_geo, __text_mat.clone());
	//if we want the text to be readeable from both faces...
	if (params && params.double_texture) {
		this.mesh.material.side = THREE.FrontSide;
		this.mesh.material.needsUpdate = true;
		//
		var mesh_2 = this.mesh.clone();
		mesh_2.rotation.y = Math.PI;
		this.mesh.add(mesh_2);
	}
	this.obj3d.add(this.mesh);
	//then we set up the canvas that let us create the canvas texture
	this.canvas	= document.createElement("canvas");
	this.context2d = this.canvas.getContext("2d");
	//
	this.canvas.height			=	68;
	this.context2d.lineWidth 		=	0.5;
	//and some constants values
	this.innerScale = 0.35 * (params.scale || 1);
	this.h = 16;
	this.position = params.position || 0 ;
	this.scale = params.scale;
	this.color = params.color || 'black';
	this.anisotropy = params.anisotropy || 1;
};

Text.prototype.changeVal = function(new_val) {
	this.text = "" + new_val;

	//
	var width = 45 * this.text.length * this.scale;
	var height = 68 * this.scale;
	//
	this.canvas.width = width;
	this.canvas.height = height;
	this.context2d.clearRect(0, 0, width, height);
	this.context2d.font 			= 	'lighter ' + 64 * this.scale + 'px sans-serif';
	this.context2d.textAlign 		= 	'center';
	this.context2d.textBaseline	= 	'bottom';
  this.context2d.strokeStyle 	= 	this.color;
  this.context2d.fillStyle 		= 	this.color;
	this.context2d.fillText(this.text, width / 2, height);
	this.context2d.strokeStyle = 	this.color;
	this.context2d.strokeText(this.text, width / 2, height);
	//
	if (this.mesh.material.map) {
		this.mesh.material.map.dispose();
	}
	//
	this.mesh.material.map = new THREE.Texture(this.canvas);
	this.mesh.material.map.generateMipmaps = false;
	this.mesh.material.map.magFilter = THREE.LinearFilter;
	this.mesh.material.map.minFilter = THREE.LinearFilter;
	this.mesh.material.map.anisotropy = this.anisotropy;
	this.mesh.material.map.needsUpdate = true;
	//
	this.mesh.scale.set(this.h * this.text.length * this.innerScale * this.scale, 32 * this.innerScale * this.scale, 1);
	this.mesh.position.x = 0.45 * this.h * this.text.length * this.innerScale * this.position * this.scale;
};

Text.prototype.moveValue = function(extra) {
	var new_val = (Number(this.value) + extra).toFixed(2);
	this.changeVal(new_val);
};

Text.prototype.setScale = function(aFloat) {
	this.scale = aFloat;
	this.changeVal(this.value);
};

Text.prototype.setUp = function(params) {
	if (params.scale) {
		this.scale = params.scale;
	}
	this.value = params.text;
	this.changeVal(this.value);
};

Text.prototype.getText = function(aFloat) {
	return this.text;
};
