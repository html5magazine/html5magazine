//***************************************************************************** 
//main
var mg = (function(undefined){
	"use strict";
	var mg = {
		options : {
			'directory'                 : 'magazine',
			'json'                      : 'magazine/magazine.json',
			'numberOfPagesToLoad' : 3,
			'sliderMove'                : 800,
			'fullpage'                  : false,
			'animationTime'             : 300,
			'animationType'             : 'linear',
			'sidebar'                   : true,
			'sidebarFixed'              : true,
			'scrolling'                 : {hScrollbar: false, vScrollbar: false, hScroll: false, bounce: false}
		},
		// settings : {
		maxPage                   : 1,
		startLeft                 : -80,
		step                      : 85,
		numberOfPagesLoaded       : 0,
		currentPage               : 0,
		currentPosition           : 0,
		animation                 : (window["WebKitCSSMatrix"] ? '3d' : ''),
		touchEnabled              : (typeof document.ontouchmove !== 'undefined' ? true : false),
		mouse                     : {initiated : false},
		sidebarCategoryActive     : '0',
		sidebarHightList          : [],
		sidebarScroller           : {},
		slideScroller             : {},
		loadingSequence           : { // in reverse order
			'first':        [{slide: 4, page: 2}, {slide: 3, page: 1}, {slide: 2, page: 0}],
			'second':       [{slide: 1, page: -1},{slide: 4, page: 2}, {slide: 3, page: 1}, {slide: 2, page: 0}],
			'third':        [{slide: 0, page: -2},{slide: 1, page: -1},{slide: 4, page: 2}, {slide: 3, page: 1}, {slide: 2, page: 0}],
			'middle':       [{slide: 0, page: -2},{slide: 1, page: -1},{slide: 4, page: 2}, {slide: 3, page: 1}, {slide: 2, page: 0}],
			'last':         [{slide: 0, page: -2},{slide: 1, page: -1},{slide: 2, page: 0}],
			'last-but-one': [{slide: 0, page: -2},{slide: 1, page: -1},{slide: 3, page: 1}, {slide: 2, page: 0}],
			'last-but-two': [{slide: 0, page: -2},{slide: 1, page: -1},{slide: 4, page: 2}, {slide: 3, page: 1}, {slide: 2, page: 0}]
		},
		
		init : function(){
			mg.loadOptions(mg.start);
			mg.sidebar      = $('#mg-sidebar');
			mg.slider       = $('#mg-slider');
			mg.firstSlide   = $('#mg-slide-2');
			mg.buttonOpen   = $('#mg-sidebar-button-open');
			mg.buttonClose  = $('#mg-sidebar-button-close');
			mg.bindEvents();
		},
		start : function(){
			var i;
			mg.maxPage = (mg.get('contents').length - 1);
			if(mg.get('fullpage') === true){
				$('body').attr('id', 'fullpage');
				mg.startLeft = -100;
				mg.step  = 100;
			}
			if(mg.options.sidebar === true){
				if(mg.options.sidebarFixed === true){
					$('body').addClass('fixed');
				}
				else{
					mg.buttonOpen.show();
					mg.buttonClose.show();
				}
				mg.loadSidebar();
			}
			
			mg.slides = [];
			for(i = 0; i <= 4; i++)
			{
				mg.slides.push({
					'slideId':  i,
		    		'left':     mg.step * (i - 2),
		    		'page':     i - 2,
				});
			}
			mg.loadPage($('#mg-slide-2'), 0);
			mg.loadPage($('#mg-slide-3'), 1);
			mg.loadPage($('#mg-slide-4'), 2);
			//mg.loadPage($('#mg-slide-4'), 3);
		},
		get : function(key){
			if(typeof mg.options[key] !== 'undefined'){
				return mg.options[key];
			}
			else{
				return undefined;
			}
		},
		set : function(key, value){
			mg.options[key] = value;
		}
		
	};
	
	return mg;
}());

//*****************************************************************************
// modules can be used stand alone
window.mg = mg || {};

//*****************************************************************************
//loader module
(function(mg, undefined){
	mg.loadSidebar = function(){
		mg.sidebar.load(mg.get('directory') + '/sidebar.html', mg.loadSidebarSuccess);
	};
	mg.loadSidebarSuccess = function(){
		if(mg.touchEnabled === true){
			mg.buttonOpen.tap(mg.sidebarShow);
			mg.buttonClose.tap(mg.sidebarHide);
		}
		else{
			mg.buttonOpen.bind('click', mg.sidebarShow);
			mg.buttonClose.bind('click', mg.sidebarHide);
		}
		mg.sidebarEvents();
		mg.sidebarCalculate();
		if(mg.touchEnabled === true){
			mg.addEvent('sidebar-category-content-0', 'webkitTransitionEnd', mg.sidebarListener);
		}
		else{
			mg.addEvent('sidebar-category-content-0', 'transitionend', mg.sidebarListener);
		}
		$('.sidebar-category-content').css('height', 0);
		$('#sidebar-category-content-0').css('height', mg.sidebarHightList[0]);
		//mg.sidebarScroller = mg.scrollKinetic(document.getElementById('sidebar-list'));
		mg.sidebarScroller = new iScroll('mg-sidebar', mg.options.scrolling);
	};
	mg.loadPrev = function(){
		var slide = mg.slides.pop();
		var firstSlide = mg.slides[0];
    	var page = $('#mg-slide-' + slide.slideId);
    	
    	slide.left = (firstSlide.left - mg.step);
    	slide.page = firstSlide.page - 1;
    	page.css('left', slide.left + '%');
		mg.slides.unshift(slide);
		
		if(slide.page >= 0)
		{
			mg.loadPage(page, slide.page);
		}
    };
    mg.loadNext = function(){
    	var slide = mg.slides.shift();
    	var lastSlide = mg.slides[mg.slides.length - 1];
    	var page = $('#mg-slide-' + slide.slideId);

    	slide.left = (lastSlide.left + mg.step);
   		slide.page = lastSlide.page + 1;
    	page.css('left', slide.left + '%');
    	mg.slides.push(slide);

    	if(slide.page <= mg.maxPage)
		{
			mg.loadPage(page, slide.page);
		}
    };
    
    mg.loadPage = function(slide, page){
    	slide.load(mg.get('directory') + '/' + mg.get('contents')[page], function(){
    		mg.loadSuccess(slide);
    	});
    };
    mg.loadSuccess = function(slide){
    	var scroller;
    	slide.show();
    	$('#' + slide[0]['id'] + ' article').each(function(idx, el){
    		//console.log(el);
    		//console.log(el.children[0]);
    		//@todo: check if the right orientation is loaded and hide others
    		//@todo: refresh iScroll if only dom has changed
    		//@todo: remove iScroll if new page is loaded an append iScroll to it
    		if($.browser.webkit === true)
			{
    			scroller = new iScroll(el, mg.options.scrolling);			
			}
    		else{
    			scroller = new iScroll(el, mg.options.scrolling);
    		}
    		//mg.scrollKinetic(el);
    		//console.log(el);
    		//@TODO activate scrolling for #mg-slide-1 > article > .page
    		
    	});
    	//mg.scrollKineticPage(slide[0]['id']);
    	mg.numberOfPagesLoaded++;
    	if(mg.get('numberOfPagesToLoad') === mg.numberOfPagesLoaded){
    		mg.orientation(false);
    		mg.removeLoadingIndicator();
    	}
    };
    mg.removeLoadingIndicator = function(){
    	mg.hideOverlay();
    };
}(mg));
//*****************************************************************************
// animation module
(function(mg, undefined){
	mg.prev = function(){
    	if(mg.currentPage > 0){
    		mg.currentPage--;
    		mg.currentPosition += (mg.getWidth(mg.firstSlide) + mg.getMargin(mg.firstSlide));
        	mg.animate(mg.slider, mg.currentPosition);
        	mg.loadPrev();
        	mg.sidebarGoTo(mg.currentPage);
    	}
    };
    mg.next = function(){
    	if(mg.currentPage < mg.maxPage){
    		mg.currentPage++;
    		mg.currentPosition -= (mg.getWidth(mg.firstSlide) + mg.getMargin(mg.firstSlide));
    		mg.animate(mg.slider, mg.currentPosition);
       		mg.loadNext();
    		mg.sidebarGoTo(mg.currentPage);
    	}
    };
    
    mg.center = function(){
    	var width;
    	mg.resetWidth();
		mg.resetMargin();
		mg.sidebarCalculate();
    	width = (mg.getWidth(mg.firstSlide) + mg.getMargin(mg.firstSlide)) * mg.slides[2].left / 100 * -1;
    	mg.currentPosition = width;
    	mg.animate(mg.slider, width);
    	if(mg.options.sidebarFixed === false){
    	    mg.sidebarHide('fast');
    	}
    	if($.os.ios === true && parseInt($.os.version) >= 5){
		}
    	else{
    		//mg.scrollKinetic($('#sidebar-list')[0]);
    	}
    };
    
    mg.gotoPage = function(page){
    	var ls = 'middle', i, lsMatrix;
    	if((mg.currentPage) === page){
    		return;
    	}
    	if((mg.currentPage + 1) === page){
    		mg.next();
    		
    		return;
    	}
    	else if((mg.currentPage - 1) === page){
    		mg.prev();
    		
    		return;
    	}
    	mg.showOverlay();
		mg.currentPage = page;
		mg.set('numberOfPagesToLoad', 3);
		mg.numberOfPagesLoaded = 0;
    	if(page > (mg.maxPage - 3)){
    		// if it is in the range of the last page
    		switch(mg.maxPage - page){
    			case 0: // last page
    				ls = 'last';
    				break;
    			case 1: // last page -1 
    				ls = 'last-but-one';
    				break;
    			case 2: // last page - 2
    				ls = 'last-but-two';
    				break;
    		}
    	}
    	else if(page < 3){
    		// if it is in the range of the first page
    		switch(page){
    			case 0: // first page
    				ls = 'first';
    				break;
    			case 1: // first page -1 
    				ls = 'second';
    				break;
    			case 2: // first page - 2
    				ls = 'third';
    				break;
    		}
    	}
    	
    	lsMatrix = mg.loadingSequence[ls];
    	i = lsMatrix.length - 1;
		do{
    		//console.log('loading slide ' + mg.slides[lsMatrix[i].slide].slideId + ' with page ' + lsMatrix[i].page);
    		mg.loadPage($('#mg-slide-' + mg.slides[lsMatrix[i].slide].slideId), page + lsMatrix[i].page);
    		mg.slides[lsMatrix[i].slide].page = page + lsMatrix[i].page;
    	}
    	while(i--)
    };
    
    mg.sidebarShow = function(){
    	var width;
    	mg.buttonOpen.hide();
    	mg.buttonClose.show();
    	width = mg.getWidth(mg.sidebar);
    	mg.animate(mg.sidebar, width);
    	mg.animate(mg.buttonClose, width);
    	mg.animate(mg.buttonOpen, width);
    };
    mg.sidebarHide = function(speed){
    	var duration, width = 0;;
    	speed = speed || 'slow';
    	duration = mg.get('animationTime');
    	if(speed === 'fast'){
    		duration = '0';
    	}
    	mg.buttonOpen.show();
		mg.buttonClose.hide();
		
    	mg.animate(mg.sidebar, width, 0, 0, duration);
    	mg.animate(mg.buttonClose, width, 0, 0, duration);
    	mg.animate(mg.buttonOpen, width, 0, 0, duration);
		
    };
    
    mg.animate = function(obj, x, y, z, duration, ease){
    	var x = (x || 0),
    		y = (y || 0),
    		z = (z | 0),
    		duration = (duration || mg.get('animationTime')),
    		ease = (ease || mg.get('animationType'));
    	if(mg.animation === '3d'){
    		if($.os.ios){
    			obj.animate({translate3d: x + 'px,' + y + 'px,' + z + 'px'}, duration, ease);
    		}
    		else{ // android etc
    			// @TODO: check if translate is faster than translate3d see last comment on: http://stackoverflow.com/questions/3182157/how-to-achieve-smooth-hw-accelerated-transitions-in-the-android-browser
    			//obj.animate({translate: x + 'px'}, duration, ease);
    			obj.animate({translate3d: x + 'px,' + y + 'px,' + z + 'px'}, duration, ease);
    		}
    	}
    	else{
    		obj.animate({translate: x + 'px'}, duration, ease);
    	}
    };
    mg.scrollKinetic = function(el){
    	var list = new FlickList(el),
		positionUpdater;
		list.adjustRange();
		/** /
		positionUpdater = list.scroller.onPositionChanged;
        list.scroller.onPositionChanged = function(pos){
            positionUpdater(pos);
        };
        /**/
		
		return list;
	};
	mg.scrollKineticPage = function(slideId){
		var article = document.getElementById(slideId).getElementsByTagName('article');
		var page;
		for(var i = 0; i < article.length; i++){
			page = article[i].getElementsByClassName('page');
			//console.log(page);
			mg.slideScroller[slideId] = mg.scrollKinetic(page);
		}
	};
}(mg));
//*****************************************************************************
//events module2
(function(mg, undefined){
	mg.sidebarListener = {
		handleEvent: function(e){
			switch(e.type){
			case "click":
				//console.log(e);
				break;
			case "transitionend":
			case "webkitTransitionEnd":
				//console.log('transitionend');
				//console.log('webkitTransitionEnd');
				e.target.removeEventListener(
					e.type,
					mg.sidebarListener,
					false
				);
				mg.sidebarCalculate();
				//mg.sidebarScroller = mg.scrollKinetic('sidebar-list');
				//mg.sidebarScroller.adjustRange();
				setTimeout(function(){
					mg.sidebarScroller.refresh();
				}, 0);
				
				break;
			}
		}
	};
	mg.addEvent = function(element, event, listener, bubble){
		var el = document.getElementById(element);
		bubble = bubble || false;
		//console.log(el);
		if("addEventListener" in el) {
	        // BBOS6 doesn't support handleEvent, catch and polyfill
	        try {
	            el.addEventListener(event, listener, bubble);
	        } catch(e) {
	            if(typeof listener == "object" && listener.handleEvent) {
	                el.addEventListener(event, function(e){
	                    // Bind fn as this and set first arg as event object
	                	listener.handleEvent.call(listener, e);
	                }, bubble);
	            } else {
	                throw e;
	            }
	        }
	    } else if("attachEvent" in el) {
	        // check if the callback is an object and contains handleEvent
	        if(typeof listener == "object" && listener.handleEvent) {
	            el.attachEvent("on" + event, function(){
	                // Bind fn as this
	            	listener.handleEvent.call(listener);
	            });
	        } else {
	            el.attachEvent("on" + event, listener);
	        }
	    }
	};
}(mg));
//*****************************************************************************
//events module
(function(mg, undefined){
	if(mg.touchEnabled === true){
		$('body').bind('touchmove', function(event){
			if(!event.elementIsEnabled)
			{
				event.preventDefault();
			}
		});
	}
	mg.bindEvents = function(){
		if(mg.touchEnabled === true){
			window.addEventListener('orientationchange', mg.orientation, false);
			mg.slider.swipeRight(function(){
				mg.prev();
			});
			mg.slider.swipeLeft(function(){
				mg.next();
			});
		}
		else{
			window.addEventListener('resize', mg.center, false);
			$('.mg-slider-page').bind('mousedown', mg.mousedown);
			$('.mg-slider-page').bind('mousemove', mg.mousemove);
			$('.mg-slider-page').bind('mouseup', mg.mouseup);
			
		}
	};
	mg.orientation = function(timeout){
		var orientation = window.orientation;
		switch(orientation){  
            case 0: case 180: 
            	orientation = 'portrait';
                $('.landscape').hide();
                $('.portrait').show();
            break; 
            default: 
                orientation = 'landscape';
                $('.portrait').hide();
                $('.landscape').show();
        }
		mg.center();
	};
	mg.sidebarEvents = function(){
		if(mg.touchEnabled === true){
			$('.sidebar-list-category').tap(mg.sidebarToggle);
			$('.sidebar-list-item').tap(function(){
				mg.gotoPage(parseInt($(this).attr('id').replace(/page-/, '')));
			});
		}
		else{
			$('.sidebar-list-category').bind('click', mg.sidebarToggle);
			$('.sidebar-list-item').bind('click', function(){
				mg.gotoPage(parseInt($(this).attr('id').replace(/page-/, '')));
			});
		}
	};
	mg.sidebarToggle = function(event, id){
		id = id || $(this).attr('id').replace(/sidebar-category-/, '');
		if(mg.sidebarCategoryActive === id){
			return;
		}
		if(mg.touchEnabled === true){
			mg.addEvent('sidebar-category-content-' + id, 'webkitTransitionEnd', mg.sidebarListener);
		}
		else{
			mg.addEvent('sidebar-category-content-' + id, 'transitionend', mg.sidebarListener);
		}
		$('#sidebar-category-content-' + mg.sidebarCategoryActive).removeClass('sidebar-list-category-active');
		$('#sidebar-category-content-' + mg.sidebarCategoryActive).css('height', 0);
		$('#sidebar-category-content-' + id).addClass('sidebar-list-category-active');
		$('#sidebar-category-content-' + id).css('height', mg.sidebarHightList[id]);
		
		mg.sidebarCategoryActive = id;
	};
	mg.sidebarGoTo = function(slideId){
		var category = mg.getCategory(slideId);
		if(mg.sidebarCategoryActive === category){
			//console.log('same category do nothing');
			// add active to item
			// scroll to if not visible
		}
		else{
			//console.log('other category toggle');
			mg.sidebarToggle(undefined, category);
			//add active to category
			// add active to item
			// scroll to if not visible
		}
	};
	
	mg.getCategory = function(slideId){
		var categoryList = mg.get('category');
		
		return categoryList[slideId];
	};
	
	mg.sidebarCalculate = function(){
		$('.sidebar-category-content').each(function(){
			mg.sidebarHightList.push($(this).css('height'));
		});
	};
	mg.mousedown = function(e){
		mg.mouse.startX = e.clientX;
		mg.mouse.startY = e.clientY;
		mg.mouse.initiated = true;
	};
	mg.mousemove = function(e){
		if(mg.mouse.initiated === false){
			return;
		}
		mg.mouse.X = e.clientX;
		mg.mouse.Y = e.clientY;
	};
	mg.mouseup = function(e){
		if(mg.mouse.startX - mg.mouse.X > 0){
			mg.next();
		}
		else{
			mg.prev();
		}
		mg.mouse.initiated = false;
	};

}(mg));

//*****************************************************************************
//utilities module
(function(mg, undefined){
	var cb;
	
	mg.loadOptions = function(callback){
		cb = callback;
		mg.loadJson(mg.setOptions);
	};
	
	mg.loadJson = function(callback){
		$.getJSON(
			mg.options.json,
			callback,
			function(error){
				console.log(error);
			}
		);
	};
	
	mg.setOptions = function(o){
		var i;
		for(i in o)
		{
			mg.options[i] = o[i];
		}
		cb();
	};
	// @TODO: refactor width and margin
	mg.getWidth = function(obj){
		var width;
		mg.widthList = (mg.widthList || {});
		if(typeof mg.widthList[obj[0]['id']] !== 'undefined'){
			
			return mg.widthList[obj[0]['id']];
		}
		else{
			width = obj.css('width');
			width = parseInt(width.replace(/px/, ''));
			//mg.widthList[obj[0]['id']] = width;
			
			return width;
		}
	};
	mg.resetWidth = function(){
		mg.widthList = {};
	};
	mg.getMargin = function(obj){
		var margin;
		mg.marginList = (mg.marginList || {});
		if(typeof mg.marginList[obj[0]['id']] !== 'undefined'){
			
			return mg.marginList[obj[0]['id']];
		}
		else{
			margin = obj.css('margin-left');
			margin = parseInt(margin.replace(/px/, ''));
			//mg.marginList[obj[0]['id']] = margin;
			
			return margin;
		}
	};
	mg.resetMargin = function(){
		mg.marginList = {};
	};
	
	mg.showOverlay = function(){
		$('#mg-loader').show();
		/** /
		$('#mg-loader').animate({opacity: 1}, 6000, '1,1', function(){
			console.log('show overlay');
		});
		/**/
	};
	mg.hideOverlay = function(){
		$('#mg-loader').hide();
		/** /
		$('#mg-loader').animate({opacity: 0}, 6000, '1,1', function(){
			$('#mg-loader').hide();
			console.log('hide overlay');
		});
		/**/
	};
}(mg));
//*****************************************************************************
// init magazine
mg.init();