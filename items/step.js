var Step = function() {};

Step.prototype.initialize 	= function(params) 
{
	var main = this;

	main.scene 		= params.scene;
	main.render		= params.render;
	main.camera 	= params.camera;
	main.grid  		= params.grid;
	main.control 	= params.control;
	main.renderer 	= params.renderer;

	main.s_pos 		= {x : -5, y : 6.5, z : -2.5};
	main.e_pos 		= {x :  0, y : 6.5, z : 0};
	main.trans 		= 1;

	main.drawPoint();
	main.initEvent();
	main.initEnv();
};

Step.prototype.drawPoint 	= function()
{
	var geometry    = new THREE.SphereGeometry( 0.3, 10, 10 );

	this.s_mesh 	= new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color : 0x0000FF, transparent : true}));
	this.e_mesh 	= new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color : 0xFF0000, transparent : true}));

	this.s_mesh.name = "start";
	this.e_mesh.name = "end";

	this.s_mesh.visible = false;
	this.e_mesh.visible = false;

	this.scene.add(this.s_mesh);
	this.scene.add(this.e_mesh);
}

Step.prototype.initPoint 	= function()
{
	var main 	= this;
	var len_x 	= (this.grid.x_chunks - 5.5) / this.grid.GRID_DIVISIONS;
	var len_z 	= (this.grid.z_chunks - 2.5) / this.grid.GRID_DIVISIONS;

	var s_x 	= len_x / -2;
	var s_z  	= len_z / -2;
	var s_y 	= this.grid.y_chunks / 2 / this.grid.GRID_DIVISIONS;

	var s_abs 	= main.convertAbs(s_x, s_z);
	var e_abs 	= main.convertAbs(0, 0);

	main.s_mesh.position.x = s_x;
	main.s_mesh.position.y = s_y;
	main.s_mesh.position.z = s_z;
	main.e_mesh.position.y = s_y;

	$("#spos_x").val(s_abs.x);
	$("#spos_z").val(s_abs.z);

	$("#epos_x").val(e_abs.x);
	$("#epos_z").val(e_abs.z);
}

Step.prototype.drawDragArea = function()
{
	var width 		= Math.floor(this.grid.x_chunks / this.grid.GRID_DIVISIONS);
	var height 		= Math.floor(this.grid.y_chunks / this.grid.GRID_DIVISIONS);
	var y 			= Math.floor(this.grid.z_chunks / this.grid.GRID_DIVISIONS);
	var geoplane 	= new THREE.PlaneGeometry( width, height, 10 );

	this.dragArea = new THREE.Mesh( geoplane, new THREE.MeshBasicMaterial({color: 0xFFFFFF, transparent : true, side : THREE.DoubleSide, opacity : 0.01, depthTest : false}) );
	this.dragArea.rotation.x = Math.PI / 2;
	this.dragArea.position.y = y;
	this.scene.add(this.dragArea);
}

Step.prototype.initEnv 		= function()
{
	var main = this;

	document.addEventListener( 'mousedown', function(event)
	{
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();

		mouse.x = ( event.clientX / main.renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / main.renderer.domElement.clientHeight ) * 2 + 1;

		raycaster.setFromCamera( mouse, main.camera );

		var intersects = raycaster.intersectObjects( [main.s_mesh, main.e_mesh] );

		if(intersects.length > 0)
		{
			main.drag_obj = intersects[0].object;
			main.control.enabled = false; 
		}
	});

	document.addEventListener( 'mouseup', function(event)
	{
		main.drag_obj = null;
		main.control.enabled = true; 
	});

	document.addEventListener( 'mousemove', function(event)
    {
    	if(!main.drag_obj || !main.dragArea)
    		return;

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        mouse.x = ( event.clientX / main.renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / main.renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, main.camera );

        var intersects = raycaster.intersectObjects( [main.dragArea] );

        if(intersects.length > 0)
        {
        	var x = intersects[0].point.x;
        	var z = intersects[0].point.z;

        	var len_x 	= (main.grid.x_chunks - 5.5) / main.grid.GRID_DIVISIONS;
			var len_z 	= (main.grid.z_chunks - 2.5) / main.grid.GRID_DIVISIONS;

        	x = Math.min(Math.max(x, len_x / -2), len_x / 2);
        	z = Math.min(Math.max(z, len_z / -2), len_z / 2);

            main.drag_obj.position.x = x; 
            main.drag_obj.position.z = z; 

			main.drawPlane(main.s_mesh.position, main.e_mesh.position);
			main.updateInfo();
        }
    });

    document.addEventListener( 'touchstart', function(event)
	{
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();

		mouse.x = ( event.touches[0].pageX / main.renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.touches[ 0 ].pageY / main.renderer.domElement.clientHeight ) * 2 + 1;

		raycaster.setFromCamera( mouse, main.camera );

		var intersects = raycaster.intersectObjects( [main.s_mesh, main.e_mesh] );

		if(intersects.length > 0)
		{
			main.drag_obj = intersects[0].object;
			main.control.enabled = false; 
		}
	});

	document.addEventListener( 'touchend', function(event)
	{
		main.drag_obj = null;
		main.control.enabled = true; 
	});

	document.addEventListener( 'touchmove', function(event)
    {
    	if(!main.drag_obj || !main.dragArea)
    		return;

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        mouse.x = ( event.touches[0].pageX / main.renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.touches[0].pageY / main.renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, main.camera );

        var intersects = raycaster.intersectObjects( [main.dragArea] );

        if(intersects.length > 0)
        {
        	var x = intersects[0].point.x;
        	var z = intersects[0].point.z;

        	var len_x 	= (main.grid.x_chunks - 5.5) / main.grid.GRID_DIVISIONS;
			var len_z 	= (main.grid.z_chunks - 2.5) / main.grid.GRID_DIVISIONS;

        	x = Math.min(Math.max(x, len_x / -2), len_x / 2);
        	z = Math.min(Math.max(z, len_z / -2), len_z / 2);

            main.drag_obj.position.x = x; 
            main.drag_obj.position.z = z; 

			main.drawPlane(main.s_mesh.position, main.e_mesh.position);
			main.updateInfo();

			event.stopPropagation();
			event.preventDefault();
        }
    });
}

Step.prototype.initEvent 	= function()
{
	var main = this;

	$("#chk_show_step").on("click", function()
	{
		if(!main.dragArea)
		{
			main.initPoint();
			main.drawDragArea();
		}

		if($(this).parent().children(":checked").length)
		{
			main.s_mesh.visible = true;
			main.e_mesh.visible = true;
			
			if(main.plane)
				main.plane.visible 	= true;

			main.s_pos.y = main.e_pos.y = Math.floor(main.grid.z_chunks / main.grid.GRID_DIVISIONS);
			main.s_mesh.position.y = Math.floor(main.grid.z_chunks / main.grid.GRID_DIVISIONS);
			main.e_mesh.position.y = Math.floor(main.grid.z_chunks / main.grid.GRID_DIVISIONS);
			main.drawPlane(main.s_mesh.position, main.e_mesh.position);
		}
		else
		{
			main.s_mesh.visible = false;
			main.e_mesh.visible = false;

			if(main.plane)
				main.plane.visible 	= false;
		}

		main.render();
	});

	$("#num_transparent").on("change", function()
	{
		var trans_val = $(this).val();

		main.trans = trans_val;
		main.plane.material.opacity = trans_val;
		main.render();
	});

	$("#btn_update_point").on("click", function()
	{
		// convertPts
		var sx 		= $("#spos_x").val();
		var sz 		= $("#spos_z").val();
		var s_pts 	= main.convertPts(sx, sz);
		
		var ex 		= $("#epos_x").val();
		var ez 		= $("#epos_z").val();
		var e_pts 	= main.convertPts(ex, ez);

		main.s_mesh.position.x = s_pts.x;
		main.s_mesh.position.z = s_pts.z;

		main.e_mesh.position.x = e_pts.x;
		main.e_mesh.position.z = e_pts.z;

		main.drawPlane(main.s_mesh.position, main.e_mesh.position);
		main.render();
	});
}

Step.prototype.convertAbs 	= function(x, z)
{
	var len_x 	= (this.grid.x_chunks - 5.5) / this.grid.GRID_DIVISIONS;
	var len_z 	= (this.grid.z_chunks - 2.5) / this.grid.GRID_DIVISIONS;

	var r_x 	= Math.round((x - (len_x / -2)) / len_x * 100) / 100;
	var r_z 	= Math.round((z - (len_z / -2)) / len_z * 100) / 100;

	var abs_x 	= this.grid.x * r_x;
	var abs_z 	= this.grid.z * r_z;

	return {x : abs_x, z : abs_z};
}

Step.prototype.convertPts 	= function(x, z)
{
	var len_x 	= (this.grid.x_chunks - 5.5) / this.grid.GRID_DIVISIONS;
	var len_z 	= (this.grid.z_chunks - 2.5) / this.grid.GRID_DIVISIONS;

	var r_x 	= x / this.grid.x;
	var r_z 	= z / this.grid.z;

	var pos_x 	= len_x * r_x - len_x / 2;
	var pos_z 	= len_z * r_z - len_z / 2;

	return {x : pos_x, z : pos_z};
}

Step.prototype.drawPlane 	= function(sPos, ePos)
{
	var distance 	= sPos.distanceTo(ePos);
	var mPos 		= {x : (sPos.x + ePos.x) / 2, y : (sPos.y + ePos.y) / 2, z : (sPos.z + ePos.z) / 2};
	var angle 		= Math.atan2(sPos.z - ePos.z, sPos.x - ePos.x);
	var geoplane 	= new THREE.PlaneGeometry( distance, sPos.y - 0.15, 10 );
	var plane 		= null;

	if(this.plane)
		this.scene.remove(this.plane);

	this.plane = new THREE.Mesh( geoplane, new THREE.MeshBasicMaterial({color: 0x0000FF, side: THREE.DoubleSide, transparent : true, opacity : this.trans}) );
	// this.plane.visible = false;
	this.plane.position.set(mPos.x, sPos.y / 2, mPos.z);
	this.plane.rotation.y = angle * (-1);

	this.scene.add(this.plane);
}

Step.prototype.updateInfo 	= function()
{
	var main 	= this;
	var s_abs 	= main.convertAbs(main.s_mesh.position.x, main.s_mesh.position.z);
	var e_abs 	= main.convertAbs(main.e_mesh.position.x, main.e_mesh.position.z);

	var html 	=  "Position : (" + s_abs.x +"," + s_abs.z + ") to ";
		html 	+= "(" + e_abs.x +"," + e_abs.z + ")";

	$("#info_pos").val(html);
}