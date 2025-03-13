var Plotter = function() {};

Plotter.prototype.setUp = function(parameters) {
	///////////////////////////////////
	//control elements
	var animation_frame;
	//html elements
	var container, renderer, top_view_rendeder, color_map_rendeder, axis_renderer, controls, gui, axis_container, top_view_container, color_map_container,
	composer, composerTop, renderScene, renderSceneTop, effectFXAA, top_ambient;
	//scene elements
	var camera, axisCamera, topCamera, scene, sceneAxis, colorMapScene;
	//3d objects
	var grid, plottedMesh, axis, color_map, shaders, step;
	//lights
	var spotLight, ambient, ambient_color_map, axis_ambient, axis_light;
	//variables
	var box_color = 0x444444, max, min, z_length;
	//global configuration
	var	global_scale = 0.01;
	//function
	var	reset_cam, light_follow_cam_function, check_consistency, set_uniforms, set_initial_uniforms;//,renderStart, renderEnd;
	var get_image_data, setUsingFXAA, getUsingFXAA;
	var getMinLimits, getMaxLimits, data_has_changed;
	var set_color_scheme_to_default, set_grid_text, get_grid_text;
	var renderStart, renderEnd, load_data, configure_gui, setExposure, getExposure, setShowGrid, getShowGrid, setShowMesh, getShowMesh, setShowBox, getShowBox, setBoxOpacity, getBoxOpacity;
	var setFlatShading, getFlatShading, setMeshShininess, getMeshShininess, setFactor, getFactor, setRotSpeed, getRotSpeed, setAutoRotateSpeed, getAutoRotateSpeed, setFocalLength, getFocalLength, setLight_x, getLight_x;
	var setLight_y, getLight_y, setLight_z, getLight_z, setLightIntensity, getLightIntensity, resetCam, moveScaleTo, setLightFollowCam, getLightFollowCam, setTopCutoff, getTopCutoff, setBottomCutoff, getBottomCutoff, setScale;
	var getScale, set_bottom_hsl, set_top_hsl, get_bottom_hsl, get_top_hsl, get_camera_information;
	var set_camera_data, set_tick_data, get_color_scheme, set_color_scheme;
	var slicingPlane, set_plane_point0, set_Plane_point1, get_plane_point0, get_plane_point1,
	set_plane_opacity, get_plane_opacity, set_plane_visible, get_plane_visible;
	//
	var gui_top_cutoff,	gui_bottom_cutoff,	max_height,	min_height, gui_top_color_limit, gui_bottom_color_limit;
	//exist renderers
	var using_axis = parameters.using_axis;
	var using_top_view = parameters.using_top_view;
	var using_color_map = parameters.using_color_map;
	//
	reset_cam = function() {
		controls.reset();
		camera.setFocalLength(animation_parameters.focalLength);
		camera.position.x 		= -0.6	* animation_parameters.focalLength * 1.1;
		camera.position.y 		= 0.32		* animation_parameters.focalLength * 1.1;
		camera.position.z 		= 0.6	* animation_parameters.focalLength * 1.1;
		camera.position.y 		+=  animation_parameters.reset_cam_suplement;
		camera.position.multiplyScalar(1 < animation_parameters.factor ? 1 + animation_parameters.factor * 0.1  : 1);
		controls.target.y 		= 	animation_parameters.reset_cam_suplement;
		controls.update();
		render();
	};
	//
	light_follow_cam_function = function() {
		animation_parameters.light_follow_cam = !animation_parameters.light_follow_cam;
		if (animation_parameters.light_follow_cam) {
			scene.remove(spotLight);
			camera.add(spotLight);
		}
		else {
			camera.remove(spotLight);
			scene.add(spotLight);
		}
		composer.render();
	};
	var modified;
	check_consistency = function(value) {
		modified = false;
		//_BottomCutoff > _TopCutoff
		if (animation_parameters._BottomCutoff > animation_parameters._TopCutoff) {
			animation_parameters._TopCutoff 	= Number(value);
			animation_parameters._BottomCutoff = Number(value);
			modified = true;
		}
		//_MinHeight > _MaxHeight
		if (animation_parameters._MinHeight > animation_parameters._MaxHeight) {
			animation_parameters._MinHeight = Number(value);
			animation_parameters._MaxHeight = Number(value);
			modified = true;
		}
		//_BottomColorLimit > _TopColorLimit
		if (animation_parameters._BottomColorLimit > animation_parameters._TopColorLimit) {
			animation_parameters._BottomColorLimit = Number(value);
			animation_parameters._TopColorLimit = Number(value);
			modified = true;
		}
		//_MinHeight > _BottomColorLimit
		if (animation_parameters._MinHeight > animation_parameters._BottomColorLimit) {
			animation_parameters._MinHeight = Number(value);
			animation_parameters._BottomColorLimit = Number(value);
			modified = true;
		}
		//_TopColorLimit > _MaxHeight
		if (animation_parameters._TopColorLimit > animation_parameters._MaxHeight) {
			animation_parameters._TopColorLimit = Number(value);
			animation_parameters._MaxHeight = Number(value);
			modified = true;
		}
		//check if there's a cascade modification
		if (modified) {
			check_consistency(value);
		}
		else {
			set_uniforms();
			data_has_changed();
			if (using_top_view) {
				render_top();
			}
		}
	};
		set_uniforms = function() {
			//plottedMesh.setUniform({name:"_ColorGradient", value: _ColorGradient});
			shaders.setUniform({name:"_TopCutoff", value: Number(animation_parameters._TopCutoff - min)});
			shaders.setUniform({name:"_BottomCutoff", value: Number(animation_parameters._BottomCutoff - min)});
			shaders.setUniform({name:"_TopColorLimit", value: Number(animation_parameters._TopColorLimit - min)});
			shaders.setUniform({name:"_BottomColorLimit", value: Number(animation_parameters._BottomColorLimit - min)});
			shaders.setUniform({name:"_MaxHeight", value: Number(animation_parameters._MaxHeight - min)});
			shaders.setUniform({name:"_MinHeight", value:  Number(animation_parameters._MinHeight - min)});
			//
		};
		set_initial_uniforms = function(value) {
			var sign = (max > 0 ? 1 : -1);
			var lenght = max - min;
			animation_parameters._TopCutoff			= max;//;
			animation_parameters._BottomCutoff		= min;//;
			animation_parameters._TopColorLimit		= max - sign * lenght * 0.3;//*=.70;
			animation_parameters._BottomColorLimit	= min + sign * lenght * 0.05;
			animation_parameters._MaxHeight			= max - sign * lenght * 0.05;//*=.90;;
			animation_parameters._MinHeight			= min;//;
			shaders.setColorGradientByArray(animation_parameters.color_scheme);
			set_uniforms();
		};
	//
	var animation_parameters = {
		showGrid		: 	true,
		showMesh		:   true,
		showBox			:   true,
		box_opacity		:   1,
		minDistance		: 	430,
		rotSpeed		: 	0.5,
		factor 			: 	1.0,
		exposure		: 	1.0,
		flatShading 	:   false,
		meshShininess 	: 	95,
		autoRotateSpeed	: 	0.0,
		focalLength 	:	55,
		reset_cam 		:   reset_cam,
		light_x			: 	50,
		light_y			: 	250,
		light_z			: 	500,
		light_intensity : 	0.5,
		_TopCutoff			: 0,
		_BottomCutoff		: 0,
		_TopColorLimit		: 0,
		_BottomColorLimit	: 0,
		_MaxHeight			: 0,
		_MinHeight			: 0,
		reset_cam_suplement : (min + z_length * 0.5),
		scale 				: global_scale,
		box_color			: box_color,
		max_anisotropy		: 1,
		gui_enable 			: parameters.gui_enable,
		light_follow_cam	: true,
		scale_using 		: "ZAxisHeight",
		light_follow_cam_function : light_follow_cam_function,
		using_fxaa 			: parameters.using_fxaa,
		using_hwaa			: parameters.using_hwaa,
		get_image_data		: function() { get_image_data(); },
		get_image_data_status : false,
		get_image_parameters : { width : 300, height: 200, callback: console.warn },
		png_name			: parameters.png_name || "screenshot.jpg",
		using_camera_memory	: parameters.using_camera_memory,
		cam_data			: parameters.cam_data,
		camera_data_callback	: parameters.camera_data_callback,
		background_color : parameters.background_color,
		axis_backgrond_color : parameters.axis_backgrond_color,
		top_view_background_color : parameters.top_view_background_color,
		color_map_background_color : parameters.color_map_background_color,
		using_render_on_change : parameters.using_render_on_change,
		set_color_scheme_to_default : function() { set_color_scheme_to_default(); },
		initial_grid_reference_text : parameters.initial_grid_reference_text,
		grid_references_text_configuration : parameters.grid_references_text_configuration,
		tick_information : parameters.tick_information,
		possible_scales : { absolute: "ZAxisAbsolute", centered : "ZAxisCentered", depth : "ZAxisDepth", height : "ZAxisHeight" },
		axis_size : parameters.axis_size,
		color_scheme : parameters.color_scheme || [
			{ stop : 0, r : 255, g : 255, b : 255, a : 1.0 },
			{ stop : 0.25, r : 255, g : 0, b : 0, a : 1.0 },
			{ stop : 0.45, r : 242, g : 255, b : 0, a : 1.0 },
			{ stop : 0.60, r : 13, g : 255, b : 0, a : 1.0 },
			{ stop : 0.75, r : 0, g : 247, b : 255, a : 1.0 },
			{ stop : 0.85, r : 0, g : 13, b : 255, a : 1.0 },
			{ stop : 1, r : 0, g : 0, b : 0, a : 1.0 },
		],
		default_color_scheme : parameters.color_scheme || [
			{ stop : 0, r : 255, g : 255, b : 255, a : 1.0 },
			{ stop : 0.25, r : 255, g : 0, b : 0, a : 1.0 },
			{ stop : 0.45, r : 242, g : 255, b : 0, a : 1.0 },
			{ stop : 0.60, r : 13, g : 255, b : 0, a : 1.0 },
			{ stop : 0.75, r : 0, g : 247, b : 255, a : 1.0 },
			{ stop : 0.85, r : 0, g : 13, b : 255, a : 1.0 },
			{ stop : 1, r : 0, g : 0, b : 0, a : 1.0 },
		],
		sp_point : [{x: 0, y: 0}, {x: 0, y: 0}],
		sp_opacity : 100,
		sp_visible : false
	};
	////////////////////////////////////
	//
	//	INITIALIZE SCENE
	function init() {
		// test if webgl is supported
		if (! Detector.webgl) Detector.addGetWebGLMessage();
		//setting up main variables and container
		container = document.getElementById(parameters.container_name || 'container');

    function getCssValuePrefix() {
		    var rtrnVal = '';
		    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

		    var dom = document.createElement('div');

		    for (var i = 0; i < prefixes.length; i++) {
		        dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';
		        if (dom.style.background) {
		            rtrnVal = prefixes[i];
		        }
		    }
		    dom = null;

		    return rtrnVal;
		}
		container.style.backgroundImage = getCssValuePrefix() + 'linear-gradient(#8e8e8e,#fff)';
		//
		var w = container.clientWidth;
		var h = container.clientHeight;
		////////////////////////////////////
		//
		//		MAIN
		//
		var dpr = window.devicePixelRatio || 1 ;
		renderer = new THREE.WebGLRenderer({
			sortObjects : false,
		antialias: animation_parameters.using_hwaa,
		alpha : true });
		renderer.setPixelRatio(dpr);
		renderer.setSize(w, h);
		renderer.setClearColor(0xf4f4d9, animation_parameters.background_color ? 1 : 0);
		renderer.toneMapping = THREE.LinearToneMapping;
		animation_parameters.max_anisotropy = renderer.getMaxAnisotropy();
		renderer.autoClear = false;
		renderer.sortObjects = true;
		container.appendChild(renderer.domElement);
		//
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, w / h, 1, 100);
		//
		composer = new THREE.EffectComposer(renderer);
		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
		renderScene = new THREE.RenderPass(scene, camera);
		effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
		effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
		var copyShader = new THREE.ShaderPass(THREE.CopyShader);
		copyShader.renderToScreen = true;
		composer.addPass(renderScene);
		composer.addPass(effectFXAA);
		composer.addPass(copyShader);
		//
		camera.setFocalLength(animation_parameters.focalLength);
		camera.position.x 		= -15	* animation_parameters.focalLength / 25;
		camera.position.y 		= 8	* animation_parameters.focalLength / 25;
		camera.position.z 		= 15 * animation_parameters.focalLength / 25;
		//
		controls = new THREE.OrbitControls(camera, container);
		controls.rotateSpeed 	= animation_parameters.rotSpeed;
		controls.zoomSpeed 		= animation_parameters.rotSpeed;
		controls.panSpeed 		= 1;
		controls.enableZoom 	= true;
		controls.enablePan 		= true;
		controls.enableRotate 	= true;
		controls.enableDamping 	= true;
		controls.dynamicFactor 	= 1;
		controls.minDistance 	= 1;
		controls.maxDistance 	= 10000;
		controls.autoRotateSpeed = animation_parameters.autoRotateSpeed;
		controls.autoRotate 	= true;
		controls.target 		= new THREE.Vector3(0, 0, 0);
		//
		scene.add(camera);
		//
		shaders = new Shaders();
		shaders.setUp();
		//
		grid = new Grid();
		grid.initialize({
			anisotropy : animation_parameters.max_anisotropy,
			config : animation_parameters.grid_references_text_configuration
		});

		step = new Step();
		step.initialize({
			scene 		: scene,
			render 		: render,
			renderer 	: renderer,
			camera 		: camera,
			control 	: controls,
			grid  		: grid
		});

		////////////////////////////////////
		//
		//		SETTING UP LIGHT
		//
		spotLight = new THREE.DirectionalLight(0xffffff, animation_parameters.light_intensity);
		spotLight.position.set(animation_parameters.light_x, animation_parameters.light_y, animation_parameters.light_z);
		//spotlight will be added to camera later otherwise it will cause problems
		ambient = new THREE.AmbientLight(0x666666);
		scene.add(ambient);
		////////////////////////////////////
		//
		//AXIS
		//
		if (using_axis) {
			//
			axis_container = document.getElementById(parameters.axis_container_name || 'axis_container');
			//
			axis_renderer = new THREE.WebGLRenderer({ antialias: true, alpha : true });
			axis_renderer.setPixelRatio(dpr);
			if (animation_parameters.axis_size) {
				axis_renderer.setSize(animation_parameters.axis_size.w, animation_parameters.axis_size.h);
			}
			else {
				axis_renderer.setSize(h * .25, h * .25);
			}
			axis_renderer.setClearColor(animation_parameters.axis_backgrond_color || 0xa4a4d9,
				animation_parameters.axis_backgrond_color ? 1 : 0);
			axis_renderer.toneMapping = THREE.LinearToneMapping;
			axis_renderer.autoClear = false;
			axis_renderer.sortObjects = true;
			axis_container.appendChild(axis_renderer.domElement);
			//
			if (animation_parameters.axis_size) {
				axisCamera = new THREE.OrthographicCamera(animation_parameters.axis_size.w / - 2, animation_parameters.axis_size.w / 2, animation_parameters.axis_size.h / 2, parameters.axis_size.h / - 2, -1000, 1000);
			}
			else {
				axisCamera = new THREE.OrthographicCamera(h * .28 / - 2, h * .28 / 2, h * .28 / 2, h * .28 / - 2, -1000, 1000);
			}
			sceneAxis = new THREE.Scene();
			axis = new AxisHelper();
			axis.setUp(5, animation_parameters.max_anisotropy);
			sceneAxis.add(axis.obj);
			axis_ambient = new THREE.AmbientLight(0xeeeeee);
			axis_light = new THREE.DirectionalLight(0xffffff, animation_parameters.light_intensity);
			sceneAxis.add(axis_ambient);
			sceneAxis.add(axis_light);
		}
		////////////////////////////////////
		//
		//TOP VIEW
		if (using_top_view) {

			top_view_container = document.getElementById(parameters.top_view_container_name || 'top_view_container');
			//
			top_view_rendeder = new THREE.WebGLRenderer({alpha : true});
			top_view_rendeder.setPixelRatio(dpr);
			top_view_rendeder.setSize(h * .25, h * .25);
			top_view_rendeder.setClearColor(animation_parameters.top_view_background_color || 0xa4a4d9,
				animation_parameters.top_view_background_color ? 1 : 0);
			top_view_rendeder.autoClear = false;
			top_view_rendeder.sortObjects = true;
			top_view_container.appendChild(top_view_rendeder.domElement);
			//
			topCamera = new THREE.OrthographicCamera(h * .25 / - 2, h * .25 / 2, h * .25 / 2, h * .25 / - 2, -100, 100);
			topCamera.rotation.x = -Math.PI * 0.5;
			//
			top_ambient = new THREE.AmbientLight(0xffffff);
			scene.add(top_ambient);
			top_ambient.visible = false;
			composerTop = new THREE.EffectComposer(top_view_rendeder);
			renderSceneTop = new THREE.RenderPass(scene, topCamera);
			renderSceneTop.renderToScreen = false;
			composerTop.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
			composerTop.addPass(renderSceneTop);
			var copyShader2 = new THREE.ShaderPass(THREE.CopyShader);
			copyShader2.renderToScreen = true;
			composerTop.addPass(copyShader2);

			
		}
		//
		if (using_color_map) {
			color_map_container = document.getElementById(parameters.color_map_container_name || 'color_map_container');
			//
			color_map_rendeder = new THREE.WebGLRenderer({ antialias: true, alpha : true  });
			color_map_rendeder.setPixelRatio(dpr);
			color_map_rendeder.setSize(h * .25, h * .25);
			color_map_rendeder.setClearColor(animation_parameters.color_map_background_color || 0xa4a4d9,
				animation_parameters.color_map_background_color ? 1 : 0);
			color_map_rendeder.toneMapping = THREE.LinearToneMapping;
			color_map_rendeder.autoClear = false;
			color_map_rendeder.sortObjects = true;
			color_map_container.appendChild(color_map_rendeder.domElement);
			//
			colorMapScene = new THREE.Scene();
			//
			color_map = new THREE.Mesh(new THREE.BoxBufferGeometry(95, 100, 75, 1, 1, 1),
				shaders.boxMaterial);
				color_map.geometry.translate(0, 50, 0);
				color_map.geometry.rotateX(Math.PI * 0.5);
				color_map.rotation.x = -Math.PI * 0.5;
				color_map.scale.set(1, 1, 2);
				color_map.position.set(0, -100, 0);
			//
			colorMapScene.add(color_map);
			ambient_color_map = new  THREE.AmbientLight(0xffffff);
			colorMapScene.add(ambient_color_map);
		}
		plottedMesh = new PlottedMesh();
		slicingPlane = new SlicingPlane();
		slicingPlane.setUp({visible : false});
		//
		if (animation_parameters.gui_enable) {
			initGUI();
		}
	}
	function render_top() {
		//turning off other stuff
		grid.setVisible(false);
		plottedMesh.viewTop();
		//
		top_view_rendeder.clear();
		composerTop.render();
		//
		spotLight.visible = false;
		top_ambient.visible = true;
		composerTop.render();
		top_ambient.visible = false;
		//rolling back
		plottedMesh.viewPerspective(animation_parameters.showBox);
		grid.setVisible(animation_parameters.showGrid);
		//
	}
	///////////////////////////////
	//
	//		ANIMATION AND RENDER FUNCTION.
	//
	renderStart = function() {
		controls.update();
		animate();
	};
	renderEnd = function() {
		window.cancelAnimationFrame(animation_frame);
		controls.update();
		if (animation_parameters.camera_data_callback) {
			animation_parameters.camera_data_callback(get_camera_information());
		}
		render();
	};
	function animate() {
		animation_frame = requestAnimationFrame(animate);
		controls.update();
		render();
	}
	function get_image_data_function() {
		animation_parameters.get_image_data_status = false;
		var ratio = Math.min(
			animation_parameters.get_image_parameters.width /
			(renderer.domElement.width || 0.001),
			animation_parameters.get_image_parameters.height /
			(renderer.domElement.height || 0.001));
			//
			var destWidth = renderer.domElement.width * ratio;
			var destHeight = renderer.domElement.height * ratio;
			var resizedCanvas = document.createElement("canvas");
			var resizedContext = resizedCanvas.getContext("2d");
			resizedCanvas.width = destWidth;
			resizedCanvas.height = destHeight;
			//
			resizedContext.drawImage(renderer.domElement, 0, 0, destWidth, destHeight);
			animation_parameters.get_image_parameters.callback(resizedCanvas.toDataURL('image/jpeg'));
	}
	var exposure = 0;
	function render() {
			grid.animate(camera);

			if (exposure !== animation_parameters.exposure) {
				renderer.toneMappingExposure = Math.pow(animation_parameters.exposure, 4.0);
				exposure = animation_parameters.exposure;
			}
			//
			if (!spotLight.visible) {
				//
				if (animation_parameters.using_fxaa) {
					composer.render();
				}
				else {
					renderer.clear();
					renderer.render(scene, camera);
				}
				spotLight.visible = true;
			}
			//
			if (animation_parameters.using_fxaa) {
				composer.render();
			}
			else {
				renderer.clear();
				renderer.render(scene, camera);
			}
			//
			if (animation_parameters.get_image_data_status) {
				get_image_data_function();
			}
			//
			if (using_axis)
				axisCamera.rotation.copy(camera.rotation);
			//
			if (using_axis) {
				axis_renderer.clear();
				axis_renderer .render(sceneAxis, axisCamera);
			}
			//
			if (using_color_map) {
				color_map_rendeder.clear();
				color_map_rendeder.render(colorMapScene, axisCamera);
			}
	}
	///////////////////////////////
	//
	//		EVENTS LISTENERS
	//
	// function onWindowResize(width = 0, height = 0) {
	// 	var dpr = window.devicePixelRatio || 1 ;
	// 	var w = width || container.clientWidth;
	// 	var h = height || container.clientHeight;
	// 	camera.aspect =  w / h;
	// 	camera.updateProjectionMatrix();
	// 	effectFXAA.uniforms['resolution'].value.set(1 / (w * dpr), 1 / (h * dpr));
	// 	composer.setSize(w * dpr, h * dpr);
	// 	renderer.setSize(w, h);
	// 	//other cameras are always 1:1, that's why we don't need to update them
	// 	if (using_axis && !animation_parameters.axis_size) {
	// 		axis_renderer.setSize(h * .25, h * .25);
	// 	}
	// 	if (using_color_map) {
	// 		color_map_rendeder.setSize(h * .25, h * .25);
	// 	}
	// 	if (using_top_view) {
	// 		top_view_rendeder.setSize(h * .25, h * .25);
	// 	}
	// 	render();
	// }
	// if (parameters.using_windows_resize_event) {
	// 	
	// 	window.addEventListener('resize', function() { onWindowResize(); }, false);
	// }
	function dismantle() {
		window.cancelAnimationFrame(animation_frame);
        animation_frame = undefined;
        //
		plottedMesh.dispose();
		scene.remove(plottedMesh.obj);
		scene.remove(grid.obj3d);
		scene.remove(plottedMesh.box);
		//
		//composer.render();
		if (using_top_view)
			render_top();
		if (using_axis) {
			sceneAxis.remove(axis);
			axis.dispose();
		}
		if (animation_parameters.using_color_map) {
			colorMapScene.remove(color_map);
		}
	}
	//starting the animation if there's data available
	if (parameters.data) {
		load_data(parameters.data);
	}
	configure_gui = function() {
		
		if (animation_parameters.gui_enable) {
			var step = 0.001;
			var max = plottedMesh.getMax();
			var min = plottedMesh.getMin();
			//
			gui.gui_top_cutoff.min(min);gui.gui_top_cutoff.max(max);gui.gui_top_cutoff.step(step);
			gui.gui_bottom_cutoff.min(min);gui.gui_bottom_cutoff.max(max);gui.gui_bottom_cutoff.step(step);
			gui.gui_top_color_limit.min(min);gui.gui_top_color_limit.max(max);gui.gui_top_color_limit.step(step);
			gui.gui_bottom_color_limit.min(min);gui.gui_bottom_color_limit.max(max);gui.gui_bottom_color_limit.step(step);
			gui.max_height.min(min);gui.max_height.max(max);gui.max_height.step(step);
			gui.min_height.min(min);gui.min_height.max(max);gui.max_height.step(step);
		}
	};
	//
	load_data = function(data) {

		parameters.data = data;
		plottedMesh.load(parameters.data, animation_parameters, grid, shaders, slicingPlane);
		scene.add(plottedMesh.obj);
		//
		plottedMesh.setVisible(animation_parameters.showMesh);
		plottedMesh.obj.updateMatrix();
		min				= plottedMesh.getMin();
		max 			= plottedMesh.getMax();
		z_length		= plottedMesh.getZLenght();
		//
				scene.add(slicingPlane.obj);

		// scene.add(grid.obj3d);
		// scene.add(plottedMesh.box);

		slicingPlane.setPoints({x:0, y:0}, {x:600, y:300});
		//slicingPlane.setScale(plottedMesh.getScale());
		//
		grid.setTickData(animation_parameters.tick_information);
		grid.setUsingTickData(animation_parameters.scale_using);
		grid.obj3d.matrixAutoUpdate = false;
		grid.obj3d.updateMatrix();
		set_initial_uniforms();
		reset_cam();
		configure_gui();
		if (animation_parameters.initial_grid_reference_text) {
			set_grid_text(animation_parameters.initial_grid_reference_text);
		}
		if (animation_parameters.using_camera_memory && animation_parameters.cam_data) {
			var p = animation_parameters.cam_data.position;
			var t = animation_parameters.cam_data.target;
			var r = animation_parameters.cam_data.rotation;
			camera.position.set(p.x, p.y, p.z);
			camera.rotation.set(r.x, r.y, r.z);
			controls.update();
			controls.target.set(t.x, t.y, t.z);
		}
		parameters.run_callback();
	};

		//////////////////////////////////////////////
		//
		///		API
		//
		set_plane_opacity = function(aFloat) {
			slicingPlane.setOpacity(aFloat);
			data_has_changed();
		};
		get_plane_opacity = function() {
			return slicingPlane.getOpacity();
		};
		set_plane_visible = function(aBoolean) {
			slicingPlane.setVisible(aBoolean);
			data_has_changed();
		};
		get_plane_visible = function() {
			return slicingPlane.getVisible;
		};
		set_plane_point0 = function(x, y) {
			slicingPlane.setPoints({x:x, y:y}, 0);
			data_has_changed();
		};

		set_Plane_point1 = function(x, y) {
			slicingPlane.setPoints({x:x, y:y}, 1);
			data_has_changed();
		};

		get_plane_point0 = function() {
			slicingPlane.getPoints().a;
		};
		get_plane_point1 = function() {
			slicingPlane.getPoints().b;
		};
		var light_position_change = function() {
			spotLight.position.set(animation_parameters.light_x,
									animation_parameters.light_y,
									animation_parameters.light_z);
			data_has_changed();
		};
		setExposure = function(aFloat) {
			if (aFloat > 2 || aFloat  < 0.1) console.warn("values should be between 2 and 0.1");
			animation_parameters.exposure = aFloat;
			renderer.toneMappingExposure = Math.pow(animation_parameters.exposure, 4.0);
			data_has_changed();
		};
		getExposure = function() {
			return animation_parameters.exposure;
		};
		setShowGrid = function(aBoolean) {
			grid.obj3d.visible = aBoolean;
			animation_parameters.showGrid = aBoolean;
			data_has_changed();
		};
		getShowGrid = function() {
			return animation_parameters.showGrid;
		};
		setShowMesh = function(aBoolean) {
			animation_parameters.showMesh = aBoolean;
			plottedMesh.setVisible(aBoolean);
			data_has_changed();
		};
		getShowMesh = function(aBoolean) {
			return animation_parameters.showMesh;
		};
		setShowBox = function(aBoolean) {
			animation_parameters.showBox = aBoolean;
			plottedMesh.setBoxVisible(aBoolean);
			data_has_changed();
		};
		getShowBox = function() {
			return animation_parameters.showBox;
		};
		setBoxOpacity = function(aFloat) {
			if (aFloat > 1 || aFloat  < 0.0) console.warn("values should be between 1 and 0.0");
			animation_parameters.box_opacity = aFloat;
			plottedMesh.setBoxOpacity(aFloat);
			data_has_changed();
		};
		getBoxOpacity = function() {
			return animation_parameters.box_opacity;
		};
		setFlatShading = function(aBoolean) {
			animation_parameters.flatShading = aBoolean;
			plottedMesh.setShading(aBoolean);
			data_has_changed();
		};
		getFlatShading = function() {
			return animation_parameters.flatShading;
		};
		setMeshShininess = function(aFloat) {
			if (aFloat > 100.0 || aFloat  < 0.0) console.warn("values should be between 100.0 and 0.0");
			animation_parameters.meshShininess = aFloat;
			plottedMesh.setPlottedMeshShininess(aFloat);
			data_has_changed();
		};
		getMeshShininess = function() {
			return animation_parameters.meshShininess;
		};
		setFactor = function(aFloat) {
			if (aFloat > 5.0 || aFloat < 0.00) console.warn("values should be between 2.0 and 0.05");
			animation_parameters.factor = aFloat;
			plottedMesh.setScale(aFloat);
			grid.scale(aFloat);
			data_has_changed();
		};
		getFactor = function() {
			return animation_parameters.factor;
		};
		setRotSpeed = function(aFloat) {
			if (aFloat > 5.0 || aFloat  < 0.0) console.warn("values should be between 5.0 and 0.0");
			controls.rotateSpeed = aFloat;
			controls.zoomSpeed	= aFloat;
			animation_parameters.rotSpeed = aFloat;
			data_has_changed();
		};
		getRotSpeed = function() {
			return animation_parameters.rotSpeed;
		};
		setAutoRotateSpeed = function(aFloat) {
			if (aFloat > 5.0 || aFloat  < 0.0) console.warn("values should be between 5.0 and 0.0");
			controls.autoRotateSpeed = aFloat;
			animation_parameters.autoRotateSpeed = aFloat;
			data_has_changed();
		};
		getAutoRotateSpeed = function() {
			return animation_parameters.autoRotateSpeed;
		};
		setFocalLength = function(aFloat) {
			if (aFloat > 80.0 || aFloat  < 18.0) console.warn("values should be between 80.0 and 18.0");
			animation_parameters.focalLength = aFloat;
			reset_cam();
		};
		getFocalLength = function() {
			return animation_parameters.focalLength;
		};
		setLight_x = function(aFloat) {
			if (aFloat > 2000 || aFloat  < -2000) console.warn("values should be between 2000.0 and -2000.0");
			animation_parameters.light_x = aFloat;
			light_position_change();
		};
		getLight_x = function() {
			return animation_parameters.light_x;
		};
		setLight_y = function(aFloat) {
			if (aFloat > 2000 || aFloat  < -2000) console.warn("values should be between 2000.0 and -2000.0");
			animation_parameters.light_y = aFloat;
			light_position_change();
		};
		getLight_y = function() {
			return animation_parameters.light_y;
		};
		setLight_z = function(aValue) {
			if (aValue > 2000 || aValue  < -2000) console.warn("values should be between 2000.0 and -2000.0");
			animation_parameters.light_z = aValue;
			light_position_change();
		};
		getLight_z = function() {
			return animation_parameters.light_z;
		};
		setLightIntensity = function(aFloat) {
			if (aFloat > 1.5 || aFloat  < 0.5) console.warn("values should be between 1.5 and 0.5");
			animation_parameters.light_intensity = aFloat;
			spotLight.intensity = aFloat;
			data_has_changed();
		};
		getLightIntensity = function() {
			return animation_parameters.light_intensity;
		};
		resetCam = function() {
			animation_parameters.reset_cam();
			data_has_changed();
		};
		moveScaleTo = function(anIndex) {
			console.warn("deprecated");
			grid.moveScaleTo(anIndex);
			data_has_changed();
		};
		setLightFollowCam = function(aBoolean) {
			if (animation_parameters.light_follow_cam !== aBoolean) {
				animation_parameters.light_follow_cam = aBoolean;
				if (animation_parameters.light_follow_cam) {
					scene.remove(spotLight);
					camera.add(spotLight);
				}
				else {
					camera.remove(spotLight);
					scene.add(spotLight);
				}
			}
			data_has_changed();
		};
		getLightFollowCam = function() {
			return animation_parameters.light_follow_cam;
		};
		setTopCutoff = function(aFloat) {
			if (aFloat > max || aFloat  < min) console.warn("values should be between " + max + " and " + min);
			animation_parameters._TopCutoff = aFloat;
			check_consistency(aFloat);
		};
		getTopCutoff = function() {
			return animation_parameters._TopCutoff;
		};
		setBottomCutoff = function(aFloat) {
			if (aFloat > max || aFloat  < min) console.warn("values should be between " + max + " and " + min);
			animation_parameters._BottomCutoff = aFloat;
			check_consistency(aFloat);
		};
		getBottomCutoff = function() {
			return animation_parameters._BottomCutoff;
		};
		get_image_data = function(aWidthHeightAndCallback) {
			if  (aWidthHeightAndCallback) {
				animation_parameters.get_image_parameters.width =
					aWidthHeightAndCallback.maxWidth;
				animation_parameters.get_image_parameters.height =
					aWidthHeightAndCallback.maxHeight;
				animation_parameters.get_image_parameters.callback =
					aWidthHeightAndCallback.readyCallback;
			}
			animation_parameters.get_image_data_status = true;
			data_has_changed();
		};
		setUsingFXAA = function(aBoolean) {
			animation_parameters.using_fxaa = aBoolean;
			data_has_changed();
		};
		getUsingFXAA = function() {
			return animation_parameters.using_fxaa;
		};
		getMinLimits = function() {
			return min;
		};
		getMaxLimits = function() {
			return max;
		};
		setScale = function(aScaleName) {
			animation_parameters.scale_using = aScaleName;
			grid.setUsingTickData(animation_parameters.scale_using);
			setFactor(animation_parameters.factor);
			data_has_changed();
		};
		getScale = function() {
			return animation_parameters.scale_using;
		};
		set_camera_data = function(aCameraData) {
			var p = aCameraData.position;
			var t = aCameraData.target;
			var r = aCameraData.rotation;
			camera.position.set(p.x, p.y, p.z);
			camera.rotation.set(r.x, r.y, r.z);
			controls.update();
			controls.target.set(t.x, t.y, t.z);
		};
		get_camera_information = function() {
			return {
				position : {
					x : camera.position.x,
					y : camera.position.y,
					z : camera.position.z
				},
				target : {
					x : controls.target.x,
					y : controls.target.y,
					z : controls.target.z
				},
				rotation : {
					x : camera.rotation.x,
					y : camera.rotation.y,
					z : camera.rotation.z
				}
			};
		};
		get_color_scheme = function() {
			return animation_parameters.color_scheme;
		};
		set_color_scheme = function(aColorScheme) {
			animation_parameters.color_scheme = aColorScheme;
			shaders.setColorGradientByArray(aColorScheme);
			data_has_changed();
		};
		set_color_scheme_to_default = function() {
			set_color_scheme(animation_parameters.default_color_scheme);
		};
		set_grid_text = function(someGridTexts) {
			grid.setGridText(someGridTexts);
			data_has_changed();
		};
		get_grid_text = function() {
			return grid.getGridText();
		};
		set_tick_data = function(someTickData) {
			grid.setTickData(someTickData);
			grid.setUsingTickData(animation_parameters.scale_using);
			data_has_changed();
		};

		this.setPlaneOpacity = function(aFloat) { set_plane_opacity(aFloat); };
		this.getPlaneOpacity = function() { return get_plane_opacity(); };
		this.setPlaneVisible = function(aBoolean) { set_plane_visible(aBoolean); };
		this.getPlaneVisible = function() { return get_plane_visible(); };
		this.setPlanePoint0 = function(x, y) { set_plane_point0(x, y); };
		this.setPlanePoint1 = function(x, y) { set_Plane_point1(x, y); };
		this.getPlanePoint0 = function() { return get_plane_point0(); };
		this.getPlanePoint1 = function() { return get_plane_point1(); };
		this.getColorScheme = function() { return get_color_scheme(); };
		this.setTickData = function(someTickData) { set_tick_data(someTickData); };
		this.setCameraData = function(aCameraData) { set_camera_data(aCameraData); };
		this.setScale = function(aScaleName) { return setScale(aScaleName); };
		this.getScale = function() { return getScale(); };
		this.getMinCutoff = function() { return getMinLimits(); };
		this.getMaxCutoff = function() { return getMaxLimits(); };
		this.getImageData = function(aWidthHeightAndCallback) { return get_image_data(aWidthHeightAndCallback); };
		this.setUsingFXAA = function(aBoolean) { return setUsingFXAA(aBoolean); };
		this.getUsingFXAA = function() { return getUsingFXAA(); };
		this.getBottomCutoff = function() { return getBottomCutoff(); };
		this.setBottomCutoff = function(aFloat) { return setBottomCutoff(aFloat); };
		this.getTopCutoff = function() { return getTopCutoff(); };
		this.setTopCutoff = function(aFloat) { setTopCutoff(aFloat); };
		this.getLightFollowCam = function() { return getLightFollowCam(); };
		this.setLightFollowCam = function(aBoolean) { return setLightFollowCam(aBoolean); };
		this.moveScaleTo = function(anIndex) { moveScaleTo(anIndex); };
		this.resetCam = function() { return resetCam(); };
		this.setLightIntensity = function(aFloat) { setLightIntensity(aFloat); };
		this.getLightIntensity = function() { return getLightIntensity(); };
		this.getLight_z = function() { return getLight_z(); };
		this.setLight_z = function(aValue) { setLight_z(aValue); };
		this.getFocalLength = function() { return getFocalLength(); };
		this.setLight_x = function(aFloat) { return setLight_x(aFloat); };
		this.getLight_x = function() { return getLight_x(); };
		this.setLight_y = function(aFloat) { return setLight_y(aFloat); };
		this.getLight_y = function() { return getLight_y(); };
		this.setRotSpeed = function(aFloat) { return setRotSpeed(aFloat); };
		this.getRotSpeed = function() { return getRotSpeed(); };
		this.setAutoRotateSpeed = function(aFloat) { return setAutoRotateSpeed(aFloat); };
		this.getAutoRotateSpeed = function() { return getAutoRotateSpeed(); };
		this.setFocalLength = function(aFloat) { return setFocalLength(aFloat); };
		this.getFlatShading = function() { return getFlatShading(); };
		this.setMeshShininess = function(aFloat) { return setMeshShininess(aFloat); };
		this.getMeshShininess = function() { return getMeshShininess(); };
		this.setFactor = function(aFloat) { return setFactor(aFloat); };
		this.getFactor = function() { return getFactor(); };
		this.setShowMesh = function(aBoolean) { return setShowMesh(aBoolean); };
		this.getShowMesh = function() { return getShowMesh(); };
		this.setShowBox = function(aBoolean) { return setShowBox(aBoolean); };
		this.getShowBox = function() { return getShowBox(); };
		this.setBoxOpacity = function(aBoolean) { return setBoxOpacity(aBoolean); };
		this.getBoxOpacity = function() { return getBoxOpacity(); };
		this.setFlatShading = function(aBoolean) { return setFlatShading(aBoolean); };
		this.setExposure = function(aFloat) { return setExposure(aFloat); };
		this.getExposure = function() { return getExposure(); };
		this.setShowGrid = function(aBoolean) { return setShowGrid(aBoolean); };
		this.getShowGrid = function() { return getShowGrid(); };
		this.setBottomHSL = function(anHSLArray) { set_bottom_hsl(anHSLArray); };
		this.setTopHSL = function(anHSLArray) { set_top_hsl(anHSLArray); };
		this.getBottomHSL = function() { return get_bottom_hsl(); };
		this.getTopHSL = function() { return get_top_hsl(); };
		this.getCameraInformation = function() { return get_camera_information(); };
		this.setColorSchemeToDefault = function() { set_color_scheme_to_default(); };
		this.setColorScheme = function(aColorScheme) { set_color_scheme(aColorScheme); };
		this.getGridText = function() { return get_grid_text(); };
		this.setGridText = function(someGridTexts) { set_grid_text(someGridTexts); };

		this.zoomIn = function() {
		  controls.zoomIn();
		  controls.update();
		  render();
		};
		this.zoomOut = function() {
		  controls.zoomOut();
		  controls.update();
		  render();
		};
		//
	function initGUI() {

		gui = new dat.GUI();
		gui.add(animation_parameters, 'exposure', 0.1, 2).onChange(setExposure);
		gui.add(animation_parameters, "showGrid").onChange(setShowGrid);
		gui.add(animation_parameters, "showMesh").onChange(setShowMesh);
		gui.add(animation_parameters, "showBox").onChange(setShowBox);
		gui.add(animation_parameters, "box_opacity", 0, 1, 0.05).onChange(setBoxOpacity);
		gui.add(animation_parameters, "flatShading").onChange(setFlatShading);
		gui.add(animation_parameters, "meshShininess", 0, 100).onChange(setMeshShininess);
		gui.add(animation_parameters, "factor", 0.00, 2, 0.01).onChange(setFactor);
		gui.add(animation_parameters, "rotSpeed", 0, 5, 0.01).onChange(setRotSpeed);
		gui.add(animation_parameters, "autoRotateSpeed", 0, 5, 0.1).onChange(setAutoRotateSpeed);
		gui.add(animation_parameters, "focalLength", 12, 85).onChange(setFocalLength);
		gui.add(animation_parameters, "light_x", -2000, 2000, 10).onChange(light_position_change);
		gui.add(animation_parameters, "light_y", 	0, 2000, 10).onChange(light_position_change);
		gui.add(animation_parameters, "light_z", -2000, 2000, 10).onChange(light_position_change);
		gui.add(animation_parameters, "light_intensity", 0.5, 1.5).onChange(setLightIntensity);
		gui.add(animation_parameters, "scale_using", animation_parameters.possible_scales).onChange(function(value) {
			setScale(value);
		});
		gui.add(animation_parameters, "reset_cam");
		gui.add(animation_parameters, "light_follow_cam_function");
		gui.add(animation_parameters, "set_color_scheme_to_default");
		gui.add(animation_parameters, "get_image_data").listen();
		//we need to listen because one value can change others
		gui_top_cutoff = gui.add(animation_parameters, "_TopCutoff", 0, 0);
		gui_top_cutoff.listen();
		gui_top_cutoff.onChange(check_consistency);
		gui.gui_top_cutoff = gui_top_cutoff;
		//
		gui_bottom_cutoff = gui.add(animation_parameters, "_BottomCutoff", 0, 0);
		gui_bottom_cutoff.listen();
		gui_bottom_cutoff.onChange(check_consistency);
		gui.gui_bottom_cutoff = gui_bottom_cutoff;
		//
		gui_top_color_limit = gui.add(animation_parameters, "_TopColorLimit", 0, 0);
		gui_top_color_limit.listen();
		gui_top_color_limit.onChange(check_consistency);
		gui.gui_top_color_limit = gui_top_color_limit;
		//
		gui_bottom_color_limit = gui.add(animation_parameters, "_BottomColorLimit", 0, 0);
		gui_bottom_color_limit.listen();
		gui_bottom_color_limit.onChange(check_consistency);
		gui.gui_bottom_color_limit = gui_bottom_color_limit;
		//
		max_height = gui.add(animation_parameters, "_MaxHeight", 0, 0);
		max_height.listen();
		max_height.onChange(check_consistency);
		gui.max_height = max_height;
		//
		min_height = gui.add(animation_parameters, "_MinHeight", 0, 0);
		min_height.listen();
		min_height.onChange(check_consistency);
		gui.min_height = min_height;
		//
		gui.add(animation_parameters.sp_point[0], "x", 0, 1000).onChange(
			function(val) { set_plane_point0(val, animation_parameters.sp_point[0].y); });
		gui.add(animation_parameters.sp_point[0], "y", 0, 1000).onChange(
			function(val) { set_plane_point0(animation_parameters.sp_point[0].x, -val); });
		//
		gui.add(animation_parameters.sp_point[1], "x", 0, 1000).onChange(
			function(val) { set_Plane_point1(val, animation_parameters.sp_point[1].y); });
			gui.add(animation_parameters.sp_point[1], "y", 0, 1000).onChange(
			function(val) { set_Plane_point1(animation_parameters.sp_point[1].x, -val); });

		gui.add(animation_parameters, "sp_opacity", 0, 1, 0.01).onChange(
			set_plane_opacity);
		gui.add(animation_parameters, "sp_visible").onChange(
			set_plane_visible);

		//gui.add(animation_parameters.set_plane_opacity)this.setPlaneOpacity = function(aFloat) { set_plane_opacity(aFloat); };
		//gui.add(animation_parameters.set_plane_opacity)this.getPlaneOpacity = function() { return get_plane_opacity(); };
		//gui.add(animation_parameters.set_plane_opacity)this.setPlaneVisible = function(aBoolean) { set_plane_visible(aBoolean); };
		//gui.add(animation_parameters.set_plane_opacity)this.getPlaneVisible = function() { return get_plane_visible(); };
	}
	//
	var run = function() {
		initRender();
		if (!animation_parameters.using_render_on_change)
			animate();
	};
	data_has_changed = function() {
		if (animation_parameters.using_render_on_change)
			render();
	};
	var rerender = function() {
		render();
		if (using_top_view) {
			render_top();
		}
	};
	var initRender = function() {
		camera.add(spotLight);
		if (animation_parameters.using_render_on_change) {
			controls.addEventListener('start', renderStart);
			controls.addEventListener('end', renderEnd);
		}
		render();
		if (using_top_view) {
			render_top();
		}
	};
	//
	this.clear    = function() { dismantle(); };
	this.run    = function() { run(); };
	this.author = function() { return "@tinotibaldo"; };
	// this.redraw = function(width = 0, height = 0) { onWindowResize(width, height); };
	this.rerender = function() { rerender(); };
	this.loadData = function(data) { load_data(data); };
	init();
};

if (typeof module === 'object') {
    module.exports = Plotter;
}
