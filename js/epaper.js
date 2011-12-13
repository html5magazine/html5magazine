var ep = epaper = {};

(function() {
	ep.app = {};
	ep.animate = {};
	ep.options = {
		'directory'                 : 'epaper',
		'numberOfPagesToLoadOnInit' : 3,
		'numberOfPagesLoaded'       : 0,
		'sliderPosition'            : 0,
		'currentSlide'              : 0,
		'sliderMove'                : 800,
		'maxSlide'                  : 5,
		'animate'                   : ''
	};
	
	ep.init = function(options){
		ep.registerEvents();
		if(window["WebKitCSSMatrix"])
		{
			ep.options.animate = '3d';
		}
		ep.app.slider = $('.slide-list');
		ep.options = ep.combine(ep.options, options);
		ep.prepareOptions();
		for(var i = 0; i < ep.options.numberOfPagesToLoadOnInit; i++)
		{
			ep.load(i);
		}
	};
	ep.loadSuccess = function(data){
		ep.options.numberOfPagesLoaded++;
		$('#page' + (ep.options.numberOfPagesLoaded - 1)).parent('li').show();
		if(ep.options.numberOfPagesToLoadOnInit === ep.options.numberOfPagesLoaded)
		{
			ep.calculate();
			ep.removeLoading();
		}
		if(ep.options.numberOfPagesLoaded > ep.options.numberOfPagesToLoadOnInit)
		{
			ep.calculate();
		}
	};
	ep.load = function(page){
		if(ep.options.contents[page].isLoaded === false)
		{
			var content = ep.options.contents[page].page;
			
			if($.isArray(content))
			{
				// todo multiple articles one one page
			}
			else
			{
				$('ul.slide-list').append(ep.ui.createPage({'page': page}));
				$('#page' + page).load(ep.options.directory + '/' + content, ep.loadSuccess);
			}
			
			ep.options.contents[page].isLoaded = true;
			
			return true;
		}
		
		return false;
	};
	ep.loadNextPage = function(){
		for(var i = 0, l = ep.options.contents.length; i < l; i++)
		{
			if(ep.options.contents[i].isLoaded === false)
			{
				ep.load(i);
				
				return true;
			}
		}
		
		return false;
	};
	
	ep.removeLoading = function(){
		$('#loader').remove();
	};
	
	ep.registerEvents = function(){
		if(typeof document.ontouchmove !== 'undefined'){
			$('body').bind('touchmove', function(event){
				if(!event.elementIsEnabled)
				{
					event.preventDefault();
				}
			});
			//apply touch events
			$('.slider').swipeRight(function(){
				ep.animate.left();
			});
			$('.slider').swipeLeft(function(){
				ep.loadNextPage();
				ep.animate.right();
				
			});
			window.onorientationchange = ep.orientation;

		}else{
		    //apply mouse click events
			$('#nav-left').css('display', 'block');
			$('#nav-right').css('display', 'block');
			$('#nav-left').bind('click', function(){
				ep.animate.left();
				
			});
			$('#nav-right').bind('click', function(){
				ep.loadNextPage();
				ep.animate.right();
			});
			
			W(function(){
			    // Refresh stylesheets to force contents adaptation (especially for zooming and text size changing)
			    var links = document.getElementsByTagName('link'),
			        i = -1,
			        element;
			    while(element = links[++i]){
			        if(element.rel == 'stylesheet'){
			            element.disabled=true;
			            element.disabled=false;
			        }
			    }
			    ep.calculate();
			    ep.animate.center();
			});
		}
		
		
	};
	
	ep.calculate = function(){
		console.log('calculate');
		var width, 
			height,
			section,
			marginLeft,
			viewport = $('.slider');
		width = viewport.css('width');
		width = parseInt(width.replace(/px/, ''));
		
		section = width * 0.8;
		marginLeft = width * 0.05;
		console.log('section: ' + section);
		console.log('marginLeft: ' + marginLeft);
		height = viewport.css('height');
		height = parseInt(height.replace(/px/, ''));
		ep.options.sliderMove = section + marginLeft;
		$('section').css({
			'width': section + 'px',
			'margin-left': marginLeft + 'px'
		});
		$('#page0').css({
			'margin-left': (marginLeft * 2) + 'px'
		});
		ep.options.sliderPosition = (ep.options.currentSlide * ep.options.sliderMove) * -1;
	};
	
	ep.orientation = function(){
		console.log('orientation');
		ep.calculate();
		ep.animate.center();
	};
	ep.animate.left = function(){
		ep.options.currentSlide--;
		
		if(ep.options.currentSlide < 0)
		{
			ep.options.currentSlide = 0;
		}
		else
		{
			ep.animate.core('left');
		}
	};
	ep.animate.right = function(){
		ep.loadNextPage();
		ep.options.currentSlide++;
		if(ep.options.currentSlide > ep.options.maxSlide)
		{
			ep.options.currentSlide = ep.options.maxSlide;
		}
		else
		{
			ep.animate.core('right');
		}
	};
	ep.animate.center = function(){
		ep.animate.core('center');
	};
	ep.animate.core = function(direction){

		//var translate = 'translate';
		//var suffix = 'px';
		if(ep.options.animate === '3d')
		{
			//translate = 'translate3d';
			//suffix = 'px,0,0';
			ep.app.slider.animate({translate3d: ((ep.options.currentSlide * ep.options.sliderMove) * -1) + 'px,0,0'}, 300, 'linear');
		}
		else
		{
			ep.app.slider.animate({translate: ((ep.options.currentSlide * ep.options.sliderMove) * -1) + 'px'}, 300, 'linear');
		}
	};
	
	// ultilities
	ep.mixin = function (target, source) {
		var name, s, i;
		for (name in source) {
			s = source[name];
			if (!(name in target) || (target[name] !== s)) {
				target[name] = s;
			}
		}
		return target;
	};


	// create a new object, combining the properties of the passed objects with
	// the last arguments having
	// priority over the first ones
	ep.combine = function (obj, props) {
		var newObj = {};
		for ( var i = 0, l = arguments.length; i < l; i++) {
			ep.mixin(newObj, arguments[i]);
		}
		return newObj;
	};
	
	ep.prepareOptions = function(){
		var optionList = [];
		for(var i = 0, l = ep.options.contents.length; i < l; i++)
		{
			optionList[i] = {
				'page'      : ep.options.contents[i],
				'isLoaded'  : false,
				'calculated' : false
			};
		}
		ep.options.maxSlide = optionList.length - 1;
		ep.options.contents = optionList;
	};
}());