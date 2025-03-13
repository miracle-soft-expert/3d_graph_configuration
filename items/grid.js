var Grid = function() {};

Grid.prototype.dispose = function() {
	var i = this.obj3d.children.length;
	while (i--) {
		if (this.obj3d.children[i].children.length === 0) {
			this.obj3d.children[i].geometry.dispose();
			this.obj3d.children[i].material.dispose();
		}
		else {
			var j = this.obj3d.children[i].children.length;
			while (j--) {
				this.obj3d.children[i].children[j].geometry.dispose();
				this.obj3d.children[i].children[j].material.map.dispose();
				this.obj3d.children[i].children[j].material.dispose();
			}
		}
	}
};

Grid.prototype.initialize = function(params) {
	//CONSTANTS
	var anisotropy = params.anisotropy;
	var config = params.config || {};
	//config is set up in the initialization phase
	this.config = {
		unitXY : config.unitXY  || 'micron',
		unitZ : config.unitZ  || 'angstrom',
		numberFormat : config.numberFormat  || 'significant',
		numberFormatValue : config.numberFormatValue  || 1,
		displayTrailingZeros : (config.displayTrailingZeros !== undefined ? config.displayTrailingZeros : true)
	};
	this.tick_data = undefined;
	/*
		unitXY: string (milimeter/micron/inch/milinch/microinch),
    	unitZ: string (auto/milimeter/micron/nanometer/angstorm/milinch/microinch),
    	numberFormat: string (significant/decimal),
    	numberFormatValue: int,
    	displayTrailingZeros: bool
    	*/
		switch (this.config.unitXY) {
			//case "milimeter":
			//    this.config.unitXY = "mm";
			//    break;
			case "micron":
			    this.config.unitXY = "μm";
			    break;
			case "inch":
			    this.config.unitXY = "in";
			    break;
			case "milinch":
			    this.config.unitXY = "mil";
			    break;
			case "microinch":
			    this.config.unitXY = "µin";
			    break;
			default:
			    this.config.unitXY = "mm";
		}

		switch (this.config.unitZ) {
			//case "auto":
			//    this.config.unitZ = "mm";
			//    break;
			//case "milimeter":
			//    this.config.unitZ = "micron";
			//    break;
			case "micron":
			    this.config.unitZ = "μm";
			    break;
			case "nanometer":
			    this.config.unitZ = "nm";
			    break;
			case "angstrom":
			    this.config.unitZ = "Å";
			    break;
			case "milinch":
			    this.config.unitZ = "mil";
			    break;
			case "microinch":
			    this.config.unitZ = "µin";
			    break;
			default:
			    this.config.unitZ = "mm";
		}
		switch (this.config.numberFormat) {
			//case "auto":
			//    this.config.numberFormat = "significant";
			//    break;
			case "decimal":
			    this.config.numberFormat = "decimal";
			    break;
			default:
			    this.config.numberFormat = "significant";
		}

	this.GRID_DIVISIONS = params.grid_divisions || 6;
	this.XZ_GRID_COUNT = 10;
	this.Y_GRID_COUNT = 10;
	this.BOTTOM_SPACE = 5;
	this.MAX_CANT_MARKS = 10;

	//main object
	this.obj3d = new THREE.Object3D();
	this.groupYRotateToCamera = new THREE.Group();
	this.obj3d.add(this.groupYRotateToCamera);
	this.fourPositions = [];
	//the lines that generate the cage
	//
	this.cageX = [];
	this.cageY = [];
	this.cageZ = [];
	//bottom grid lines
	this.gridX = [];
	this.gridZ = [];
	this.gridXMarks = [];
	this.gridZMarks = [];
	this.gridXShorts = [];
	this.gridZShorts = [];
	//y grid lines
	this.gridYZ = [];
	this.gridYX = [];
	//
	this.gridYXShorts = [];
	this.gridYXMarks = [];
	//text references
	this.references = [];
	this.referencesY = [];
	//text values
	this.textX  = [];
	this.textZ  = [];
	this.textYZ = [];
	this.textYX = [];
	//main material
	var lanceMatLine = new THREE.LineBasicMaterial({
		color : 0x222222
	});
	var line_geometry = new THREE.Geometry();
	line_geometry.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	);
	var lanceXGeo		=  line_geometry.clone();
	lanceXGeo.vertices[0].set(0.5, 0, 0);
	lanceXGeo.vertices[1].set(-0.5, 0, 0);

	var lanceYGeo		=  line_geometry.clone();
	lanceYGeo.vertices[0].set(0, 0.5, 0);
	lanceYGeo.vertices[1].set(0, -0.5, 0);

	var lanceZGeo		=  line_geometry.clone();
	lanceZGeo.vertices[0].set(0, 0, 0.5);
	lanceZGeo.vertices[1].set(0, 0, -0.5);
	//
	var lanceX = new THREE.Line(lanceXGeo, lanceMatLine);
	var lanceY = new THREE.Line(lanceYGeo, lanceMatLine);
	var lanceZ = new THREE.Line(lanceZGeo, lanceMatLine);
	//
	//var lanceYShort = new THREE.Mesh( lanceYGeoShort, lanceMat);
	var lanceX_;
	var lanceY_;
	var lanceZ_;
	//
	var sign, i, j;
	//generating the cage
	for (i = 0 ; i < 4 ; i ++) {
		lanceX_ = lanceX.clone();
		this.obj3d.add(lanceX_);
		this.cageX.push(lanceX_);
		//
		lanceY_ = lanceY.clone();
		this.obj3d.add(lanceY_);
		this.cageY.push(lanceY_);
		//
		lanceZ_ = lanceZ.clone();
		this.obj3d.add(lanceZ_);
		this.cageZ.push(lanceZ_);
	}
	//generating the grid for base, shorts and longs
	for (i = 0 ; i < this.XZ_GRID_COUNT + 1; i++) {
		lanceX_ = lanceX.clone();
		this.obj3d.add(lanceX_);
		this.gridX.push(lanceX_);
		//
		lanceZ_ = lanceZ.clone();
		this.obj3d.add(lanceZ_);
		this.gridZ.push(lanceZ_);
	}

	//generating the grid for base, shorts and longs
	for (i = 0 ; i < this.XZ_GRID_COUNT * 2; i++) {
		lanceX_ = lanceX.clone();
		this.obj3d.add(lanceX_);
		this.gridXShorts.push(lanceX_);
		//
		lanceZ_ = lanceZ.clone();
		this.obj3d.add(lanceZ_);
		this.gridZShorts.push(lanceZ_);
	}

	//generating the grid for base, shorts and longs
	for (i = 0 ; i < this.XZ_GRID_COUNT * this.MAX_CANT_MARKS * 2; i++) {
		lanceX_ = lanceX.clone();
		this.obj3d.add(lanceX_);
		this.gridXMarks.push(lanceX_);
		//
		lanceZ_ = lanceZ.clone();
		this.obj3d.add(lanceZ_);
		this.gridZMarks.push(lanceZ_);
	}
	//generating Y grid for 4 faces, shorts and longs
	for (i = 0 ; i < this.Y_GRID_COUNT * 2; i++) {
		lanceZ_ = lanceZ.clone();
		this.obj3d.add(lanceZ_);
		this.gridYZ.push(lanceZ_);
		//
		lanceX_ = lanceX.clone();
		this.obj3d.add(lanceX_);
		this.gridYX.push(lanceX_);
		//
		lanceX_ = lanceX.clone();
		this.obj3d.add(lanceX_);
		this.gridYX.push(lanceX_);
	}
	//generating Y grid for 4 faces only shorts
	for (i = 0 ; i < this.Y_GRID_COUNT; i++) {
		lanceX_ = lanceX.clone();
		this.groupYRotateToCamera.add(lanceX_);
		this.gridYXShorts.push(lanceX_);
	}

	for (i = 0 ; i < this.Y_GRID_COUNT * this.MAX_CANT_MARKS; i++) {
		lanceX_ = lanceX.clone();
		this.groupYRotateToCamera.add(lanceX_);
		this.gridYXMarks.push(lanceX_);
	}

	var text;
	i = this.XZ_GRID_COUNT * 2;
	while (i--) {
		//for (j = 0; j < 2; j++) {
		sign = (this.XZ_GRID_COUNT > i ? 1 : -1);
			//Y PART
			text = new Text();
			text.initialize({position : 0, anisotropy : anisotropy});
			this.obj3d.add(text.obj3d);
			this.textZ.push(text);
			text.obj3d.rotation.x = Math.PI * 0.5;
			text.obj3d.rotation.z = Math.PI * 0.5 * -sign;
			text.obj3d.rotation.x = -Math.PI * 0.5;
			//X PART
			text = new Text();
			text.initialize({ position : 0, anisotropy : anisotropy});
			this.obj3d.add(text.obj3d);
			this.textX.push(text);
			text.obj3d.rotation.y = Math.PI;
			text.obj3d.rotation.x = Math.PI * 0.5;
			if (sign < 0)
				text.obj3d.rotation.z = Math.PI;
		//}
	}
	i  = this.Y_GRID_COUNT;
	while (i--) {
		//Y PART
		text = new Text();
		text.initialize({ size: 0.8, position : -1, anisotropy : anisotropy});
		this.textYX.push(text);
		text.obj3d.rotation.y = Math.PI;
		this.groupYRotateToCamera.add(text.obj3d);
		//
	}

	for (j = 0; j < 2; j++) {
		sign = (j === 0 ? 1 : -1);
		///distance numbers
		//Y TEXT
		text = new Text();
		text.initialize({size : 1.2, position : 0, anisotropy : anisotropy});
		this.obj3d.add(text.obj3d);
		text.obj3d.rotation.x = Math.PI * 0.5;
		text.obj3d.rotation.z = Math.PI * 0.5 * sign;
		text.obj3d.rotation.x = -Math.PI * 0.5;
		this.references.push(text);
		//X TEXT
		text = new Text();
		text.initialize({size : 1.2, position : 0, anisotropy : anisotropy});
		this.obj3d.add(text.obj3d);
		text.obj3d.rotation.y = Math.PI;
		text.obj3d.rotation.x = Math.PI * 0.5;
		if (sign < 0)
			text.obj3d.rotation.z = Math.PI;
		this.references.push(text);
	}
	//Y TEXT
	text = new Text();
	text.initialize({size : 1.2, position : 0, anisotropy : anisotropy});
	this.groupYRotateToCamera.add(text.obj3d);
	if (sign === 1)
		text.obj3d.rotation.y = Math.PI;
	text.obj3d.rotation.z = Math.PI * 0.5;
	text.obj3d.rotation.y = Math.PI;

	this.referencesY.push(text);
	//
};

Grid.prototype.setUp = function(params) {
	//PARAMS : x_size, y_size, z_size, min, max, (this.GRID_DIVISIONS)
	//CONSTANTS
	//var Y_GRID_COUNT = this.Y_GRID_COUNT;
	//creating local variables
	var scale = params.scale;
	var scale_using = 0.2 + (1 / scale) * 0.03;
	this.scale_using = scale_using;
	this.relative_height = params.relative_height;
	//
	var groupY = [];
	var groupYText = [];
	var scaleableObjects = [];
	var reposicionableObjects = [];
	//
	var x = params.x_size;
	var y = params.z_size;
	var z = params.y_size;
	//
	this.x = x;
	this.y = y;
	this.z = z;
	//
	var min	= params.min;
	var max = params.max;
	this.min = min;
	this.max = max;
	//
	var pixelSize	= params.pixelSize;
	var base_height = params.base_height;
	this.base_height = base_height;
	//
	var sign, i, j;
	//var context = this;
	///////////////////////////////////////////////
	//
	//		GENERATING THE CAGE
	//
	//generating geometries
	//generating the cage
	//X PART
	this.cageX[0].scale.set(x, 1, 1);
	this.cageX[0].position.y = 0;
	this.cageX[0].position.z = z * 0.5;
	//
	this.cageX[1].scale.set(x, 1, 1);
	this.cageX[1].position.y = 0;
	this.cageX[1].position.z = -z * 0.5;
	//
	this.cageX[2].scale.set(x, 1, 1);
	this.cageX[2].position.y = y;
	this.cageX[2].position.z = z * 0.5;
	reposicionableObjects.push({obj : this.cageX[2], position: this.cageX[2].position.clone()});
	//
	this.cageX[3].scale.set(x, 1, 1);
	this.cageX[3].position.y = y;
	this.cageX[3].position.z = -z * 0.5;
	reposicionableObjects.push({obj : this.cageX[3], position: this.cageX[3].position.clone()});
	////////////////////////////////////////////////////////
	//Y PART
	this.cageY[0].scale.set(1, y, 1);
	this.cageY[0].position.x = x * 0.5;
	this.cageY[0].position.z = z * 0.5;
	this.cageY[0].position.y = y * 0.5;
	reposicionableObjects.push({obj : this.cageY[0], position: this.cageY[0].position.clone()});
	scaleableObjects.push(this.cageY[0]);
	//
	this.cageY[1].scale.set(1, y, 1);
	this.cageY[1].position.x = x * 0.5;
	this.cageY[1].position.z = -z * 0.5;
	this.cageY[1].position.y = y * 0.5;
	reposicionableObjects.push({obj : this.cageY[1], position: this.cageY[1].position.clone()});
	scaleableObjects.push(this.cageY[1]);
	//
	this.cageY[2].scale.set(1, y, 1);
	this.cageY[2].position.x = -x * 0.5;
	this.cageY[2].position.z = z * 0.5;
	this.cageY[2].position.y = y * 0.5;
	reposicionableObjects.push({obj : this.cageY[2], position: this.cageY[2].position.clone()});
	scaleableObjects.push(this.cageY[2]);
	//
	this.cageY[3].scale.set(1, y, 1);
	this.cageY[3].position.x = -x * 0.5;
	this.cageY[3].position.z = -z * 0.5;
	this.cageY[3].position.y = y * 0.5;
	reposicionableObjects.push({obj : this.cageY[3], position: this.cageY[3].position.clone()});
	scaleableObjects.push(this.cageY[3]);
	////////////////////////////////////////////////////////
	//Z PART
	this.cageZ[0].scale.set(1, 1, z);
	this.cageZ[0].position.x = -x * 0.5;
	this.cageZ[0].position.y = 0;
	//
	this.cageZ[1].scale.set(1, 1, z);
	this.cageZ[1].position.x = x * 0.5;
	this.cageZ[1].position.y = 0;
	//
	this.cageZ[2].scale.set(1, 1, z);
	this.cageZ[2].position.x = x * 0.5;
	this.cageZ[2].position.y = y;
	reposicionableObjects.push({obj : this.cageZ[2], position: this.cageZ[2].position.clone()});
	//
	this.cageZ[3].scale.set(1, 1, z);
	this.cageZ[3].position.x = -x * 0.5;
	this.cageZ[3].position.y = y;
	reposicionableObjects.push({obj : this.cageZ[3], position: this.cageZ[3].position.clone()});
	///////////////////////////////////////////////
	//
	//		GENERATING THE TEXTS and GRIDS
	//
	//
	// first we create z and x numbers and grid
	var z_chunks_text = get_grid_cuts((z * pixelSize), this.XZ_GRID_COUNT);
	var z_chunks = z / (this.XZ_GRID_COUNT);
	var z_chunks_start_difference = (z * pixelSize * scale) % z_chunks_text * scale;
	//
	var x_chunks_text = get_grid_cuts((x * pixelSize), this.XZ_GRID_COUNT);
	var x_chunks = x / (this.XZ_GRID_COUNT);
	var x_chunks_start_difference = (x * pixelSize * scale) % x_chunks_text * scale;
	this.x_chunks = x_chunks;
	this.x_chunks_start_difference = x_chunks_start_difference;

	this.z_chunks = z_chunks;
	this.z_chunks_start_difference = z_chunks_start_difference;
	//
	i = this.XZ_GRID_COUNT;
	while (i--) {
		for (j = 0; j < 2; j++) {
			//NUMBERS
			sign = (j === 0 ? 1 : -1);
			//Z PART
			this.textZ[i + j * this.XZ_GRID_COUNT].setUp({ scale : scale_using, text:this.applyRounding(i * z_chunks_text) });
			this.textZ[i + j * this.XZ_GRID_COUNT].obj3d.position.set((x * 0.5 + 20  * scale_using) * sign, -base_height - this.BOTTOM_SPACE * scale_using, -z_chunks_start_difference + z * 0.5 - i * z_chunks);
			//X PART * this.XZ_GRID_COUNT
			this.textX[i + j * this.XZ_GRID_COUNT].setUp({scale : scale_using, text:this.applyRounding(i * x_chunks_text)});
			this.textX[i + j * this.XZ_GRID_COUNT].obj3d.position.set(-x * 0.5 + i * x_chunks + x_chunks_start_difference,  -base_height - this.BOTTOM_SPACE * scale_using, (-z * 0.5 - 20 * scale_using) * sign);
		}
		//MARKS
		//Z PART goes from top to back
		var cant_marks = this.MAX_CANT_MARKS;
		var mark_using = cant_marks;
		while (mark_using--) {
			for (sign = 0; sign < 2; sign ++) {
				this.gridZMarks[i * cant_marks * 2 + mark_using * 2 + sign].scale.set(1, 1, 6 * scale_using * 1.61);
				this.gridZMarks[i * cant_marks * 2 + mark_using * 2 + sign].position.set(-x * 0.5 + i * x_chunks + x_chunks / (cant_marks + 1) * (mark_using + 1) + x_chunks_start_difference,  -base_height - this.BOTTOM_SPACE * scale_using, (sign ? -1 : 1) * z * 0.5 + (sign ? -1 : 1) * 1.5 * scale_using * 1.61);
			}
		}
		//X PART goes right to left top to back|
		cant_marks = this.MAX_CANT_MARKS;
		mark_using = cant_marks;
		while (mark_using--) {
			for (sign = 0; sign < 2; sign ++) {
				this.gridXMarks[i * cant_marks * 2 + mark_using * 2 + sign].scale.set(3 * scale_using * 1.61, 1, 1);
				this.gridXMarks[i * cant_marks * 2 + mark_using * 2 + sign].position.set((sign ? -1 : 1) * x * 0.5 + (sign ? -1 : 1) * 1.5 * scale_using * 1.61,   - base_height - this.BOTTOM_SPACE * scale_using,	z * 0.5 - i * z_chunks - z_chunks / (cant_marks + 1) * (mark_using + 1) - z_chunks_start_difference);
			}
		}
	}

	i = this.XZ_GRID_COUNT;
	while (i--) {
		//Z PART goes from top to back
		this.gridZ[i].scale.set(1, 1, z);
		this.gridZ[i].position.set(-x * 0.5 + i * x_chunks + x_chunks_start_difference, -base_height - this.BOTTOM_SPACE * scale_using, 0);
		//
		//X PART goes right to left top to back|
		this.gridX[i].scale.set(x, 1, 1);
		this.gridX[i].position.set(0,   - base_height - this.BOTTOM_SPACE * scale_using,	z * 0.5 - i * z_chunks - z_chunks_start_difference);
		//
	}
	i = this.XZ_GRID_COUNT * 2;
	while (i--) {
		//Z PART goes from top to back
		this.gridZShorts[i].scale.set(1, 1, 8 * scale_using * 1.61);
		this.gridZShorts[i].position.set(-x * 0.5 + i * x_chunks + x_chunks_start_difference, -base_height - this.BOTTOM_SPACE * scale_using, 0);
		//
		//X PART goes right to left top to back|
		this.gridXShorts[i].scale.set(8 * scale_using * 1.61, 1, 1);
		this.gridXShorts[i].position.set(0,   - base_height - this.BOTTOM_SPACE * scale_using,	z * 0.5 - i * z_chunks - z_chunks_start_difference);
		//
	}

	this.fourPositions[0] = new THREE.Vector3(x * 0.5, 0, z * 0.5);
	this.fourPositions[1] = new THREE.Vector3(x * 0.5, 0, -z * 0.5);
	this.fourPositions[2] = new THREE.Vector3(-x * 0.5, 0, z * 0.5);
	this.fourPositions[3] = new THREE.Vector3(-x * 0.5, 0, -z * 0.5);
	this.groupYRotateToCamera.position.copy(this.fourPositions[3]);

	// then we create y grid and y numbers
	var y_chunks_text = get_grid_cuts((max - min), this.Y_GRID_COUNT);
	var y_chunks = y / this.Y_GRID_COUNT;
	var y_chunks_start_negative = Math.floor(-min / y_chunks_text);
	var y_chunks_start_difference = Math.abs((min + y_chunks_start_negative * y_chunks_text) / y_chunks_text) * y_chunks;
	this.y_chunks = y_chunks;
	this.y_chunks_start_difference = y_chunks_start_difference;
	//

	i = this.Y_GRID_COUNT;
	while (i--) {
		//Y PART
		this.textYX[i].setUp({scale : scale_using, text:this.applyRounding((i - y_chunks_start_negative) * y_chunks_text)});
		this.textYX[i].obj3d.position.set(10 * scale_using,   y_chunks_start_difference + this.textYX[ i ].h * 0.5 + y_chunks * i, 0);
		this.textYX[i].obj3d.reposicionableObjects = {obj : this.textYX[ i ].obj3d, position :this.textYX[ i ].obj3d.position.clone()};
		reposicionableObjects.push(this.textYX[i].obj3d.reposicionableObjects);
		//
		for (j = 0 ; j < 2 ; j ++) {
			sign = (j === 0 ? 1 : -1);
			//MAKRS
			this.gridYX[i * 4 + j].position.set(0,  y_chunks_start_difference + y_chunks * i, -z * 0.5 * sign);
			this.gridYX[i * 4 + j].scale.set(x, 1, 1);
			groupY.push(this.gridYX[i * 4 + j]);
			this.gridYX[i * 4 + j].reposicionableObjects = {obj : this.gridYX[i * 4 + j],
				position :this.gridYX[i * 4 + j].position.clone() };
			reposicionableObjects.push(this.gridYX[i * 4 + j].reposicionableObjects);
			//
			this.gridYZ[i * 2 + j].position.set(x * 0.5  * sign,  y_chunks_start_difference + y_chunks * i, 0);
			this.gridYZ[i * 2 + j].scale.set(1, 1, z);
			groupY.push(this.gridYZ[i * 2 + j]);
			this.gridYZ[i * 2 + j].reposicionableObjects = {obj : this.gridYZ[i * 2 + j],
				position :this.gridYZ[i * 2 + j].position.clone() };
			reposicionableObjects.push(this.gridYZ[i * 2 + j].reposicionableObjects);
			//
		}
		//shorts
		cant_marks = this.MAX_CANT_MARKS;
		mark_using = cant_marks;
		while (mark_using--) {
			this.gridYXMarks[i * cant_marks + mark_using].position.set(1.5 * scale_using * 1.61,  y_chunks_start_difference + y_chunks * i + y_chunks / (cant_marks + 1) * (mark_using + 1), 0);
			this.gridYXMarks[i * cant_marks + mark_using].scale.set(3 * scale_using * 1.61, 1, 1);
			this.gridYXMarks[i * cant_marks + mark_using].reposicionableObjects = {obj : this.gridYXMarks[i * cant_marks + mark_using],
				position :this.gridYXMarks[i * cant_marks + mark_using].position.clone() };
			reposicionableObjects.push(this.gridYXMarks[i * cant_marks + mark_using].reposicionableObjects);
		}
		//
		this.gridYXShorts[i].position.set(5 * scale_using,  y_chunks_start_difference + y_chunks * i, 0);
		this.gridYXShorts[i].scale.set(10 * scale_using, 1, 1);
		this.gridYXShorts[i].reposicionableObjects = {obj : this.gridYXShorts[i],
				position :this.gridYXShorts[i].position.clone() };
		reposicionableObjects.push(this.gridYXShorts[i].reposicionableObjects);
	}
	//
	for (j = 0; j < 2; j++) {
		sign = (j === 0 ? 1 : -1);
		//Y TEXT
		this.references[j * 2].setUp({scale: scale_using, text:"Y Distance  " + "( " + this.config.unitXY + " )"});
		this.references[j * 2].obj3d.position.set(sign * (x * 0.5 +	40 * scale_using), -base_height, 0);
		//X TEXT
		this.references[j * 2 + 1].setUp({scale: scale_using, text:"X Distance  " + "( " + this.config.unitXY + " )"});
		this.references[j * 2 + 1].obj3d.position.set(0, -base_height, sign * (-z * 0.5 - 40 * scale_using));
	}
	//Y TEXT
	this.referencesY[0].setUp({scale: scale_using, text:"Height  " + "( " + this.config.unitZ + " )"});
	this.referencesY[0].obj3d.position.set((40 * scale_using), 0 + y * 0.5, 0);
	groupYText.push(this.referencesY[0].obj3d);
	reposicionableObjects.push({obj : this.referencesY[0].obj3d,
		position : this.referencesY[0].obj3d.position.clone() });

	/////////////////////////////////////////////////////////
	//	IT CALCULATES THE IDEAL DISTANCE BETWEEN MARKS AND NUMBERS
	//
	function get_grid_cuts(side_length, cuts) {
		var side = side_length;
		side /= cuts;
		return side;
	}

	var statusZ = -1;
	var statusX = -1;

	var show_and_hide_groupYX = function(show, hide) {
		if (statusX !== show) {
			//show_and_hide_groupY(show, hide);
			statusX = show;
		}
	};

	var show_and_hide_groupYZ = function(show, hide) {
		if (statusZ !== show) {
			//show_and_hide_groupY(show, hide);
			statusZ = show;
		}
	};

	var animate = function(camera) {
		//posisionate the Y grid acording to camera.
		if (camera.position.z > 0) {
			show_and_hide_groupYZ(0, 2);
		}
		else {
			show_and_hide_groupYZ(2, 0);
		}
		if (camera.position.x > 0) {
			show_and_hide_groupYX(3, 1);
		}
		else {
			show_and_hide_groupYX(1, 3);
		}
		if (camera.position.z < 0 && camera.position.x > 0) {
			this.groupYRotateToCamera.position.copy(this.fourPositions[0]);
		}
		if (camera.position.z > 0 && camera.position.x > 0) {
			this.groupYRotateToCamera.position.copy(this.fourPositions[2]);
		}
		if (camera.position.z < 0 && camera.position.x < 0) {
			this.groupYRotateToCamera.position.copy(this.fourPositions[1]);
		}
		if (camera.position.z > 0 && camera.position.x < 0) {
			this.groupYRotateToCamera.position.copy(this.fourPositions[3]);
		}
		var angle = Math.atan2(camera.position.z - this.groupYRotateToCamera.position.z * params.scale,
		camera.position.x - this.groupYRotateToCamera.position.x * params.scale);
		this.groupYRotateToCamera.rotation.y = - angle - 0.5 * Math.PI;
	};

	scale = function(value) {
		i = scaleableObjects.length;
		while (i--) {
			scaleableObjects[i].scale.set(1, y * value, 1);
		}
		i = reposicionableObjects.length;
		while (i--) {
			reposicionableObjects[i].obj.position.y = reposicionableObjects[i].position.y * value;
		}
	};

	var moveValuesTo = function(value)	{
		for (var i = 0 ; i < this.textYX.length ; i++) {
			this.textYX[i].moveValue(value);
			this.textYX[i].setScale(value);
		}
	};

	var moveScaleTo = function(value) {
		//4 types of scales:
		//0 : centered (the average height is set to 0)
		//1 : height (bottom starts at 0)
		//2 : depth (top starts at 0 )
		//3 : absolute (normal).
		switch (value) {
		    case 0: //0 : absolute (the average height is set to 0)
				this.moveValuesTo(0);
		        break;
		    case 1: //1 : centered (bottom starts at 0)
				this.moveValuesTo((max + min) / 2);
		        break;
		    case 2: //2 : depth (top starts at 0 )
		        this.moveValuesTo(-max);
		        break;
		    case 3: //3 : height (normal).
						this.moveValuesTo(-min);
		        break;
		    default:
		        console.warn("no valid scale type");
		}
	};

	this.moveScaleTo = moveScaleTo;
	this.moveValuesTo = moveValuesTo;
	this.animate = animate;
	this.scale 	= scale;
};

Grid.prototype.setVisible = function(aBoolean) {
	this.obj3d.visible = aBoolean;
};

Grid.prototype.setGridText = function(someGridTexts) {
    if (someGridTexts.xDistanceLabel) {
		this.references[1].setUp({ text : someGridTexts.xDistanceLabel });
		this.references[3].setUp({ text : someGridTexts.xDistanceLabel });
	}

	if (someGridTexts.yDistanceLabel) {
		this.references[0].setUp({ text : someGridTexts.yDistanceLabel });
		this.references[2].setUp({ text : someGridTexts.yDistanceLabel });
	}

	if (someGridTexts.zHeightLabel) {
		this.referencesY[0].setUp({ text : someGridTexts.zHeightLabel });
	}
};
//
Grid.prototype.getGridText = function() {
	return {
			xDistanceLabel : this.references[1].getText(),
			yDistanceLabel : this.references[0].getText(),
			zHeightLabel : this.referencesY[0].getText()
		};
};
//
Grid.prototype.applyRounding = function(val) {
	var value;
	if (this.config.numberFormat === 'significant') {
		value = val.toPrecision(this.config.numberFormatValue);
	}
	else {
		value = (Math.round(val)).toPrecision(this.config.numberFormatValue);
	}
	if (!this.config.displayTrailingZeros) {
		value = parseFloat(value) + "";
	}
	return value;
};

Grid.prototype.setTickData = function(someTickData) {
	this.tick_data = someTickData;
};

Grid.prototype.setUsingTickData = function(strUsing) {

	var make_array = function(arr, min, max, invert) {
		var _arr = [];
		var cant = arr.length;
		for (i = 0; i < cant; i++) {
			val_to_check = arr[i];//(invert ? arr[cant - i -1] : arr[i]);
			if (val_to_check >= min &&
				val_to_check <= max)
				_arr.push(val_to_check);
		}
		return _arr;
	};
	//
	var x, y, z, is_invert, i, j, mark_using, cant_marks, value, spacing, addition, addition_2, relative_scale, val_to_check, setValue;
	//clean marks
	var sign, marks = this.gridYXMarks.length;
	while (marks--) {
		this.gridYXMarks[marks].visible = false;
	}
	marks = this.gridXMarks.length;
	while (marks--) {
		this.gridXMarks[marks].visible = false;
	}
	marks = this.gridZMarks.length;
	while (marks--) {
		this.gridZMarks[marks].visible = false;
	}

	/* Y PART */
	/* clean y_array */
	i = this.gridYXShorts.length;
	while (i--) {
		this.gridYXShorts[i].visible = false;
	}
	i = this.gridYX.length;
	while (i--) {
		this.gridYX[i].visible = false;
	}
	i = this.gridYZ.length;
	while (i--) {
		this.gridYZ[i].visible = false;
	}
	i = this.textYX.length;
	while (i--) {
		this.textYX[i].obj3d.visible = false;
	}
	i = this.gridYXMarks.length;
	while (i--) {
		this.gridYXMarks[i].visible = false;
	}
	/* check if values are valid */
	this.y_array = make_array(this.tick_data[strUsing].values, this.tick_data[strUsing].min, this.tick_data[strUsing].max, this.tick_data[strUsing].InvertAxis);
	/*  */
	cant_marks = this.tick_data[strUsing].ticSpacing;
	relative_scale = (this.y) / (this.tick_data[strUsing].max - this.tick_data[strUsing].min);
	addition = - this.tick_data[strUsing].min * relative_scale;
	y = this.y;
	is_invert = this.tick_data[strUsing].InvertAxis;
	setValue = function(val) {
		return (is_invert ? y - val * relative_scale - addition : val * relative_scale + addition) ;
	};

	i = this.y_array.length;
	while (i--) {
		this.gridYXShorts[i].position.set(
			4 * this.scale_using,
			setValue(this.y_array[i]),
			0);
		this.gridYXShorts[i].reposicionableObjects.position.copy(this.gridYXShorts[i].position);
		this.gridYXShorts[i].visible = true;
		for (j = 0 ; j < 2 ; j ++) {
			sign = (j === 0 ? 1 : -1);
			//MAKRS
			this.gridYX[i * 4 + j].visible = true;
			this.gridYX[i * 4 + j].position.set(0,
				setValue(this.y_array[i]),
				-this.z * 0.5 * sign);
			this.gridYX[i * 4 + j].reposicionableObjects.position.copy(this.gridYX[i * 4 + j].position);
			//
			this.gridYZ[i * 2 + j].visible = true;
			this.gridYZ[i * 2 + j].position.set(this.x * 0.5  * sign,
				setValue(this.y_array[i])
				, 0);
			this.gridYZ[i * 2 + j].reposicionableObjects.position.copy(this.gridYZ[i * 2 + j].position);
		}
		//Y PART
		this.textYX[i].setUp({ text : this.applyRounding(this.y_array[i]) });
		this.textYX[i].obj3d.position.set(10 * this.scale_using,
			setValue(this.y_array[i]),
			0);
		this.textYX[i].obj3d.reposicionableObjects.position.copy(this.textYX[i].obj3d.position);
		this.textYX[i].obj3d.visible = true;
		//shorts
		mark_using = cant_marks;
		if (this.y_array[i + 1] !== undefined) {
			spacing = Math.abs(this.y_array[i + 1] - this.y_array[i]) / (cant_marks + 1);
			while (mark_using--) {
				this.gridYXMarks[(i + 1) * cant_marks + mark_using + 1].position.set(
					2 * this.scale_using * 1.61,
					setValue(this.y_array[i] + spacing * (mark_using + 1)),
					0
				);
				this.gridYXMarks[(i + 1) * cant_marks + mark_using + 1].reposicionableObjects.position.copy(this.gridYXMarks[(i + 1) * cant_marks + mark_using + 1].position);
				this.gridYXMarks[(i + 1) * cant_marks + mark_using + 1].visible = true;
			}
		}
	}
	/* top small tics if needed*/
	if (this.y_array[this.y_array.length - 1] !== this.tick_data[strUsing].max) {
		mark_using = cant_marks;
		//spacing = (this.tick_data[strUsing].max - (this.y_array[this.y_array.length - 1])) / (cant_marks + 1);
		while (mark_using--) {
			value = this.y_array[this.y_array.length - 1] + spacing * (mark_using + 1);
			value = setValue(value);
			if (value >= 0 &&
				value <= this.y) {

				this.gridYXMarks[this.y_array.length * cant_marks + mark_using + 1].position.set(
					2 * this.scale_using * 1.61,
					value,
					0);
				this.gridYXMarks[this.y_array.length * cant_marks + mark_using + 1].reposicionableObjects.position.copy(
					this.gridYXMarks[this.y_array.length * cant_marks + mark_using + 1].position);
				this.gridYXMarks[this.y_array.length * cant_marks + mark_using + 1].visible = true;
			}
		}
	}
	/* bottom small tics if needed*/
	if (this.y_array[0] !== this.tick_data[strUsing].min) {
		mark_using = cant_marks + 1;
		while (mark_using--) {
			value = -spacing  * mark_using + this.y_array[0];
			value = setValue(value);
			if (value >= 0 &&
				value <= this.y) {
				this.gridYXMarks[mark_using].position.set(
					2 * this.scale_using * 1.61,
					value,
					0);
				this.gridYXMarks[mark_using].reposicionableObjects.position.copy(this.gridYXMarks[mark_using].position);
				this.gridYXMarks[mark_using].visible = true;
			}
		}
	}

	/*  ___    ___
		|\  \  /  /|
		\ \  \/  / /
		 \ \    / /
		  /     \/
		 /  /\   \
		/__/ /\ __\
		|__|/ \|__|
    */

	/* clean X_array */
	i = this.gridX.length;
	while (i--) {
		this.gridX[i].visible = false;
	}
	i = this.textZ.length;
	while (i--) {
		this.textZ[i].obj3d.visible = false;
	}
	i = this.gridXMarks.length;
	while (i--) {
		this.gridXMarks[i].visible = false;
	}
	i = this.gridXShorts.length;
	while (i--) {
		this.gridXShorts[i].visible = false;
	}
	/* check if values are valid */
	this.x_array = make_array(this.tick_data["YAxis"].values, this.tick_data["YAxis"].min, this.tick_data["YAxis"].max, this.tick_data["YAxis"].InvertAxis);
	cant_marks = this.tick_data["YAxis"].ticSpacing;
	relative_scale = this.z / (this.tick_data["YAxis"].max - this.tick_data["YAxis"].min);
	addition = - this.z * 0.5 + this.tick_data["YAxis"].min * relative_scale;
	addition_2 = + this.z * 0.5 - this.tick_data["YAxis"].max * relative_scale;
	//addition = - this.z * 0.5 - (this.tick_data["YAxis"].min) * relative_scale;
	z = this.z;
	is_invert = this.tick_data["YAxis"].InvertAxis;
	setValue = function(val) {
		return (is_invert ? z  - val * relative_scale + addition : val * relative_scale + addition_2)  ;
	};

	i = this.x_array.length;
	while (i--) {

		this.gridX[i].position.set(0,  - this.base_height - this.BOTTOM_SPACE * this.scale_using,
			setValue(this.x_array[i]));
		this.gridX[i].visible = true;

		for (j = 0 ; j < 2 ; j++) {

			this.gridXShorts[i + this.XZ_GRID_COUNT * j].position.set(
				(4 * this.scale_using + this.x * 0.5) * (j ? -j : 1),
				- this.base_height - this.BOTTOM_SPACE * this.scale_using,
				setValue(this.x_array[i])
			);
			this.gridXShorts[i + this.XZ_GRID_COUNT * j].visible = true;
			//Y PART
			this.textZ[i + this.XZ_GRID_COUNT * j].setUp({ text : this.applyRounding(this.x_array[i]) });
			//
			this.textZ[i + this.XZ_GRID_COUNT * j].obj3d.position.set((20 * this.scale_using + this.x * 0.5) * (j ? -j : 1),   - this.base_height - this.BOTTOM_SPACE * this.scale_using,
				setValue(this.x_array[i])
			);
			this.textZ[i + this.XZ_GRID_COUNT * j].obj3d.visible = true;
			//shorts
			mark_using = cant_marks;

			if (this.x_array[i + 1] !== undefined) {
				spacing = Math.abs(this.x_array[i + 1] - this.x_array[i]) / (cant_marks + 1);
				while (mark_using--) {

					this.gridXMarks[(i + 1) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].position.set(
						(1.5 * this.scale_using + this.x * 0.5)  * (j ? -j : 1),
						- this.base_height - this.BOTTOM_SPACE * this.scale_using,
						setValue(this.x_array[i] + spacing * (mark_using + 1)));
					this.gridXMarks[(i + 1) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
				}
				//if (i === 0 ) {
				//	first_spacing = spacing;
				//}
				//if (i === this.x_array.length - 2 ){
				//	last_spacing = spacing;
				//}
			}
		}
	}

	/*
	last border
	*/
	this.gridX[this.x_array.length].position.set(0,   - this.base_height - this.BOTTOM_SPACE * this.scale_using,
		 this.z * 0.5);
	this.gridX[this.x_array.length].visible = true;

	this.gridX[this.x_array.length + 1].position.set(0,   - this.base_height - this.BOTTOM_SPACE * this.scale_using,
		 - this.z * 0.5);
	this.gridX[this.x_array.length + 1].visible = true;

	/* top small tics if needed*/
	if (this.x_array[this.x_array.length - 1] !== this.tick_data["YAxis"].max) {
		mark_using = cant_marks + 1;
		//spacing = first_spacing; //(this.z / relative_scale - this.x_array[this.x_array.length - 1] + this.tick_data["YAxis"].min)  / (cant_marks + 1);
		while (mark_using--) {
			value = this.x_array[this.x_array.length - 1] + spacing * (mark_using + 1);
			//if (setValue(value) > - this.z * .5 &&
			//	setValue(value) <  this.z * .5)
				for (j = 0 ; j < 2 ; j++) {
						this.gridXMarks[(this.x_array.length) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].position.set(
							(2 * this.scale_using + this.x * 0.5) * (j ? -j : 1),
							- this.base_height - this.BOTTOM_SPACE * this.scale_using,
							setValue(value));
						this.gridXMarks[(this.x_array.length) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
				}
		}
	}
	/* bottom small tics if needed*/
	if (this.x_array[0] !== this.tick_data["YAxis"].min) {
		mark_using = cant_marks + 1;
		//spacing = last_spacing; //(this.x_array[0] - this.tick_data["YAxis"].min) / (cant_marks + 1);
		while (mark_using--) {
			value = - spacing * (mark_using + 1) + this.x_array[0];
			//if (setValue(value) < this.z * .5 &&
			//	setValue(value) > - this.z * .5)
				for (j = 0 ; j < 2 ; j++) {
					this.gridXMarks[mark_using + this.XZ_GRID_COUNT * j * cant_marks].position.set(
						(2 * this.scale_using + this.x * 0.5) * (j ? -j : 1),
						- this.base_height - this.BOTTOM_SPACE * this.scale_using,
						setValue(value)
					);
					this.gridXMarks[mark_using + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
				}
		}
	}

	/*
		 ________
		|\_____  \
		 \|___/  /|
		     /  / /
		    /  /_/__
		   |\________\
		    \|_______|
    */

	/* clean Z_array */
	i = this.gridZ.length;
	while (i--) {
		this.gridZ[i].visible = false;
	}
	i = this.textX.length;
	while (i--) {
		this.textX[i].obj3d.visible = false;
	}
	i = this.gridZMarks.length;
	while (i--) {
		this.gridZMarks[i].visible = false;
	}
	i = this.gridZShorts.length;
	while (i--) {
		this.gridZShorts[i].visible = false;
	}
	/* check if values are valid */
	this.z_array = make_array(this.tick_data["XAxis"].values, this.tick_data["XAxis"].min, this.tick_data["XAxis"].max, this.tick_data["XAxis"].InvertAxis);
	cant_marks = this.tick_data["XAxis"].ticSpacing;
	relative_scale = this.x / (this.tick_data["XAxis"].max - this.tick_data["XAxis"].min);
	addition = - this.x * 0.5 + this.tick_data["XAxis"].min * relative_scale;
	addition_2 = + this.x * 0.5 - this.tick_data["XAxis"].max * relative_scale;

	x = this.x;
	is_invert = this.tick_data["XAxis"].InvertAxis;
	setValue = function(val) {
		return (is_invert ? x - val * relative_scale + addition: val * relative_scale + addition_2);
	};
	i = this.z_array.length;
	while (i--) {

		this.gridZ[i].position.set(
			setValue(this.z_array[i]),
				- this.base_height - this.BOTTOM_SPACE * this.scale_using,
				0);
		this.gridZ[i].visible = true;

		for (j = 0 ; j < 2 ; j++) {

			this.gridZShorts[i + this.XZ_GRID_COUNT * j].position.set(
				setValue(this.z_array[i]),
				- this.base_height - this.BOTTOM_SPACE * this.scale_using,
				(j ? -j : 1) * (this.z * 0.5 +  4 * this.scale_using * 1.61));
			this.gridZShorts[i + this.XZ_GRID_COUNT * j].visible = true;
			//Y PART
			this.textX[i + this.XZ_GRID_COUNT * j].setUp({ text : this.applyRounding(this.z_array[i]) });
			//
			this.textX[i + this.XZ_GRID_COUNT * j].obj3d.position.set(
					setValue(this.z_array[i]),
					- this.base_height - this.BOTTOM_SPACE * this.scale_using,
					(j ? -j : 1) * (this.z * 0.5 +  15 * this.scale_using * 1.61));
			this.textX[i + this.XZ_GRID_COUNT * j].obj3d.visible = true;

			mark_using = cant_marks;
			if (this.z_array[ i + 1 ] !== undefined) {
				spacing = Math.abs(this.z_array[ i + 1 ] - this.z_array[i]) / (cant_marks + 1);
				while (mark_using--) {
					this.gridZMarks[(i + 1) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].position.set(
						setValue(this.z_array[i] + spacing * (mark_using + 1)),
						-this.base_height - this.BOTTOM_SPACE * this.scale_using,
						(j ? -j : 1) * (this.z * 0.5 +  1.5 * this.scale_using * 1.61));
					this.gridZMarks[(i + 1) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
				}
			}
		}
	}
	/*
	last border
	*/
	this.gridZ[this.x_array.length].position.set(
		this.x * 0.5,
	    - this.base_height - this.BOTTOM_SPACE * this.scale_using,
		0);
	this.gridZ[this.x_array.length].visible = true;

	this.gridZ[this.x_array.length + 1].position.set(
		- this.x * 0.5,
	    - this.base_height - this.BOTTOM_SPACE * this.scale_using,
		0);
	this.gridZ[this.x_array.length + 1].visible = true;

	/* top small tics if needed*/
	if (this.z_array[this.z_array.length - 1] !== this.tick_data["XAxis"].max) {
		mark_using = cant_marks + 1;

		//spacing = (this.x / relative_scale - this.z_array[this.z_array.length - 1]) / (cant_marks + 1);
		while (mark_using--) {
			value = this.z_array[this.z_array.length - 1] + spacing * (mark_using + 1) ;
			if (setValue(value) <= this.x * .5 &&
				setValue(value) >= - this.x * .5)
				for (j = 0 ; j < 2 ; j++) {
						this.gridZMarks[(this.z_array.length) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].position.set(
							setValue(value),
							- this.base_height - this.BOTTOM_SPACE * this.scale_using,
							(j ? -j : 1) * (this.z * 0.5 +  1.5 * this.scale_using * 1.61)
						);

						this.gridZMarks[(this.z_array.length) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
				}
		}
	}
	/* bottom small tics if needed*/
	if (this.z_array[0] !== this.tick_data["XAxis"].min) {
		mark_using = cant_marks + 1 ;

		//spacing = (this.z_array[0] - this.tick_data["XAxis"].min) / (cant_marks + 1);
		while (mark_using--) {
			value = -spacing * (mark_using + 1) + this.x_array[0];
			if (setValue(value) < this.x * .5 &&
				setValue(value) > - this.x * .5)
				for (j = 0 ; j < 2 ; j++) {
					this.gridZMarks[mark_using + this.XZ_GRID_COUNT * j * cant_marks].position.set(
						setValue(value),
						- this.base_height - this.BOTTOM_SPACE * this.scale_using,
						(j ? -j : 1) * (this.z * 0.5 +  1.5 * this.scale_using * 1.61)
					);
					this.gridZMarks[ mark_using + this.XZ_GRID_COUNT * j * cant_marks ].visible = true;
				}
		}
	}

	/*
		i = this.gridZ.length;
		while (i--) {
			this.gridZ[i].visible = false;
		}
		i = this.textX.length;
		while (i--) {
			this.textX[i].obj3d.visible = false;
		}
		i = this.gridZMarks.length;
		while (i--) {
			this.gridZMarks[i].visible = false;
		}
		i = this.gridZShorts.length;
		while (i--) {
			this.gridZShorts[i].visible = false;
		}
		lenght is x

	callback_grid = function(id, value){
		this.gridZ[i].position.set(value,
			- this.base_height - this.BOTTOM_SPACE * this.scale_using,
		0);
		this.gridZ[i].visible = true;
	};

	callback_shorts = function(id, value) {
		for (j = 0 ; j < 2 ; j++) {
			this.gridZShorts[id + this.XZ_GRID_COUNT * j].position.set(
				value,
				- this.base_height - this.BOTTOM_SPACE * this.scale_using,
				(j ? -j : 1) * (this.z * 0.5 +  4 * this.scale_using * 1.61));
			this.gridZShorts[id + this.XZ_GRID_COUNT * j].visible = true;
		}
	};

	callback_text = function(id, value, text_value) {
		for (j = 0 ; j < 2 ; j++) {
			this.textX[id + this.XZ_GRID_COUNT * j].setUp({ text : text_value });
			this.textX[id + this.XZ_GRID_COUNT * j].obj3d.position.set(
				value,	- this.base_height - this.BOTTOM_SPACE * this.scale_using,
				(j ? -j : 1) * (this.z * 0.5 +  15 * this.scale_using * 1.61));
			this.textX[id + this.XZ_GRID_COUNT * j].obj3d.visible = true;
		}
	};

	callback_marks = function(id, value, total_marks) {
		for (j = 0 ; j < 2 ; j++) {
			this.gridZMarks[(i + 1) * cant_marks + total_marks + 1 + this.XZ_GRID_COUNT * j * cant_marks].position.set(
				value,
				-this.base_height - this.BOTTOM_SPACE * this.scale_using,
				(j ? -j : 1) * (this.z * 0.5 +  1.5 * this.scale_using * 1.61));
			this.gridZMarks[(i + 1) * cant_marks + total_marks + 1 + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
		}
	}

	make_a_grid = function (object, lenght) {

		// check if values are valid
		var _array = make_array(object.values, object.min, object.max, object.InvertAxis);
		cant_marks = object.ticSpacing;
		relative_scale = lenght / (object.max - object.min);
		addition = - lenght * 0.5 - object.min * relative_scale;
		is_invert = ! object.InvertAxis;
		setValue = function(val) {
			return (!is_invert ? lenght - val * relative_scale : val * relative_scale)  + addition;
		};
		i = _array.length;
		while (i--) {
			callback_grid(i, setValue(_array[i]));
			callback_shorts(i, setValue(_array[i]));
			callback_text(i, setValue(_array[i]), this.applyRounding(this.z_array[i]) );
			if (_array[ i + 1 ] !== undefined) {
				mark_using = cant_marks;
				spacing = Math.abs(_array[ i + 1 ] - _array[i]) / (cant_marks + 1);
				while (mark_using--) {
					callback_marks(i, setValue(_array[i] + spacing * (mark_using + 1)), cant_marks);
				}
			}
		}
		//last border
		callback_grid_init(length);
		callback_grid_final(0);
		this.gridZ[_array.length].position.set(
			this.x * 0.5,
		    - this.base_height - this.BOTTOM_SPACE * this.scale_using,
			0);
		this.gridZ[_array.length].visible = true;

		this.gridZ[_array.length + 1].position.set(
			- this.x * 0.5,
		    - this.base_height - this.BOTTOM_SPACE * this.scale_using,
			0);
		this.gridZ[_array.length + 1].visible = true;

		// top small tics if needed
		if (_array[_array.length - 1] !== object.max) {
			mark_using = cant_marks + 1;
			spacing = (length / relative_scale - _array[_array.length - 1]) / (cant_marks + 1);
			while (mark_using--) {
				value = _array[_array.length - 1] + spacing * (mark_using + 1);
				for (j = 0 ; j < 2 ; j++) {
						if (value >= _array[_array.length - 1] && value * relative_scale <= this.x) {
							this.gridZMarks[(_array.length) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].position.set(
								setValue(value),
								- this.base_height - this.BOTTOM_SPACE * this.scale_using,
								(j ? -j : 1) * (this.z * 0.5 +  1.5 * this.scale_using * 1.61)
							);
							this.gridZMarks[(_array.length) * cant_marks + mark_using + 1 + this.XZ_GRID_COUNT * j * cant_marks].visible = true;
						}
					}
				}
		}
		//bottom small tics if needed
		if (_array[0] !== object.min) {
			mark_using = cant_marks + 1 ;
			spacing = (_array[0] - object.min) / (cant_marks + 1);
			while (mark_using--) {
				value = spacing * mark_using;
				for (j = 0 ; j < 2 ; j++) {
					this.gridZMarks[mark_using + this.XZ_GRID_COUNT * j * cant_marks].position.set(
						setValue(value),
						- this.base_height - this.BOTTOM_SPACE * this.scale_using,
						(j ? -j : 1) * (this.z * 0.5 +  1.5 * this.scale_using * 1.61)
					);
					this.gridZMarks[ mark_using + this.XZ_GRID_COUNT * j * cant_marks ].visible = true;
				}
			}
		}
	}
	make_a_grid();
	*/
};
