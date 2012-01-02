/** /
(function() {
    ep.touch = {};
    ep.touch.scrollStart = 0;
    ep.touch.enabled = function(){
		try{
			document.createEvent("TouchEvent");
			
			return true;
		}catch(e){
			
			return false;
		}
    }
    ep.touch.scroll = function (id){
    	if(ep.touch.enabled()){
    		var el = document.getElementById(id);
    		var scrollStartPos = 0;

    		document.getElementById(id).addEventListener("touchstart", function(event) {
    			ep.touch.scrollStart = this.scrollTop + event.touches[0].pageY;
    			//$(this).animate({translate3d:  '0,' + ep.touch.scrollStart + ',0'}, ep.options.animationTime, 'linear');
    			event.preventDefault();
    			//event.elementIsEnabled = true;
    		},false);

    		document.getElementById(id).addEventListener("touchmove", function(event) {
    			//this.scrollTop = ep.touch.scrollStart - event.touches[0].pageY;
    		    //ep.touch.scrollStart += ((ep.touch.scrollStart - event.touches[0].pageY) * -1); 
    		    $(this).animate({translate3d:  '0,' + ((ep.touch.scrollStart - event.touches[0].pageY) * -1) + 'px,0'}, ep.options.animationTime, 'linear');
    			event.preventDefault();
    			//event.elementIsEnabled = true;
    		},false);
    	}
    }
}());
/**/
// touch
    ep.touch.multiTouch = function(e){
    	if(ep.touch.enabled === true)
		{
    		if(e.touches.length > 1)
			{
    			return true;
			}
    		else
    		{
    			return false;
    		}
		}
    	else
    	{
    		return false;
    	}
    };
	ep.touch.start = function(e){
		var touch = ep.touch.enabled ? e.touches[0] : e;

		if(ep.touch.multiTouch(e) === true)
		{
			ep.touch.cancel(e);
			
			return;
		}
		var y0 = (typeof ep.touch[ep.options.currentPageId].y0 !== 'undefined' ? ep.touch[ep.options.currentPageId].y0 : 0);
		ep.touch[ep.options.currentPageId].y0 = y0;
		ep.touch[ep.options.currentPageId].init = true;
		ep.touch[ep.options.currentPageId].target = ep.options.currentPageId;
		ep.touch[ep.options.currentPageId].y1 = touch.pageY;
		ep.touch[ep.options.currentPageId].y2 = touch.pageY;
	};
	ep.touch.move = function(e){
		var touch = ep.touch.enabled ? e.touches[0] : e;
		if(typeof ep.touch[ep.options.currentPageId] === 'undefined')
		{
			return;
		}
		if(ep.touch[ep.options.currentPageId].init !== true)
		{
			ep.touch.cancel(e);
			
			return;
		}
		e.preventDefault();
		if(ep.touch[ep.options.currentPageId].init !== true)
		{
			ep.touch.cancel(e);
			
			return;
		}
		if(ep.touch.multiTouch(e) === true)
		{
			touchCancel(e);
			
			return;
		}
		else
		{
			ep.touch[ep.options.currentPageId].x2 = touch.pageX;
			ep.touch[ep.options.currentPageId].y2 = touch.pageY;
			var yDelta = (ep.touch[ep.options.currentPageId].y2 - ep.touch[ep.options.currentPageId].y1) * -1;
			var yMove = ep.touch[ep.options.currentPageId].y0 + yDelta;
			ep.scroll.down(ep.options.currentPageId, yMove, 50);
		}
	};
	ep.touch.end = function(e){
		var touch = ep.touch.enabled ? e.touches[0] : e;
		if(typeof ep.touch[ep.options.currentPageId] === 'undefined')
		{
			return;
		}
		if(ep.touch[ep.options.currentPageId].init !== true)
		{
			ep.touch.cancel(e);
			
			return;
		}
		// do touch logic here
		var yDelta = (ep.touch[ep.options.currentPageId].y2 - ep.touch[ep.options.currentPageId].y1) * -1;
		var yMove = ep.touch[ep.options.currentPageId].y0 + yDelta;
		if(yMove < 0)
		{
			yMove = 0;
			yDelta = 0;
			ep.touch[ep.options.currentPageId].y0 = 0;
		}
		if(yMove > ep.touch[ep.options.currentPageId].pageHeight)
		{
			yMove = ep.touch[ep.options.currentPageId].pageHeight;
			ep.touch[ep.options.currentPageId].y0 = ep.touch[ep.options.currentPageId].pageHeight;
			yDelta = 0;
		}
		ep.scroll.down(ep.options.currentPageId, yMove);
		ep.touch[ep.options.currentPageId].y0 += yDelta;
		ep.touch[ep.options.currentPageId].y1 = 0;
		ep.touch[ep.options.currentPageId].y2 = 0;
		ep.touch[ep.options.currentPageId].init = false;
	};
	ep.touch.cancel = function(e){
		var touch = ep.touch.enabled ? e.touches[0] : e;
		ep.touch[ep.options.currentPageId].y1 = 0;
		ep.touch[ep.options.currentPageId].y2 = 0;
		ep.touch[ep.options.currentPageId].init = false;
		//console.log('cancel');
	};
	// scroll
	ep.scroll.up = function(page, move){
		var scrollTo = $('#ep-' + page + ' article .page');
		ep.scroll.core(scrollTo, move);
	};
	ep.scroll.down = function(page, move, duration){
		var scrollTo = $('#ep-' + page + ' article .page');
		ep.scroll.core(scrollTo, (move * -1), duration);
	};
	ep.scroll.core2 = function(page, move){
		document.getElementById('article-1').scrollTop = move * -1;
	};
	ep.scroll.core = function(page, move, duration){
		if(typeof duration === 'undefined')
		{
			duration = ep.options.animationTime;
		}
		if(ep.options.animate === '3d')
		{
		    if(!$.os.ios)
	        {
		    	page.animate({translate3d: '0,' + move + '%,0'}, duration, 'ease-in-out');
	        }
		    else
		    {
		        // @TODO: check if translate is faster than translate3d see last comment on: http://stackoverflow.com/questions/3182157/how-to-achieve-smooth-hw-accelerated-transitions-in-the-android-browser 
		    	page.animate({translate3d: '0,' + move + 'px,0'}, duration, 'ease-in-out');
		    }
		}
		else
		{
			page.animate({translateY: move + 'px'}, duration, 'ease-in-out');
			//page.animate({translate: (ep.options.currentSlide * -ep.options.step) + '%'}, ep.options.animationTime, 'linear');
		}
	};