var AxisHelper = function() {};

AxisHelper.prototype.setUp = function(scale_, anisotropy_) {
	this.obj = new THREE.Group;
	//axis
	var scale = scale_ || 10;
	var anisotropy = anisotropy_ || 1;
	var geo = new THREE.CylinderGeometry(3, 8, scale * 10, 32);
	geo.translate(0, scale * 5, 0);
	var geoPoint = new THREE.CylinderGeometry(0.1, 15, scale * 5, 32);
	geoPoint.translate(0, scale * 9, 0);
	geo.merge(geoPoint);
	//
	var mat = new THREE.MeshPhongMaterial({});
	var meshY = new THREE.Mesh(geo.clone(), mat.clone());
	meshY.rotation.x = Math.PI * -0.5;
	meshY.material.color.setHex(0x22cc22);
	var meshZ = new THREE.Mesh(geo.clone(), mat.clone());
	meshZ.material.color.setHex(0x2222cc);
	var meshX = new THREE.Mesh(geo.clone(), mat.clone());
	meshX.material.color.setHex(0xcc2222);
	meshX.rotation.z = Math.PI * -0.5;

	//sphere
	var origin = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), mat.clone());
	origin.material.color.setHex(0xeeeeee);
	//text
	var x = new SpriteText();
	var y = new SpriteText();
	var z = new SpriteText();
	x.initialize({ position : 0, anisotropy : anisotropy, scale : 1.8, color : "#ff2222" });
	y.initialize({ position : 0, anisotropy : anisotropy, scale : 1.8, color : "#22ff22" });
	z.initialize({ position : 0, anisotropy : anisotropy, scale : 1.8, color : "#2222ff" });
	x.setUp({text:"X" });
	y.setUp({text:"Y" });
	z.setUp({text:"Z" });
	x.obj3d.position.set(scale * 15, 0, 0);
	x.obj3d.rotation.y = Math.PI * 0.5;
	y.obj3d.position.set(0, 0, -scale * 15);
	z.obj3d.position.set(0, scale * 15, 0);
	//
	this.obj.add(meshY);
	this.obj.add(meshZ);
	this.obj.add(meshX);
	this.obj.add(origin);
	this.obj.add(x.obj3d);
	this.obj.add(y.obj3d);
	this.obj.add(z.obj3d);
};

AxisHelper.prototype.dispose = function() {
	var i = this.obj.children.length;
	while (i--) {
		if (this.obj.children[i].dispose) {
			this.obj.children[i].dispose();
		}
		else {
			if (this.obj.children[i].material && this.obj.children[i].material.map) {
				this.obj.children[i].material.map.dispose();
			}
			else {
				if (this.obj.children[i].material) {
					this.obj.children[i].material.dispose();
				}
			}
			if (this.obj.children[i].geometry) {
				this.obj.children[i].geometry.dispose();
			}
		}
	}
};
