"use strict";
var sel = (function(window, document, undefined){
	var slice = (function(){
	    try{
	    	Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
	    	return [].slice;
	    }
	    catch(e){
	    	return (function(){
		        var a = [], i = 0, l = this.length;
		        for(; i < l; i++){
		        	a.push(this[i]);
		        }
		        return a;
		      });
	    }
		
	})();
	var indexOf = [].indexOf ? function(item, array){
    	return indexOf.call(array, item);
	}: function(item, array){
	      for(var i = 0, l = array.length; i < l; i++){
	    	  if(array[i] === item){
	    		  return i;
	    	  }
	      }
	      return -1;
	};

	var trim = ''.trim ? function(str){
		return "".trim.call(str);
	}: function(str){
		// possibly faster??
		//return str.replace(/^\s+/, '').replace(/\s+$/, '');
		var	str = str.replace(/^\s\s*/, ''),
			ws = /\s/,
			i = str.length;
		while(ws.test(str.charAt(--i)));
		return str.slice(0, i + 1);
	};
	var getStyle = function(el, key){
		// style
		if(el.style[key]){
			return el.style[key];
		}// FF, Safari, Opera, Chrome
		else if(document.defaultView && document.defaultView.getComputedStyle){
			return document.defaultView.getComputedStyle(el, "")[key];
		}// IE
		else if(el.currentStyle){
			return el.currentStyle[key];
		} 
	};
	var getResultByClassName = function(selector, context){
		var node = context.firstChild,
        nodeList = [],
        elements;
	    if(node){
	        do{
	            if(node.nodeType === 1){

	                if(node.className && node.className.match('\\b' + selector + '\\b')){
	                	nodeList.push(node);
	                }
	                // Get nodes from node's children
	                if((elements = getResultByClassName(selector, node)).length){
	                	nodeList = nodeList.concat(elements);
	                }
	            }
	        }
	        while(node = node.nextSibling);
	    }
	    return nodeList;
	};
	var each = function(obj, iterator, context){
		var nativeForEach = Array.prototype.forEach,
		i = obj.length,
		key;
		
		if(obj == null){
			return;
		}
		if(nativeForEach && obj.forEach === nativeForEach){
	    	obj.forEach(iterator, context);
	    }else if(obj.length === +obj.length){
	    	do{
	    		if(i in obj && iterator.call(context, obj[i], i, obj) === {}){
	    			return;
	    		}
	    	}
	    	while(i--)
	    }else{
	      for(key in obj){
	        if(hasOwnProperty.call(obj, key)){
	          if(iterator.call(context, obj[key], key, obj) === {}){
	        	  return;
	          }
	        }
	      }
	    }
	};
	var detectOs = function(userAgent){
		// inspired by zepto.js
		var os = {},
			webkit = userAgent.match(/WebKit\/([\d.]+)/),
		    android = userAgent.match(/(Android)\s+([\d.]+)/),
		    ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/),
		    iphone = !ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/),
		    webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
		    touchpad = webos && userAgent.match(/TouchPad/),
		    blackberry = userAgent.match(/(BlackBerry).*Version\/([\d.]+)/);
		
		if(android){
			os.android = true, os.version = android[2];
		}
	    if(iphone){
	    	os.ios = true, os.version = iphone[2].replace(/_/g, '.'), os.iphone = true;
	    }
	    if(ipad){
	    	os.ios = true, os.version = ipad[2].replace(/_/g, '.'), os.ipad = true;
	    }
	    if(webos){
	    	os.webos = true, os.version = webos[2];
	    }
	    if(touchpad){
	    	os.touchpad = true;
	    }
	    if(blackberry){
	    	os.blackberry = true, os.version = blackberry[2];
	    }
	    if(1 === 1)
    	{
	    	os.desktop = true, os.version = 1;
    	}
	    
	    return os;
	};
	
	function s(obj, elements){
		elements = elements || [];
		function F(){};
		F.prototype = obj;
        var newObj = new F();
        for(var b = 0; b < elements.length; b++){
        	newObj[b] = elements[b];
		}
        console.log('new instance created');
        return newObj;
	}
	
	var $$ = function(selector, context){
		if(!(this instanceof $$)){
		    console.log('no instance return new one');
			return new $$(selector, context);
		}
		if(!selector){
			return s(this);
		}
		this.find(selector, context);
		this.selector = selector;
		
		return s(this, this.result);
	};
	
	$$.prototype = {
		selector: '',
		length: 0,
		os : {},
		find: function(selector, context){
			var byId = false, byTag = false, byClass = false;
			if(!context){
				context = document
			}
			if(document.querySelectorAll){
				this.result = slice.call(context.querySelectorAll(selector));
			}
			else{
				
				// id
				if(selector.charAt(0) === '#'){
	                selector = selector.substr(1);
	                byId = true;
	            }
	            // class
	            else if(selector.charAt(0) === '.'){
	                selector = selector.substr(1);
	                byClass = true;
	            }
	            // Tag
	            else{
	                byTag = true;
	            }
				if(byId){
					this.result = slice.call(context.getElementById(selector));
				}
				else if(byClass){
					if(context.getElementsByClassName){
						this.result = slice.call(context.getElementsByClassName(selector));
			        }
			        else{
			        	this.result = slice.call(getResultByClassName(selector, context));
			        }
				}
				else{
					this.result = slice.call(context.getElementsByTagName(selector));
				}
			}
			if(!this.result){
				this.result = [];
	        }
	        else if(!this.result.pop){
	        	this.result = [this.result];
	        }
			this.length = this.result.length;
		},
		css: function(key, value){
			var css = '', prop;
			// read css
			if(value === undefined && typeof key == 'string'){
				if(this.length === 0){
					return undefined;
				}
				else{
					// console.log(this.result);
					return getStyle(this.result[0], key);
				}
			}
			
			for(prop in key){
				css += prop + ':' + key[prop] + ';';
			}
			if(typeof key == 'string'){
				css = key + ":" + value;
			}
			each(this.result, function(obj, index){
				obj.style.cssText += ';' + css;
			});
			
			return this;
		},
		addClass: function(className){
			each(this.result, function(obj, index){
		        if(obj.className.indexOf(className) > -1){
		        	return this;
		        }
		        obj.className = trim(obj.className + ' ' + className);
	        });
			return this;
	    },
	    removeClass: function(className){
	    	each(this.result, function(obj, index){
	    		obj.className = trim(obj.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1'));
	        });
	    	return this;
	    },
	    attr: function(attr, value){
    		if(value === undefined){
    			return (this.length === 0 ? undefined : this.result[0].getAttribute(attr));
    		}
    		each(this.result, function(obj, index){
    			obj.setAttribute(attr, value);
    		});
    		
    		return this;
	    },
		each: function(iterator){
			each(this.result, iterator);
			return this;
		},
		show: function(){
			this.css('display', 'block');
			return this;
		},
		hide: function(){
			this.css('display', 'none');
			return this;
		},
		remove: function(){
			each(this.result, function(obj, index){
				obj.parentNode.removeChild(obj);
			});
			//@TODO does it make sense to return this???
			return $$(this.selector);
		},
		getJSON : function(url, success, error){
		    return $.ajax({ url: url, success: success, error: error, dataType: 'json' });
		},
		toString: function(){
			return this.selector + '';
		}

	};
	// detect os, version
	$$.os = detectOs(navigator.userAgent);
	// detect ajax method for IE
	if(typeof window.XMLHttpRequest === 'undefined' && typeof window.ActiveXObject === 'function'){
	    window.XMLHttpRequest = function(){
	        try{
	        	return new ActiveXObject('Msxml2.XMLHTTP.6.0');
	        }
	        catch(e){
	        	
	        }
	        try{
	        	return new ActiveXObject('Msxml2.XMLHTTP.3.0');
	        }
	        catch(e){
	        	
	        }
	        
	        return new ActiveXObject('Microsoft.XMLHTTP');
	    };
	}

	
	return $$;
	
})(window, window.document);

window.sel = sel;
'$$' in window || (window.$$ = sel);