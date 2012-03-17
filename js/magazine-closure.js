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
			'scrolling'                 : {hScrollbar: false, vScrollbar: false, hScroll: false, bounce: true},
			'video'                     : false,
			'audio'                     : false,
			'carousel'                  : false
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
		videoPlayerList           : [],
		audioPlayerList           : [],
		deviceSize                : 'large',
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
			var i, size;
			size = parseInt($('#device-size').css('font-size').replace(/px/, ''));
            mg.deviceSize = (size === 3 ? 'large' : size === 2 ? 'medium' : 'small');

            mg.maxPage = (mg.get('contents').length - 1);
			if(mg.get('fullpage') === true){
				$('body').attr('id', 'fullpage');
				mg.startLeft = -100;
				mg.step  = 100;
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
		if($.browser.webkit === true){
			setTimeout(function(){
			    mg.sidebarScroller = new iScroll('mg-sidebar', mg.options.scrolling);
			    //mg.sidebarScroller = $('#mg-sidebar');
			    //mg.ScrollFix(mg.sidebarScroller[0]);
			}, 0);
		}
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
    	if(mg.options.carousel === true){
            $('#' + slide[0]['id'] + ' .mg-carousel').each(function(idx, el){
                mg.carouselDestroy(el);
            });
        }
    	slide.load(mg.get('directory') + '/' + mg.get('contents')[page], function(){
    		mg.loadSuccess(slide);
    	});
    };
    mg.loadSuccess = function(slide){
    	var scroller;
    	mg.numberOfPagesLoaded++;
        if(mg.get('numberOfPagesToLoad') === mg.numberOfPagesLoaded){
            mg.removeLoadingIndicator();
        }
    	$('#' + slide[0]['id'] + ' article').each(function(idx, el){
    		//@todo: check if the right orientation is loaded and hide others
    		//@todo: refresh iScroll if only dom has changed
    		//@todo: remove iScroll if new page is loaded an append iScroll to it
    		if($.os.ios === true && $.os.version >= 5){ // ios >=5
    		    mg.ScrollFix(el);
    		    //scroller = new iScroll(el, mg.options.scrolling);
    		}
    		else if($.browser.webkit === true){ // android and other mobile devices
                setTimeout(function(){
                    scroller = new iScroll(el, mg.options.scrolling);
                }, 0);
    		}
    		else{// desktop browsers
    		    // do nothing
    		}
    	});
    	// if we dont start in landscape
    	mg.orientation(false);
    	if(mg.options.video === true){
    		$('#' + slide[0]['id'] + ' .video').each(function(idx, el){
    			// webkit always native, android until 2.3 
    			if($.browser.webkit === false || ($.os.android === true && $os.version <= 2.3)){
    		        if(mg.videoPlayerList[el.id]){
    		            mg.removeVideoPlayer(mg.videoPlayerList[el.id]);
    		        }
    		        var now = new Date();
    		        var newId = 'video-' + now.getTime() + '-' + Math.floor(Math.random() * 1000);
    		        mg.videoPlayerList[el.id] = newId;//add old id to remember
    		        el.id = newId;
    		        _V_(el.id);// others use html5 with flash fallback
    		    }
        	});
    	}
    	if(mg.options.audio == true){
    		$('#' + slide[0]['id'] + ' .audio').each(function(idx, el){
			    if(mg.audioPlayerList[el.id]){
		            mg.removeAudioPlayer(mg.audioPlayerList[el.id]);
		        }
		        var now = new Date();
		        var newId = 'audio-' + now.getTime() + '-' + Math.floor(Math.random() * 1000);
		        mg.audioPlayerList[el.id] = newId;//add old id to remember
		        el.id = newId;
		        audiojs.create(el);
        	});
    		
    	}
    	if(mg.options.carousel === true){
    		$('#' + slide[0]['id'] + ' .mg-carousel').each(function(idx, el){
    			mg.carouselInit(el);
        	});
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
    	if(mg.currentPosition !== width){
    		mg.currentPosition = width;
        	mg.animate(mg.slider, width, 0, 0, 0);//duration 0s
    	}
    	
    	if(mg.options.sidebarFixed === false){
    	    mg.sidebarHide('fast');
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
    	if(page > mg.maxPage || page < 0){
    	    return;
    	}
    	mg.showOverlay();
		mg.currentPage = page;
		mg.set('numberOfPagesToLoad', 3);
		mg.numberOfPagesLoaded = 0;
    	if(page > (mg.maxPage - 3) && page <= mg.maxPage){
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
    	else if(page < 3 && page >= 0){
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
}(mg));
//*****************************************************************************
//events module2
(function(mg, undefined){
	mg.sidebarListener = {
		handleEvent: function(e){
			switch(e.type){
			case "click":
				break;
			case "transitionend":
			case "webkitTransitionEnd":
				e.target.removeEventListener(
					e.type,
					mg.sidebarListener,
					false
				);
				mg.sidebarCalculate();
				setTimeout(function(){
					mg.sidebarScroller.refresh();
					//mg.ScrollFix(mg.sidebarScroller[0]);
				}, 0);
				
				break;
			}
		}
	};
	mg.addEvent = function(element, event, listener, bubble){
		var el = document.getElementById(element);
		bubble = bubble || false;
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
				//event.preventDefault();
			}
		});
	}
	mg.bindEvents = function(){
		if(mg.touchEnabled === true){
			window.addEventListener('orientationchange', mg.orientation, false);
			/**/
			mg.slider.swipeRight(function(){
				mg.prev();
			});
			mg.slider.swipeLeft(function(){
				mg.next();
			});
			/**/
		}
		else{
			window.addEventListener('resize', mg.center, false);
			$('.mg-slider-page').bind('mousedown', mg.mousedown);
			$('.mg-slider-page').bind('mousemove', mg.mousemove);
			$('.mg-slider-page').bind('mouseup', mg.mouseup);
		}
	};
	mg.orientation = function(center){
		var orientation = window.orientation;
		var center = center || true;
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
		if(center)
		{
			mg.center();
		}
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
			// scroll to if not visible
		}
		else{
			mg.sidebarToggle(undefined, category);
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
	    mg.mouse = {};
	    mg.mouse.startX = e.clientX;
		mg.mouse.startY = e.clientY;
		mg.mouse.X = 0;
        mg.mouse.Y = 0;
		mg.mouse.initiated = true;
		mg.moved = false;
	};
	mg.mousemove = function(e){
		if(mg.mouse.initiated === false){
			return;
		}
		mg.moved = true;
		mg.mouse.X = e.clientX;
		mg.mouse.Y = e.clientY;
	};
	mg.mouseup = function(e){
	    var moved = 0, movedX = 0, movedY = 0, threshold = 80;
	    if(mg.moved === true){
	        movedX = mg.mouse.startX - mg.mouse.X;
	        movedY = mg.mouse.startY - mg.mouse.Y;
	        if(movedX >= threshold || (movedX * -1) >= threshold){
	            moved = Math.sqrt(Math.pow(Math.abs(movedX), 2) + Math.pow(Math.abs(movedY), 2));
	        }
	    }
	    if(mg.moved === true && moved >= threshold){
            if(mg.mouse.startX - mg.mouse.X > 0){
                mg.next();
            }
            else{
                mg.prev();
            }
        }
        mg.mouse.startX = 0;
        mg.mouse.startY = 0;
        mg.mouse.X = 0;
        mg.mouse.Y = 0;
		mg.mouse.initiated = false;
		mg.moved = false;
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
	/**
	* ScrollFix v0.1
	* http://www.joelambert.co.uk
	*
	* Copyright 2011, Joe Lambert.
	* Free to use under the MIT license.
	* http://www.opensource.org/licenses/mit-license.php
	*/

	mg.ScrollFix = function(elem){
    	// Variables to track inputs
    	var startY, startTopScroll;
    
    	//elem = elem || document.querySelector(elem);
    
    	// If there is no element, then do nothing
    	if(!elem){
    	    return;
    	}
    	
    
    	// Handle the start of interactions
    	elem.addEventListener('touchstart', function(event){
        	startY = event.touches[0].pageY;
        	startTopScroll = elem.scrollTop;
        
        	if(startTopScroll <= 0){
        	    elem.scrollTop = 1;
        	}
        	if(startTopScroll + elem.offsetHeight >= elem.scrollHeight){
        	    elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
        	}
        },false);
	};
	mg.showOverlay = function(){
		//$('#mg-loader').show(1000);
		$('#mg-loader').fadeIn(200);
		/** /
		$('#mg-loader').animate({opacity: 1}, 6000, '1,1', function(){
			console.log('show overlay');
		});
		/**/
	};
	mg.hideOverlay = function(){
		//$('#mg-loader').hide(1000);
		$('#mg-loader').fadeOut(1000);
		/** /
		$('#mg-loader').animate({opacity: 0}, 6000, '1,1', function(){
			$('#mg-loader').hide();
			console.log('hide overlay');
		});
		/**/
	};
	mg.removeVideoPlayer = function(id){
		var player = _V_(id);
		//  this workaround was found here: http://stackoverflow.com/questions/5170398/ios-safari-memory-leak-when-loading-unloading-html5-video
		if(player.techName == "html5"){
			player.tag.src = "";
		    player.tech.removeTriggers();
		    player.load();
		}
		// destroy the parts of the player which are specific to html5 or flash
		player.tech.destroy();
		// destroy the player
		player.destroy();
	};
	mg.removeAudioPlayer = function(id){
		
	};
}(mg));
//*****************************************************************************
//carousel module
(function(mg, undefined){
    mg.carouselInit = function(el){
		var slider, imgList, indicator, current = 0, length = 0, width, position = 0,
		next, previous, center,
		mouse = {initiated: false}, mousedown, mousemove, mouseup, mouseout, moved;
		el = $(el);
		indicator = $('.mg-carousel-indicator', el);
		imgList = $('img', el);
		imgList.css('display', 'inline');
		imgList.eq(0).one('load', function() {
			el.css('height', (parseInt(imgList.css('height').replace(/px/, '')) + 20) + 'px');
        }).each(function() {
            if(this.complete){
            	$(this).trigger('load');
            }
        });
		el.css('width', imgList.css('width'));
		indicator.css('width', imgList.css('width'));
		$('li', el).each(function(idx, li){
			$(li).css('left', (idx) * 100 + '%');
		});
		
		slider = $('.mg-carousel-container', el);
		length = imgList.length - 1;
		width  = imgList.css('width');
		width = parseInt(width.replace(/px/, ''));
		
		center = function(e){
		    width  = slider.css('width');
	        width = parseInt(width.replace(/px/, ''));
	        position = current * width * -1;
	        mg.animate(slider, position, 0, 0, 0);
		};
		next = function(e){
            if(current + 1 <= length){
                current++;
                position -= width;
                mg.animate(slider, position);
                setActive(current);
            }
            e.preventDefault();
            e.stopPropagation();
	    };
	    previous = function(e){
            if(current - 1 >= 0){
                current--;
                position += width;
                mg.animate(slider, position);
                setActive(current);
            }
            e.preventDefault();
            e.stopPropagation();
	    };
	    setActive = function(idxActive){
	    	var label = $('.mg-carousel-indicator label', el);
	    	label.each(function(idx, el){
	    		if(idx === idxActive){
	    			$(el).addClass('active');
	    		}
	    		else{
	    			$(el).removeClass('active');
	    		}
	    		
	    	});
	    };
	    mousedown = function(e){
	    	mouse = {};
		    mouse.startX = e.clientX;
			mouse.startY = e.clientY;
			mouse.X = 0;
	        mouse.Y = 0;
			mouse.initiated = true;
			moved = false;
			e.preventDefault();
	    };
	    mousemove = function(e){
	    	if(mouse.initiated === false){
				return;
			}
			moved = true;
			mouse.X = e.clientX;
			mouse.Y = e.clientY;
	    };
	    mouseup = function(e){
	    	var realMoved = 0, movedX = 0, movedY = 0, threshold = 40;
		    if(moved === true){
		        movedX = mouse.startX - mouse.X;
		        movedY = mouse.startY - mouse.Y;
		        if(movedX >= threshold || (movedX * -1) >= threshold){
		        	realMoved = Math.sqrt(Math.pow(Math.abs(movedX), 2) + Math.pow(Math.abs(movedY), 2));
		        }
		    }
		    if(moved === true && realMoved >= threshold){
	            if(mouse.startX - mouse.X > 0){
	                next(e);
	            }
	            else{
	                previous(e);
	            }
	        }
	        mouse.startX = 0;
	        mouse.startY = 0;
	        mouse.X = 0;
	        mouse.Y = 0;
			mouse.initiated = false;
			moved = false;
	    };
	    mouseout = function(e){
	    	mouse.startX = 0;
	        mouse.startY = 0;
	        mouse.X = 0;
	        mouse.Y = 0;
			mouse.initiated = false;
			moved = false;
	    };
	    if(mg.touchEnabled === true){
	    	slider.swipeRight(previous);
	        slider.swipeLeft(next);
	    }
	    else{
	    	slider.bind('mousedown', mousedown);
	    	slider.bind('mousemove', mousemove);
	    	slider.bind('mouseup', mouseup);
	    	slider.bind('mouseout', mouseout);
	    	$('label', indicator).each(function(idx, label){
	    		$(label).bind('click', function(){
	    			mg.animate(slider, idx * width * -1);
	    			setActive(idx);
	    			current = idx;
	    			position = idx * width * -1;
	    		});
	    	});
	    }
        //$(window).resize(center);
	};
	
	mg.carouselDestroy = function(el){
	    var slider;
        el = $(el);
	    slider = $('.mg-carousel-container', el);
	    if(mg.touchEnabled === true){
	    	slider.unbind('swipeRight');
	        slider.unbind('swipeLeft');
	    }
	    else{
	    	slider.unbind('mousedown');
	        slider.unbind('mousemove');
	        slider.unbind('mouseup');
	    }
        
    };
}(mg));
//*****************************************************************************
// init magazine
mg.init();