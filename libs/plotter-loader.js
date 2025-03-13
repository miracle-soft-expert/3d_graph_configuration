var plotter;

window.onload = function() {
	plotter_loader();
};

var plotter_loader = function() {
	//var plotter;
	var meter  = document.getElementById('meter');
	var load_callback = function(val) {
			meter.style.width = val + '%';
	};

	var run_callback = function() {
		 plotter.run();
		 document.getElementById('loader_spinner').style.display = 'none';
	};

	var parameters = {
		container_name 	: 'plotter-container',
		run_callback 	: run_callback,
		gui_enable		: true,
		using_axis		: true,
		axis_size		: {w :400, h : 250},
		using_top_view	: true,
		using_color_map	: true,
		//axis_backgrond_color : false, //false or just undefined for transparent
		top_view_background_color : '#a4a4a9',
		color_map_background_color : 0xf4a4d9,
		background_color : false,
		using_windows_resize_event : true,
		//this can't be changed on runtime
		//using hardware AA it's only good on certain models
		//so most of the time you'd prefer to use FXAA instead
		//axis, top_view, color_map
		using_hwaa : false,
		//FXAA can be changed during runtime with setUsingFXAA(aBoolean)
		using_fxaa : true,
		using_camera_memory : false,
		cam_data	: {
			position : { x : 5.2245, y : 14.9918, z : 53.9511},
			target : { x : 4.3878, y : -3.8694, z : 7.7849},
			rotation : { x : -0.3878, y : 0.0167, z : 0.0068}
		},
		//callback to be call after the user stop moving the camera.
		camera_data_callback : function() {},
		//if the rendering is only done after the user has moved the camera.
		using_render_on_change : true,
		initial_grid_reference_text : {
			xDistanceLabel: 'X distance',
			yDistanceLabel: 'Y distance',
			zHeightLabel: 'z Height'
		},
		grid_references_text_configuration : {
			/*
			unitXY: string (milimeter/micron/inch/milinch/microinch),
    		unitZ: string (auto/milimeter/micron/nanometer/angstorm/milinch/microinch),
    		numberFormat: string (significant/decimal),
    		numberFormatValue: int,
    		displayTrailingZeros: bool
    		*/
			unitXY : 'micron',
			unitZ : 'angstrom',
			numberFormat : 'significant',
			numberFormatValue : 4,
			displayTrailingZeros : true
		},
		//tick information
		tick_information : {
			UnitCodes: {
			  System: 0,
			  XYUnits: 2,
			  ZUnits: 2
			},
			XAxis: {
			  InvertAxis: true,
			  max: 650,
			  min: -300,
			  ticSpacing: 3,
			  values: [ -200, 100, 400, 700 ]
			},
			YAxis: {
			  InvertAxis: true,
			  max: 750,
			  min: -500,
			  ticSpacing: 1,
			  values: [ -200, 0, 200, 400 ]
			},
			ZAxisAbsolute: {
			  InvertAxis: false,
			  max: 2.2765998840332031,
			  min: -1.8756999969482422,
			  ticSpacing: 10,
			  values: [ -1, 0, 1, 2 ]
			},
			ZAxisCentered: {
			  InvertAxis: true,
			  max: 2.1766075134277344,
			  min: -1.8756923675537109,
			  ticSpacing: 4,
			  values: [ -1, 0, 1, 2 ]
			},
			ZAxisDepth: {
			  InvertAxis: true,
			  max: 4.1522998809814453,
			  min: 0,
			  ticSpacing: 3,
			  values: [ 0, 1, 2, 3, 4 ]
			},
			ZAxisHeight: {
			  InvertAxis: false,
			  max: 4.1522998809814453,
			  min: .8,
			  ticSpacing: 9,
			  values: [ 1, 1.7, 2, 3.2, 4, 10 ]
			}
		},
		color_gradient : [
			{ stop : 0, r : 255, g : 255, b : 255, a : 1.0 },
			{ stop : 0.25, r : 255, g : 0, b : 0, a : 1.0 },
			{ stop : 0.45, r : 242, g : 255, b : 0, a : 1.0 },
			{ stop : 0.60, r : 13, g : 255, b : 0, a : 1.0 },
			{ stop : 0.75, r : 0, g : 247, b : 255, a : 1.0 },
			{ stop : 0.85, r : 0, g : 13, b : 255, a : 1.0 },
			{ stop : 1, r : 0, g : 0, b : 0, a : 1.0 },
		]

	};

	//var
	plotter = new Plotter();
	plotter.setUp(parameters);
	var selected = (window.location.search.substr(1) || 'Jas.bin');

	function updateProgress(oEvent) {
		if (oEvent.lengthComputable) {
			var percentComplete = oEvent.loaded / oEvent.total;
			load_callback(percentComplete * 90 + 10);
		}
		else {
			// Unable to compute progress information since the total size is unknown
		}
	}

	function load_binary_resource(url) {
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('progress', updateProgress);
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		//
		xhr.onload = function(e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//public uint cols { get; set; }
					//public uint rows { get; set; }
					//public float pixelSize { get; set; }
					//public float zMin { get; set; }
					//public float zMax { get; set; }
					//public float[] zData { get; set; }
					var cols = new Uint32Array(xhr.response, 0, 1);
					var pixelSize = new Float32Array(xhr.response, 8, 1);
					var rows = new Uint32Array(xhr.response, 4, 1);
					var zMax = new Float32Array(xhr.response, 16, 1);
					var zMin = new Float32Array(xhr.response, 12, 1);
					var zData = new Float32Array(xhr.response, 20);
					delete(xhr.response);
					//
					var data = {
						cols : cols[0],
						rows : rows[0],
						pixelSize : pixelSize[0],
						zMin : zMin[0],
						zMax : zMax[0],
						zData : zData
					};
					//
					plotter.loadData(data);
				}
				else {
					console.warn(xhr.statusText);
				}
			}
		};
		xhr.onerror = function(e) {
			console.warn(xhr.statusText);
		};
		xhr.send(null);
	}
	load_binary_resource(selected);
	if (GridTestingSetUp)
		GridTestingSetUp(parameters.tick_information, plotter);
};
