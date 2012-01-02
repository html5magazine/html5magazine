var mg = magazine = {};

(function() {
	mg.app = {};
	mg.animate = {};
	mg.flip = {};
	mg.scroll = {};
	mg.touch = {};
	mg.touch.enabled = (typeof document.ontouchmove !== 'undefined' ? true : false);
	mg.options = {
		'directory'                 : 'magazine',
		'numberOfPagesToLoadOnInit' : 4,
		'numberOfPagesLoaded'       : 0,
		'currentSlide'              : 0,
		'currentPageId'             : 'page-1',
		'sliderMove'                : 800,
		'maxSlide'                  : 1,
		'animate'                   : '',
		'fullpage'                  : false,
		'start'                     : -80,
		'step'                      : 85,
		'animationTime'             : 300,
		'sidebar'                   : true,
		'sidebarFixed'              : false
	};
	mg.start = function(options){
		var json = options.json || 'magazine/magazine.json';
		mg.loadJson(json);
	};
	
	mg.init = function(options){
		for(i in options)
		{
			mg.options[i] = options[i];
		}
		
		if(mg.options.fullpage === true)
		{
			$('body').attr('id', 'fullpage');
			mg.options.start = -100;
			mg.options.step  = 100;
		}
		
		if(mg.options.sidebar === true)
		{
			if(mg.options.sidebarFixed === true)
			{
				$('body').addClass('fixed');
			}
			else
			{
				$('#mg-sidebar-button-open').show();
				$('#mg-sidebar-button-close').show();
			}
			mg.loadSidebar();
		}
		mg.options.maxSlide = (mg.options.contents.length - 1);
		mg.app.viewport = $('#mg-slider');
		mg.app.slides = [];
		for(var i = 0; i <= 4; i++)
		{
			mg.app.slides.push({
				'page' : 'page-' + i,
	    		'left' : mg.options.start,
	    		'slide': (i - 1)
			});
			mg.options.start += mg.options.step; 
		}
		
	    mg.flip.queue = [];
	    mg.app.ocTimer = null;
	    mg.registerEvents();
	    
		if(window["WebKitCSSMatrix"])
		{
			mg.options.animate = '3d';
		}
		
		mg.initLoad();
	};
	
	mg.registerEvents = function(){
		
		var touchEnabled = mg.touch.enabled,
		startEvent       = touchEnabled ? 'touchstart'  : 'mousedown',
		moveEvent        = touchEnabled ? 'touchmove'   : 'mousemove',
		endEvent         = touchEnabled ? 'touchend'    : 'mouseup',
		cancelEvent      = touchEnabled ? 'touchcancel' : 'mouseup'
		if(touchEnabled){
			$('body').bind('touchmove', function(event){
				if(!event.elementIsEnabled)
				{
					event.preventDefault();
				}
			});
			//apply touch events
			$('#mg-slider').swipeRight(function(){
				mg.animate.left();
			});
			$('#mg-slider').swipeLeft(function(){
				//mg.loadNextPage();
				mg.animate.right();
				
			});
			window.addEventListener('orientationchange', mg.orientation, false);
		}else{
		    //apply mouse events
			/** /
			document.addEventListener('mousemove', function(){
				mg.animate.right();
			});
			/**/
			$('#mg-slider').swipeRight(function(){
				mg.animate.left();
			});
			$('#mg-slider').swipeLeft(function(){
				//mg.loadNextPage();
				mg.animate.right();
				
			});
			window.addEventListener('resize', mg.animate.center, false);
		}
		/** /
		$('.mg-slider-page').bind(startEvent, mg.touch.start);
		$('.mg-slider-page').bind(moveEvent, mg.touch.move);
		$('.mg-slider-page').bind(endEvent, mg.touch.end);
		$('.mg-slider-page').bind(cancelEvent, mg.touch.cancel);
		/**/
	};
	
	mg.initLoadSuccess = function(){
		mg.options.numberOfPagesLoaded++;
		if(mg.options.numberOfPagesToLoadOnInit === mg.options.numberOfPagesLoaded)
		{
			mg.orientation(false);
		    for(var i = 1; i <= mg.options.numberOfPagesToLoadOnInit; i++)
			{
				$('#mg-page-' + i).show();
				//mg.scroll.kinetic($('#mg-page-1 article div')[0]);
				if($.os.ios === true)
				{
					if(parseInt($.os.version) < 5)
					{
						//mg.scroll.kinetic($('#mg-page-1 article div')[0]);
					}
				}
			}
			mg.removeLoading();
			mg.options.currentPageId = mg.app.slides[1].page;
		}
	};
	mg.initLoad = function(){
		for(var i = 1; i <= mg.options.numberOfPagesToLoadOnInit; i++)
		{
			var content = mg.options.contents[i - 1];
			if($.isArray(content))
			{
				// todo multiple articles one one page
			}
			else
			{
				$('#mg-page-' + i).load(mg.options.directory + '/' + content, mg.initLoadSuccess);
			}
		}
	};
	
	mg.loadSuccess = function(){
		mg.options.numberOfPagesLoaded++;
		var slide = mg.flip.queue.shift();
		$('#mg-' + slide.page).show();
	};
	
	mg.load = function(slide){
		if(slide.slide >= 0 && slide.slide <= mg.options.maxSlide)
		{
			// load slide
			var content = mg.options.contents[slide.slide];
			mg.flip.queue.push(slide);
			var page = $('#mg-' + slide.page);
			page.css('left', slide.left + '%');
			page.load(mg.options.directory + '/' + content, mg.loadSuccess);
		}
	};
	mg.loadSidebarSuccess = function(){
		var buttonOpen = $('#mg-sidebar-button-open');
		var buttonClose = $('#mg-sidebar-button-close');
		if(mg.touch.enabled === true)
		{
			buttonOpen.tap(mg.sidebarShow);
			buttonClose.tap(mg.sidebarHide);
		}
		else
		{
			buttonOpen.bind('click', mg.sidebarShow);
			buttonClose.bind('click', mg.sidebarHide);
		}
		if($.os.ios === true)
		{
			if(parseInt($.os.version) < 5)
			{
				mg.scroll.kinetic($('#mg-sidebar ul')[0]);
			}
		}
	};
	mg.loadSidebar = function(){
		var sidebar = $('#mg-sidebar');
		sidebar.load(mg.options.directory + '/sidebar.html', mg.loadSidebarSuccess);
	};
	mg.sidebarHide = function()
	{
		mg.animate.sidebar('close');

	};
	mg.sidebarShow = function()
	{
		mg.animate.sidebar('open');
	};
	mg.removeLoading = function(){
		$('#mg-loader').remove();
	};
	
	mg.flip.left = function(){
		var previousContent = mg.app.slides[0].slide - 1;
		if(mg.options.currentSlide < (mg.options.maxSlide - 1) && previousContent in mg.options.contents)
		{
			var slide = mg.app.slides.pop();
			var previousSlide = {
				'page' : slide.page,
				'left' : (mg.app.slides[0].left - mg.options.step),
				'slide': (mg.app.slides[0].slide - 1)
			};
			mg.app.slides.unshift(previousSlide);
			mg.load(previousSlide);
			mg.options.currentPageId = mg.app.slides[1].page;
		}
	};
	
	mg.flip.right = function(){
		var nextContent = mg.app.slides[mg.app.slides.length - 1].slide + 1;
		if(mg.options.currentSlide > 1 && nextContent in mg.options.contents)
		{
			var slide = mg.app.slides.shift();
			var nextSlide = {
				'page' : slide.page,
				'left' : (mg.app.slides[mg.app.slides.length - 1].left + mg.options.step),
				'slide': (mg.app.slides[mg.app.slides.length - 1].slide + 1)
				
			};
			mg.app.slides.push(nextSlide);
			mg.load(nextSlide);
			mg.options.currentPageId = mg.app.slides[1].page;
		}
	};
	
	mg.calculate = function(){
		var section = $('#mg-page-1'), width, marginLeft;
		width = section.css('width');
		marginLeft = section.css('margin-left');
		width = parseInt(width.replace(/px/, ''));
		marginLeft = parseInt(marginLeft.replace(/px/, ''));
		mg.options.sliderMove = width + marginLeft;
	};
	
	mg.animate.left = function(){
		mg.options.currentSlide--;
		if(mg.options.currentSlide < 0)
		{
			mg.options.currentSlide = 0;
		}
		else
		{
			mg.animate.core();
			mg.flip.left();
		}
		
	};
	
	mg.animate.right = function(){
		mg.options.currentSlide++;
		if(mg.options.currentSlide > mg.options.maxSlide)
		{
			mg.options.currentSlide = mg.options.maxSlide;
		}
		else
		{
			mg.animate.core();
			mg.flip.right();
		}
	};
	
	mg.animate.center = function(){
		if(mg.options.sidebar === true && mg.options.sidebarFixed !== true)
	    {
			mg.animate.sidebar('close', 'fast');
	    }
		mg.animate.core();
	};
	mg.animate.core = function(direction, move){
		mg.calculate();
		if(mg.options.animate === '3d')
		{
		    if($.os.ios)
	        {
		        mg.app.viewport.animate({translate3d: (mg.options.currentSlide * - mg.options.step) + '%,0,0'}, mg.options.animationTime, 'linear');
	        }
		    else
		    {
		        // @TODO: check if translate is faster than translate3d see last comment on: http://stackoverflow.com/questions/3182157/how-to-achieve-smooth-hw-accelerated-transitions-in-the-android-browser 
		    	mg.app.viewport.animate({translate3d: ((mg.options.currentSlide * mg.options.sliderMove) * -1) + 'px,0,0'}, mg.options.animationTime, 'linear');
		    }
		}
		else
		{
			mg.app.viewport.animate({translate: ((mg.options.currentSlide * mg.options.sliderMove) * -1) + 'px'}, mg.options.animationTime, 'linear');
		}
	};
	mg.animate.sidebar = function(action, speed){
		var sidebar = $('#mg-sidebar');
		var buttonOpen = $('#mg-sidebar-button-open');
		var buttonClose = $('#mg-sidebar-button-close');
		var button;
		var width = 0;
		var duration = mg.options.animationTime;
		if(speed === 'fast')
		{
			duration = 0;
		}
		if(action === 'open')
		{
			width = sidebar.css('width');
			width = parseInt(width.replace(/px/, ''));
			buttonOpen.hide();
			buttonClose.show();
			button = buttonClose;
		}
		else
		{
			button = buttonClose;
			buttonOpen.show();
			buttonClose.hide();
		}
		
		if(mg.options.animate === '3d')
		{
		    if($.os.ios)
	        {
		    	sidebar.animate({translate3d: width + 'px,0,0'}, duration, 'linear');
	    		buttonClose.animate({translate3d: width + 'px,0,0'}, duration, 'linear');
	    		buttonOpen.animate({translate3d: width + 'px,0,0'}, duration, 'linear');
	        }
		    else
		    {
		        // @TODO: check if translate is faster than translate3d see last comment on: http://stackoverflow.com/questions/3182157/how-to-achieve-smooth-hw-accelerated-transitions-in-the-android-browser 
		    	sidebar.animate({translate3d: width + 'px,0,0'}, duration, 'linear');
		    	buttonClose.animate({translate3d: width + 'px,0,0'}, duration, 'linear');
		    	buttonOpen.animate({translate3d: width + 'px,0,0'}, duration, 'linear');
		    }
		}
		else
		{
			sidebar.animate({translate: width + 'px'}, duration, 'linear');
			buttonClose.animate({translate: width + 'px'}, duration, 'linear');
			buttonOpen.animate({translate: width + 'px'}, duration, 'linear');
		}
	};
	
	mg.orientation = function(timeout){
	    if(mg.options.sidebar === true && mg.options.sidebarFixed !== true)
	    {
	    	mg.animate.sidebar('close', 'fast');
	    }
	    if(mg.options.sidebar === true)
	    {
	    	if($.os.ios === true)
			{
				if(parseInt($.os.version) < 5)
				{
					mg.scroll.kinetic($('#mg-sidebar ul')[0]);
				}
			}
	    }
		(timeout === false ? timeout = false : timeout = true);
	    var orientation = window.orientation;
	    switch(orientation){  
            case 0: case 180: 
            	orientation = 'portrait';
                $('article.landscape').hide();
            break; 
            default: 
                
                orientation = 'landscape';
                $('article.portrait').hide();
        }
	    if($.os.ios)
	    {
	        mg.animate.center();
	        if(orientation === 'landscape')
	        {
	            $('article.landscape').show();
	        }
	        else
	        {
	            $('article.portrait').show();
	        }
	    }
	    else
	    {
	        if(timeout === true)
	        {
	            clearTimeout(mg.app.ocTimer);
	            mg.app.ocTimer = setTimeout(function () {
	                mg.animate.center();
	                if(orientation === 'landscape')
	                {
	                    $('article.landscape').show();
	                }
	                else
	                {
	                    $('article.portrait').show();
	                }
	            }, 500);
	        }
	        else
	        {
	            mg.animate.center();
                if(orientation === 'landscape')
                {
                    $('article.landscape').show();
                }
                else
                {
                    $('article.portrait').show();
                }
	        }
	    }
	    
	};
	
	mg.loadJson = function(json){
		$.getJSON(
			json,
			mg.init,
			function(error){
				console.log(error);
			}
		);
	};
	
	mg.scroll.kinetic = function(id){
		var list = new FlickList(id),
		positionUpdater;
		
		list.adjustRange();
		
		positionUpdater = list.scroller.onPositionChanged;
        list.scroller.onPositionChanged = function (pos) {
            positionUpdater(pos);
        };
	};
}());
(function() {
    mg.start({});
}());

