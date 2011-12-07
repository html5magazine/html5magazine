var epaper = {};

(function() {
	epaper.app = {};
	epaper.options = {
		'directory' : 'epaper',
		'numberOfPagesToLoadOnInit' : 3,
		'numberOfPagesLoaded' : 0,
		'sliderPosition' : 0,
		'currentSlide' : 0,
		'sliderMove' : 800,
		'maxSlide' : 5
	};
	
	epaper.init = function(options){
		epaper.registerEvents();
		
		epaper.options = epaper.combine(epaper.options, options);
		epaper.prepareOptions();
		for(var i = 0; i < epaper.options.numberOfPagesToLoadOnInit; i++)
		{
			epaper.load(i);
		}
	};
	
	var empty = {};
	function mixin(/* Object */target, /* Object */source) {
		var name, s, i;
		for (name in source) {
			s = source[name];
			if (!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))) {
				target[name] = s;
			}
		}
		return target; // Object
	};
	epaper.mixin = function(/* Object */obj, /* Object... */props) {
		if (!obj) {
			obj = {};
		}
		for ( var i = 1, l = arguments.length; i < l; i++) {
			mixin(obj, arguments[i]);
		}
		return obj; // Object
	};

	// create a new object, combining the properties of the passed objects with
	// the last arguments having
	// priority over the first ones
	epaper.combine = function(/* Object */obj, /* Object... */props) {
		var newObj = {};
		for ( var i = 0, l = arguments.length; i < l; i++) {
			mixin(newObj, arguments[i]);
		}
		return newObj;
	};
	
	epaper.prepareOptions = function(){
		var optionList = [];
		for(var i = 0, l = epaper.options.contents.length; i < l; i++)
		{
			optionList[i] = {
				'page' : epaper.options.contents[i],
				'isLoaded' : false
			};
		}
		epaper.options.maxSlide = optionList.length - 1;
		epaper.options.contents = optionList;
	};
	epaper.loadSuccess = function(data){
		$('#page' + epaper.options.numberOfPagesLoaded).parent('li').show();
		if((epaper.options.numberOfPagesToLoadOnInit - 1) === epaper.options.numberOfPagesLoaded)
		{
			epaper.removeLoading();
			epaper.calculate();
		}
		epaper.options.numberOfPagesLoaded++;
	};
	epaper.loadNextPageSuccess = function(data){
		$('#page' + epaper.options.numberOfPagesLoaded).parent('li').show();
		epaper.calculatePage(epaper.options.numberOfPagesLoaded);
		epaper.options.numberOfPagesLoaded++;
	};
	epaper.load = function(page){
		if(epaper.options.contents[page].isLoaded === false)
		{
			var content = epaper.options.contents[page].page;
			
			if($.isArray(content))
			{
				// todo multiple articles one one page
			}
			else
			{
				$('ul.slide-list').append('<li><section id="page' + page + '"></section></li>');
				$('#page' + page).load(epaper.options.directory + '/' + content, epaper.loadSuccess);
			}
			
			epaper.options.contents[page].isLoaded = true;
		}
		else
		{
			console.log('page ' + page + ' already loaded!');
		}
	};
	epaper.loadNextPage = function(){
		var success = false;
		for(var i = 0, l = epaper.options.contents.length; i < l; i++)
		{
			if(success === false)
			{
				if(epaper.options.contents[i].isLoaded === false)
				{
					var content = epaper.options.contents[i].page;
					$('ul.slide-list').append('<li><section id="page' + i + '"></section></li>');
					$('#page' + i).load(epaper.options.directory + '/' + content, epaper.loadNextPageSuccess);
					epaper.options.contents[i].isLoaded = true;
					success = true;
				}
				else
				{
					console.log('page ' + i + ' already loaded!');
				}
			}
		}
	};
	epaper.removeLoading = function(){
		$('#loader').remove();
	};
	
	epaper.registerEvents = function(){
		
		if(typeof document.ontouchmove !== 'undefined'){
			$('body').bind('touchmove', function(event){
				if(!event.elementIsEnabled)
				{
					event.preventDefault();
				}
			});
			$('#nav-left').css('display', 'none');
			$('#nav-right').css('display', 'none');
			//apply touch events
			$('.slider').swipeRight(function(){
				epaper.options.currentSlide--;
				
				if(epaper.options.currentSlide <= 0)
				{
					epaper.options.currentSlide = 0;
				}
				epaper.options.sliderPosition = (epaper.options.currentSlide * epaper.options.sliderMove) * -1;
				$('.slide-list').animate({translate3d: epaper.options.sliderPosition + 'px,0,0'}, 300, 'linear');
			});
			$('.slider').swipeLeft(function(){
				epaper.loadNextPage();
				epaper.options.currentSlide++;
				if(epaper.options.currentSlide >= epaper.options.maxSlide)
				{
					epaper.options.currentSlide = epaper.options.maxSlide;
				}
				epaper.options.sliderPosition = (epaper.options.currentSlide * epaper.options.sliderMove) * -1;
				$('.slide-list').animate({translate3d: epaper.options.sliderPosition + 'px,0,0'}, 300, 'linear');
			});
			window.onorientationchange = epaper.orientation;

		}else{
		    //apply mouse click events
			//alert('mouse');
			$('#nav-left').bind('click', function(){
				epaper.options.currentSlide--;
				
				if(epaper.options.currentSlide <= 0)
				{
					epaper.options.currentSlide = 0;
				}
				epaper.options.sliderPosition = (epaper.options.currentSlide * epaper.options.sliderMove) * -1;
				$('.slide-list').animate({translate: epaper.options.sliderPosition + 'px'}, 300, 'linear');
				
			});
			$('#nav-right').bind('click', function(){
				epaper.loadNextPage();
				epaper.options.currentSlide++;
				if(epaper.options.currentSlide >= epaper.options.maxSlide)
				{
					epaper.options.currentSlide = epaper.options.maxSlide;
				}
				epaper.options.sliderPosition = (epaper.options.currentSlide * epaper.options.sliderMove) * -1;
				
				$('.slide-list').animate({translate: epaper.options.sliderPosition + 'px'}, 300, 'linear');
			});
		}
		
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
		    epaper.calculate();
		});
	};
	
	epaper.calculate = function(){
		var viewport = $('.slider').css('width');
		viewport = parseInt(viewport.replace(/px/, ''));
		var section = viewport * 0.75;
		var marginLeft = viewport * 0.05;
		var leftSpace = viewport * 0.1;
		epaper.options.sliderMove = section + marginLeft;
		console.log(section + marginLeft);
		$('section').css({'width': section + 'px', 'max-width': section + 'px', 'margin-left': marginLeft + 'px'});
		$('#page0').css({'margin-left': (marginLeft + leftSpace) + 'px'});
		epaper.options.sliderPosition = (epaper.options.currentSlide * epaper.options.sliderMove) * -1;
		$('.slide-list').animate({translate: epaper.options.sliderPosition + 'px'}, 300, 'linear');
	};
	
	epaper.calculatePage = function(pageId){
		var viewport = $('.slider').css('width');
		viewport = parseInt(viewport.replace(/px/, ''));
		var section = viewport * 0.75;
		var marginLeft = viewport * 0.05;
		var leftSpace = viewport * 0.1;
		$('#page' + pageId).css({'width': section + 'px', 'max-width': section + 'px', 'margin-left': marginLeft + 'px'});
	};
	
	epaper.orientation = function(){
		epaper.calculate();
	};
}());