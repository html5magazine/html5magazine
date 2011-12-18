var ep = epaper = {};

(function() {
	ep.app = {};
	ep.animate = {};
	ep.flip = {};
	ep.options = {
		'directory'                 : 'epaper',
		'numberOfPagesToLoadOnInit' : 4,
		'numberOfPagesLoaded'       : 0,
		'currentSlide'              : 0,
		'sliderMove'                : 800,
		'maxSlide'                  : 5,
		'animate'                   : ''
	};
	ep.start = function(options){
		for(i in options)
		{
			ep.options[i] = options[i];
		}
		var json = options.json || 'epaper/epaper.json';
		ep.loadJson(json);
	};
	
	ep.init = function(options){
	    ep.app.viewport = $('#slider');
	    ep.app.slides = [
	    	{
	    		'page' : 'page-0',
	    		'left' : -80,
	    		'slide': -1
	    	},
	    	{
	    		'page' : 'page-1',
	    		'left' : 5,
	    		'slide': 0
	    	},
	    	{
	    		'page' : 'page-2',
	    		'left' : 90,
	    		'slide': 1
	    	},
	    	{
	    		'page' : 'page-3',
	    		'left' : 175,
	    		'slide': 2
	    	},
	    	{
	    		'page' : 'page-4',
	    		'left' : 260,
	    		'slide': 3
	    	}
	    ];
	    ep.flip.queue = [];
	    console.log(ep.app.slides);
	    ep.app.ocTimer = null;
	    ep.registerEvents();
	    
		if(window["WebKitCSSMatrix"])
		{
			ep.options.animate = '3d';
		}
		
		for(i in options)
		{
			ep.options[i] = options[i];
		}
		ep.options.maxSlide = (ep.options.contents.length - 1);
		ep.initLoad();
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
			$('#slider').swipeRight(function(){
				ep.animate.left();
			});
			$('#slider').swipeLeft(function(){
				//ep.loadNextPage();
				ep.animate.right();
				
			});

			window.addEventListener('orientationchange', ep.orientation, false);

		}else{
		    //apply mouse events
			/** /
			document.addEventListener('mousemove', function(){
				ep.animate.right();
			});
			/**/
			window.addEventListener('resize', function(){
				ep.animate.center();
			});
		}
	};
	
	ep.initLoadSuccess = function(){
		ep.options.numberOfPagesLoaded++;
		if(ep.options.numberOfPagesToLoadOnInit === ep.options.numberOfPagesLoaded)
		{
			for(var i = 1; i <= ep.options.numberOfPagesToLoadOnInit; i++)
			{
				$('#page-' + i).show();
			}
			ep.removeLoading();
		}
	};
	ep.initLoad = function(){
		for(var i = 1; i <= ep.options.numberOfPagesToLoadOnInit; i++)
		{
			var content = ep.options.contents[i - 1];
			if($.isArray(content))
			{
				// todo multiple articles one one page
			}
			else
			{
				$('#page-' + i).load(ep.options.directory + '/' + content, ep.initLoadSuccess);
			}
		}
	};
	
	ep.loadSuccess = function(){
		ep.options.numberOfPagesLoaded++;
		var slide = ep.flip.queue.shift();
		$('#' + slide.page).show();
	};
	
	ep.load = function(slide){
		if(slide.slide >= 0 && slide.slide <= ep.options.maxSlide)
		{
			// load slide
			console.log(ep.app.slides);
			console.log(slide);
			var content = ep.options.contents[slide.slide];
			ep.flip.queue.push(slide);
			var page = $('#' + slide.page);
			page.css('left', slide.left + '%');
			page.load(ep.options.directory + '/' + content, ep.loadSuccess);
		}
	};
	
	
	ep.removeLoading = function(){
		$('#loader').remove();
	};
	
	ep.flip.left = function(){
		var previousContent = ep.app.slides[0].slide - 1;
		if(ep.options.currentSlide < (ep.options.maxSlide - 1) && previousContent in ep.options.contents)
		{
			var slide = ep.app.slides.pop();
			var previousSlide = {
				'page' : slide.page,
				'left' : (ep.app.slides[0].left - 85),
				'slide': (ep.app.slides[0].slide - 1)
			};
			ep.app.slides.unshift(previousSlide);
			ep.load(previousSlide);
		}
	};
	
	ep.flip.right = function(){
		var nextContent = ep.app.slides[ep.app.slides.length - 1].slide + 1;
		if(ep.options.currentSlide > 1 && nextContent in ep.options.contents)
		{
			var slide = ep.app.slides.shift();
			var nextSlide = {
				'page' : slide.page,
				'left' : (ep.app.slides[ep.app.slides.length - 1].left + 85),
				'slide': (ep.app.slides[ep.app.slides.length - 1].slide + 1)
				
			};
			ep.app.slides.push(nextSlide);
			ep.load(nextSlide);
		}
	};
	
	ep.calculate = function(){
		var section = $('#page-1'), width, marginLeft;
		width = section.css('width');
		marginLeft = section.css('margin-left');
		width = parseInt(width.replace(/px/, ''));
		marginLeft = parseInt(marginLeft.replace(/px/, ''));
		
		ep.options.sliderMove = width + marginLeft;
	};
	
	ep.animate.left = function(){
		ep.options.currentSlide--;
		if(ep.options.currentSlide < 0)
		{
			ep.options.currentSlide = 0;
		}
		else
		{
			ep.animate.core();
			ep.flip.left();
		}
		
	};
	
	ep.animate.right = function(){
		ep.options.currentSlide++;
		if(ep.options.currentSlide > ep.options.maxSlide)
		{
			ep.options.currentSlide = ep.options.maxSlide;
		}
		else
		{
			ep.animate.core();
			ep.flip.right();
		}
	};
	
	ep.animate.center = function(){
		ep.animate.core();
	};
	
	ep.animate.core = function(){
		console.log(ep.options.currentSlide);
		ep.calculate();
		if(ep.options.animate === '3d')
		{
			ep.app.viewport.animate({translate3d: ((ep.options.currentSlide * ep.options.sliderMove) * -1) + 'px,0,0'}, 300, 'linear');
		}
		else
		{
			ep.app.viewport.animate({translate: ((ep.options.currentSlide * ep.options.sliderMove) * -1) + 'px'}, 300, 'linear');
		}
	};
	
	ep.orientation = function(){
	    if($.os.ios)
	    {
	        ep.animate.center();
	    }
	    else
	    {
	        clearTimeout(ep.app.ocTimer);
	        ep.app.ocTimer = setTimeout(function () {
                ep.animate.center();
            }, 500);
	    }
	};
	
	ep.loadJson = function(json){
		$.getJSON(
			json,
			epaper.init,
			function(error){
				console.log(error);
			}
		);
	};
}());
(function() {
ep.start({});
}());