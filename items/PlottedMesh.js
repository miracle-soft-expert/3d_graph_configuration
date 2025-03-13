var PlottedMesh = function() {
};

PlottedMesh.prototype.load = function(data, parameters, grid, shaders, slicingPlane) {
	//setting up local parameters
	this.obj = new THREE.Object3D();

		var plottedMesh, plottedGeo, plottedMaterial, walls, wall, base, box, box_material;
		var x_length = data.cols;
		var y_length = data.rows;
		var max = data.zMax;
		var min = data.zMin;
		var z_length = max - min;
		//extra escale
		//var multiplier = x_length / ((z_length) * 2) ;
		var scale_g = 12;
		//how much we have to multiply 1 to be as much as the bigget between the x and the y.
		var scale_using =  (scale_g / Math.max(x_length, y_length));
		var relative_scale = Math.min(x_length, y_length) / Math.max(x_length, y_length);
		var relative_height = scale_g / z_length * 0.5;
		//multiplier *= scale_using;
		//var scale_suplement = scale_using * multiplier * 0.1;
		//external elements
		//multiplier *= relative_scale;
		var base_height = 0.02;

///////////////////////////////////////////////////////////////////////////////////
	//CREATING GRID ELEMENT
	var grid_params = {
		x_size		: x_length,
		y_size		: y_length,
		z_size		: (z_length / scale_using) * relative_height,
		min 		: min,
		max 		: max,
		scale 		: scale_using,
		pixelSize 	: data.pixelSize,
		base_height	: base_height,
		relative_height : relative_height
	};
	//
	grid.setUp(grid_params);
	//setting up box
	box_material = new THREE.MeshPhongMaterial({
			transparent : true,
			visible 	: parameters.showBox,
			color 		: parameters.box_color,
			opacity 	: 1.0,
			side 		: THREE.DoubleSide,
			depthWrite 	: true,
			polygonOffset : true,
			polygonOffsetFactor : 1,
			polygonOffsetUnits : 2
	});

	box = new THREE.Group();
	box.dispose = function() {
		var i = this.children.length;
		while (i--) {
			this.children[i].geometry.dispose();
			this.children[i].material.dispose();
		}
	};
	//setting up plotted mesh
	shaders.max = max;
	shaders.min = min;
	plottedMaterial = shaders.material;

	plottedGeo = new THREE.PlaneBufferGeometry(scale_g, scale_g, x_length - 1, y_length - 1);
	//
	plottedMesh = new THREE.Mesh(
		plottedGeo,
		plottedMaterial
	);
	plottedMesh.rotation.x = -Math.PI * 0.5;
	//setting up base
	base = new THREE.Mesh(new THREE.BoxGeometry(scale_g, base_height, scale_g),
	box_material);
	base.position.y -= base_height * 0.5;
	box.add(base);
	//setting up walls

	walls = [];
	for (var i = 0 ; i < 4 ; i++) {
		if (i < 2)
			wall = new THREE.Mesh(new THREE.PlaneBufferGeometry(scale_g, 1, x_length - 1, 1),
			box_material);
		else {
			wall = new THREE.Mesh(new THREE.PlaneBufferGeometry(scale_g, 1, y_length - 1, 1),
			box_material);
			wall.rotation.y = -Math.PI * 0.5;
		}
		walls.push(wall);
		box.add(wall);
	}

	//we turn the planes into the actual shape inside the data

	console.log(x_length, y_length);
	var y = y_length; while (y--) {
		var x = x_length; while (x--) {
			if (x === 0 || x === x_length - 1 || y === 0 || y === y_length - 1) {
				var val = data.zData[x + y * x_length];
				val = (val  >= data.zMin  ? (val  <= data.zMax ? val : max) : min) - min;
				if (y === 0) {
					walls[0].geometry.attributes.position.array[(x_length * 3) + x * 3 + 1] = 0;
					walls[0].geometry.attributes.position.array[x * 3 + 1 ] = val;
				}
			if (y === y_length - 1) {
				walls[1].geometry.attributes.position.array[(x_length * 3) + x * 3 + 1] = 0;
				walls[1].geometry.attributes.position.array[x * 3 + 1] = val;
			}
			if (x === 0) {
				walls[2].geometry.attributes.position.array[(y_length * 3) + y * 3 + 1] = 0;
				walls[2].geometry.attributes.position.array[y * 3 + 1] = val;
			}
			if (x === x_length - 1) {
				walls[3].geometry.attributes.position.array[(y_length * 3) + y * 3 + 1] = 0;
				walls[3].geometry.attributes.position.array[y * 3 + 1] = val;
			}
		}
		plottedGeo.attributes.position.array[(x + y * x_length) * 3 + 2] = data.zData[x + y * x_length] - min;
	}

  }
	//updating the buffers and creating normals
	plottedMesh.geometry.verticesNeedUpdate = true;
	plottedMesh.geometry.computeVertexNormals();
	i = 4;
	while (i--) {
		walls[i].geometry.computeVertexNormals();
	}
	//
	//SCALE AND POSITIONING OF THE ITEMS
	grid.obj3d.scale.set(scale_using, scale_using, scale_using);
	//grid.groupYRotateToCamera.scale.set(scale_using, scale_using, scale_using);
	//
	slicingPlane.setData(x_length, -y_length, scale_using, relative_height * z_length, scale_using);
	if (x_length > y_length) {
		base.scale.set(1, 1, relative_scale);
	}
	else {
		base.scale.set(relative_scale, 1, 1);
	}
	//
	if (x_length > y_length) {
		plottedMesh.scale.set(1, relative_scale, relative_height);
		i = 2;
		while (i--) {
			walls[i + 2].scale.set(relative_scale, relative_height, 1);
			walls[i]  .scale.set(1, relative_height, 1);
		}
		walls[1].position.z = relative_scale * .5 * scale_g;
		walls[0].position.z = -relative_scale * .5 * scale_g;
		walls[3].position.x = scale_g * .5;
		walls[2].position.x = -scale_g * .5;
	}
	else {
		plottedMesh.scale.set(relative_scale, 1, relative_height);
		i = 2;
		while (i--) {
			walls[i + 2].scale.set(1, relative_height, 1);
			walls[i]  .scale.set(relative_scale, relative_height, 1);
		}
		walls[1].position.z = scale_g * .5;
		walls[0].position.z = -scale_g * .5;
		walls[3].position.x = relative_scale * .5 * scale_g;
		walls[2].position.x = -relative_scale * .5 * scale_g;
	}

	parameters.reset_cam_suplement = (z_length * relative_height * 0.5);
	this.obj.matrixAutoUpdate  = false;
	this.obj.add(plottedMesh);
	this.plottedMesh = plottedMesh;
	box.matrixAutoUpdate  = false;
	box.updateMatrix();

	var set_visible = function(aBoolean) {
		plottedMaterial.visible = aBoolean;
	};

	var get_min = function() {
		return min;
	};
	var get_max = function() {
		return max;
	};
	var get_z_lenght = function() {
		return z_length;
	};

	var get_factor_scale = function() {
		return scale_using;
	};

	var set_scale = function(aFloat) {
		var factor = aFloat; //* scale_using;
		plottedMesh.scale.set(plottedMesh.scale.x, plottedMesh.scale.y, factor * relative_height);
		plottedMesh.updateMatrix();
		i = 4;
		while (i--) {
			walls[i].scale.set(walls[i].scale.x, factor * relative_height, walls[i].scale.z);
		}
	};

	var get_scale = function() {

	};

	var scale = new THREE.Vector3();
	var view_top = function() {
		box_material.visible = false;
		//
		scale.copy(this.obj.scale);
		//applying rendering
		this.obj.scale.set(scale.x * 20, 0.1, scale.y * 20);
		this.obj.updateMatrix();
	};
	var view_perspective = function(isBoxVisible) {
		this.obj.scale.copy(scale);
		this.obj.updateMatrix();
		box_material.visible = isBoxVisible;
	};
	var set_shading = function(shadingValue) {
		if (shadingValue)
			plottedMaterial.shading = THREE.FlatShading;
		else
			plottedMaterial.shading = THREE.SmoothShading;
		plottedMaterial.needsUpdate = true;
	};
	var set_box_visible = function(aBoolean) {
		box_material.visible = aBoolean;
	};

	var set_box_opacity = function(aFloatBetween0and1) {
		box_material.opacity = aFloatBetween0and1;
	};

	var set_plotted_mesh_shininess = function(aFloatBetween0and100) {
		shaders.setUniform({name : "shininess", value : aFloatBetween0and100});
	};

	var dispose = function() {
		plottedMesh.geometry.dispose();
		plottedMesh.material.dispose();
		plottedMesh = null;
		var i = box.children.length;
		while (i--) {
			box.children[i].geometry.dispose();
			box.children[i].material.dispose();
		}
		box = null;
	};

	this.setBoxOpacity = set_box_opacity;
	this.getMin = get_min;
	this.getMax = get_max;
	this.getZLenght = get_z_lenght;
	this.setVisible = set_visible;
	this.setBoxVisible = set_box_visible;
	this.getFactorScale = get_factor_scale;
	this.setScale = set_scale;
	this.getScale = get_scale;
	this.grid = grid;
	this.base = base;
	this.box = box;
	this.viewTop = view_top;
	this.setShading = set_shading;
	this.viewPerspective = view_perspective;
	this.setPlottedMeshShininess = set_plotted_mesh_shininess;
	this.dispose = dispose;
	//////////////////////////////////////////////////////////
};
