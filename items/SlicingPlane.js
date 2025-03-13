var SlicingPlane = function() {};

SlicingPlane.prototype.setUp = function(someParameters) {
	this.obj = new THREE.Group;
	//axis
	if (!someParameters) {
		someParameters = {};
	}

	var geo = new THREE.PlaneGeometry(1, 0.99, 1, 1);
	geo.translate(0, 0.5, 0);
	//
	var mat2 = new THREE.MeshBasicMaterial({
			transparent : true,
			opacity 	: 1.0,
			visible : someParameters.visible,
			color: 0xffefef,
			side 		: THREE.DoubleSide,
			depthWrite 	: true,
			//polygonOffset : true,
			//polygonOffsetFactor : -1,
			//polygonOffsetUnits : 2
	});

	if (someParameters.visible) {
		mesh.visible = someParameters.visible;
	}

	var mesh = new THREE.Mesh(geo, mat2);
	this.mesh = mesh;
	this.obj.position += 0.25;

	this.obj.add(this.mesh);
};

SlicingPlane.prototype.setData = function(x_start, z_start, x, y, z) {
	this.x_start = x_start;
	this.z_start = z_start;
	this.obj.scale.set(x, y, z);
};

SlicingPlane.prototype.dispose = function() {
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
};

SlicingPlane.prototype.setPoints = function(a, index) {
	if (index) {
		this.mesh.geometry.vertices[0].x = a.x - 0.5 * this.x_start;
		this.mesh.geometry.vertices[2].x = a.x - 0.5 * this.x_start;
		this.mesh.geometry.vertices[0].z = a.y - 0.5 * this.z_start;
		this.mesh.geometry.vertices[2].z = a.y - 0.5 * this.z_start;
	}
	//
	else {
		this.mesh.geometry.vertices[1].x = a.x - 0.5 * this.x_start;
		this.mesh.geometry.vertices[3].x = a.x - 0.5 * this.x_start;
		this.mesh.geometry.vertices[1].z = a.y - 0.5 * this.z_start;
		this.mesh.geometry.vertices[3].z = a.y - 0.5 * this.z_start;
	}
	this.mesh.geometry.verticesNeedUpdate = true;
	this.mesh.renderOrder = 50;

	//this.mesh.geometry.elementsNeedUpdate = true;
	//this.mesh.geometry.uvsNeedUpdate = true;
	this.mesh.geometry.computeVertexNormals();
};

SlicingPlane.prototype.getPoints = function() {
	return (
		{
				a: {	x:this.mesh.geometry.vertices[0].x,
				y:this.mesh.geometry.vertices[0].z
			},
				b: {	x:this.mesh.geometry.vertices[2].x,
				y:this.mesh.geometry.vertices[2].z
			}
		});
};

SlicingPlane.prototype.setOpacity = function(aFloat) {
	this.mesh.material.opacity = aFloat;
};

SlicingPlane.prototype.getOpacity = function() {
	return (this.mesh.material.opacity);
};

SlicingPlane.prototype.setVisible = function(aBoolean) {
	this.mesh.material.visible = aBoolean;
	this.mesh.visible = aBoolean;
};

SlicingPlane.prototype.getVisible = function() {
	return this.mesh.visible;
};
