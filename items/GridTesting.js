
GridTestingSetUp = function(ticks, plotter) {

	return false;
	var main_div, text_field, ul, li, text, i, j, item_to_test,  
	
	main_div = document.createElement('div');
	ul = document.createElement('ul');
	main_div.style.position = "absolute";
	main_div.style.bottom = '0px'; 

	item_names = ['XAxis', 'YAxis', 'ZAxisHeight'];
	item_to_test = ticks;

	for (j = 0; j < item_names.length; j++){
		
		text_field = document.createElement('input');
		text_field.setAttribute( 'type', "checkbox");
		text_field.addEventListener(
  			   'change',
  			   	(function(a,b) { return function() {
  			    	item_to_test[item_names[a]].InvertAxis = this.checked;
  			    	plotter.setTickData(item_to_test);
  			    }})(j,i),
  			   false
  		);		
		text_field.checked = item_to_test[item_names[j]].InvertAxis;
		li = document.createElement('li');
		text = document.createTextNode(
			item_names[j] + " " + "InvertAxis"
		);
		li.appendChild(text);
		li.appendChild(text_field);
		ul.appendChild(li);
		
		text_field = document.createElement('input');
		text_field.addEventListener(
  			   'change',
  			   	(function(a,b) { return function() {
  			    	item_to_test[item_names[a]].ticSpacing = Number(this.value);
  			    	plotter.setTickData(item_to_test);
  			    }})(j,i),
  			   false
  		);
		text_field.setAttribute( 'type', "number");
		text_field.setAttribute( 'value', item_to_test[item_names[j]].ticSpacing);
		li = document.createElement('li');
		text = document.createTextNode(
			item_names[j] + " " + 'ticSpacing'
		);
		li.appendChild(text);
		li.appendChild(text_field);
		ul.appendChild(li);

		text_field = document.createElement('input');
		text_field.addEventListener(
  			   'change',
  			   	(function(a,b) { return function() {
  			    	item_to_test[item_names[a]].max = Number(this.value);
  			    	plotter.setTickData(item_to_test);
  			    }})(j,i),
  			   false
  		);
		text_field.setAttribute( 'type', "number");
		text_field.setAttribute( 'value', item_to_test[item_names[j]].max);
		li = document.createElement('li');
		text = document.createTextNode(
			item_names[j] + " " + 'max'
		);
		li.appendChild(text);
		li.appendChild(text_field);
		ul.appendChild(li);

		text_field = document.createElement('input');
		text_field.addEventListener(
  			   'change',
  			   	(function(a,b) { return function() {
  			    	item_to_test[item_names[a]].min = Number(this.value);
  			    	plotter.setTickData(item_to_test);
  			    }})(j,i),
  			   false
  			);
		text_field.setAttribute( 'type', "number");
		text_field.setAttribute( 'value', item_to_test[item_names[j]].min);
		li = document.createElement('li');
		text = document.createTextNode(
			item_names[j] + " " + 'min'
		);
		li.appendChild(text);
		li.appendChild(text_field);
		ul.appendChild(li);


		length = item_to_test[item_names[j]].values.length;

		for (i = 0; i < length; i++){
			text_field = document.createElement('input');
			text_field.addEventListener(
  			   'change',
  			   	(function(a,b) { return function() {
  			    	item_to_test[item_names[a]].values[b] = Number(this.value);
  			    	plotter.setTickData(item_to_test);
  			    }})(j,i),
  			   false
  			);
			text_field.setAttribute( 'type', "number");
			text_field.setAttribute( 'value', item_to_test[item_names[j]].values[i]);
			li = document.createElement('li');
			text = document.createTextNode(
				item_names[j] + " " + (i + 1)
			);
			li.appendChild(text);
			li.appendChild(text_field);
			ul.appendChild(li);
		}
	}

	text_field = document.createElement('input');
	text_field.addEventListener(
  	   'change',
  	   	(function() { return function() {
  	    	item_to_test = JSON.parse(this.value);
  	    	plotter.setTickData(item_to_test);
  	    }})(),
  	   false
  	);
	text_field.setAttribute( 'value', "");
	li = document.createElement('li');
	text = document.createTextNode(
		"json item here"
	);
	li.appendChild(text);
	li.appendChild(text_field);
	ul.appendChild(li);



	main_div.appendChild(ul);
	/*
	var btn = document.createElement("BUTTON");
	var t = document.createTextNode("set");
	btn.appendChild(t);
	main_div.appendChild(btn);
	*/
	document.body.appendChild(main_div);
};


