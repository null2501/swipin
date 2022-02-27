(function () {
	
	// Main swipin class
	var SWIPIN = function(id){
		// Private vars
		var that = this,
		pos = 0,
		_pos = 0,
		over = true,
		hold = false,
		moving = false,
		visible = null,
		sliderLength = 0,
		obj = document.getElementById(id),
		_obj = obj.getElementsByClassName('swipin-slider')[0],
		extended = false,
		items = [],
		loop = true,
		clones = 0,
		auto = 0,
		controls = true,
		pager = true,
		pagerdiv = false,
		tmr = false,
		touch = ("ontouchstart" in document.documentElement),
		autoadvance = false;

		// Event setup
		var e_i = new CustomEvent('swipinInit'),
		e_bm = new CustomEvent('swipinBeforeMove'),
		e_m = new CustomEvent('swipinMove'),
		e_v = new CustomEvent('swipinVisibility');
		
		if (observer) {
			// Observer - supported
			observer.observe(obj);
		} else {
			// Observer - unsupported
			visible=true;
			setTimeout(function(){
				obj.dispatchEvent(e_v);
			},1);
		}
		
		// Init / Update 
		var init = function(){
			
			// Check if extended
			if(obj.getElementsByClassName('swipin-extender').length>0) extended = true;
			else extended = false;
			
			// Touch of class
			if (touch) obj.classList.add('swipin-touch');
			
			// Get rid of clones
			removeItems('swipin-clone');
			
			// Items loop
			items = _obj.getElementsByClassName('swipin-item');
			sliderLength = items.length;
			for (var i = 0; i < sliderLength; i++ ){
				items[i].removeEventListener('transitionend', eoTransition);
				items[i].addEventListener('transitionend', eoTransition);
				items[i].setAttribute("data-id", i+1);
				if(items[i].classList.contains('swipin-current')) { pos = i; _pos = i; }
			}
			
			// Preload
			if (visible) preload();

			// Loop or no-loop?
			t = obj.getAttribute('data-loop');
			loop = true;
			if (t) if (t === "false") loop = false;
			
			// Is autoplay required?
			var t = obj.getAttribute('data-autoplay');
			if (t) {
				if (t === "false") t="0";
				auto = Number(t);
			} else auto = 0;

			// Is mousepause required?
			over = true;
			t = obj.getAttribute('data-mousepause');
			if(t)if(t==='false') over = false;
			if (auto>0) {
				if (over){
					obj.addEventListener('mouseover', moOver);
					obj.addEventListener('mouseout', moOut);
				}
			}

			// Are controls required?
			t = obj.getAttribute('data-controls');
			if (t) {
				if (t === "true") controls = true;
				else controls = false;
			} else controls = true;
			
			// Prev/Next management
			if (controls) {
				if(_obj.getElementsByClassName("swipin-prev-button").length===0){
					var p = document.createElement('div');
					p.className="swipin-prev-button";
					p.addEventListener('click',that.prev);
					if(auto>0){
						p.addEventListener('mouseover', moOver);
						p.addEventListener('mouseout', moOut);
					}
					_obj.appendChild(p);
					p = document.createElement('div');
					p.className="swipin-next-button";
					p.addEventListener('click',that.next);
					if(auto>0){
						p.addEventListener('mouseover', moOver);
						p.addEventListener('mouseout', moOut);
					}
					_obj.appendChild(p);
				}
			}
			
			// Is pager required?
			t = obj.getAttribute('data-pager');
			if (t) {
				if (t === "true") pager = true;
				else pager = false;
			} else pager = true;
			
			// Pager management
			if (pager) {
				if(obj.getElementsByClassName("swipin-pager").length===0){
					pagerdiv = document.createElement('div');
					pagerdiv.className="swipin-pager";
					obj.appendChild(pagerdiv);
				} else pagerdiv = obj.getElementsByClassName("swipin-pager")[0];
				pagerdiv.innerHTML = '';
				for(var i = 1;i <= sliderLength; i++){
					var p = document.createElement('div');
					p.setAttribute('data-id',i);
					p.className="swipin-page";
					if(pos+1 === i) p.className = p.className + " swipin-active";
					p.addEventListener('click', clickPage);
					pagerdiv.appendChild(p);
				}
				pagerdiv = obj.getElementsByClassName("swipin-page");
			}
			
			// Clones setup
			addClones();
			
			// Final slider setup
			updateClasses();
			
			// Autoplay management
			if (auto>0) {
				if (!visible) hold = true;
				if(!hold) moOut();
			}
			
			// End of init
			obj.classList.add("swipin-initted");
			obj.classList.add("swipin-enter");
			
			setTimeout(function(){obj.dispatchEvent(e_i);},1);
		}

		// Mouseover, out and pager click handlers
		var moOver = function(){ if(tmr)clearTimeout(tmr); hold = true; }
		var moOut = function() { if(!visible)return;if(tmr)clearTimeout(tmr); tmr = setTimeout(function(){autoadvance=true;that.next();autoadvance=false;}, auto); hold = false; }
		var clickPage = function(e) {var id = Number(e.target.getAttribute('data-id')); that.goTo(id); }

		// Pager setup
		var setpager = function(){
			if(pagerdiv&&pager){
				for(var f=0;f<pagerdiv.length;f++){
					if(f===_pos){
						pagerdiv[f].classList.add("swipin-active");
					} else {
						pagerdiv[f].classList.remove("swipin-active");
					}
				}
			}
		}
		
		// Main slider setup / update
		var updateClasses = function() {
			var rpos=_pos, prv, pprv, nxt, nnxt;

			/// current, next, prev... calculations
			if (rpos < 0) rpos = rpos + items.length;
			if (rpos >= items.length) rpos = rpos - items.length;
			prv = rpos - 1;
			obj.classList.remove('swipin-left');
			obj.classList.remove('swipin-right');
			if (prv < 0) {
				if (!loop) {
					prv = null;
					obj.classList.add("swipin-left");
				} else prv = prv + items.length;
			}
			pprv = rpos - 2;
			if (pprv < 0) pprv = pprv + items.length;
			nxt = rpos + 1;
			if (nxt >= items.length) {
				if (!loop) {
					nxt = null;
					obj.classList.add("swipin-right");
				} else nxt = nxt - items.length;
			}
			nnxt = rpos + 2;
			if (nnxt >= items.length) nnxt = nnxt - items.length;
			
			// Actual classes setup
			for(var f=0;f<items.length;f++){
				items[f].classList.remove("swipin-current");
				items[f].classList.remove("swipin-next");
				items[f].classList.remove("swipin-prev");
				
				if (extended) {
					items[f].classList.remove("swipin-nnext");
					items[f].classList.remove("swipin-pprev");
				}
				if (f===rpos) {
					items[f].classList.add("swipin-current");
				} else if (f===nxt) items[f].classList.add("swipin-next");
				else if (f===nnxt&&extended) items[f].classList.add("swipin-nnext");
				else if (f===prv) items[f].classList.add("swipin-prev");
				else if (f===pprv&&extended) items[f].classList.add("swipin-pprev");
			}
			
		}
		
		// End of transition handler
		var eoTransition = function() {
			if(!moving) return;
			
			// Real pos calculations
			var _op = _pos;
			if (_pos<0) _pos = sliderLength-1;
			if (_pos>=sliderLength) _pos = 0;
			pos = _pos;
	
			// disable animation
			obj.classList.remove("swipin-anim");

			// Main slider update
			if(_op!==_pos) updateClasses();
			
			// End of movement stuff
			moving = false;
			preload();
			setpager();
			if (auto>0) if(!hold) moOut();
			
			// Swipin-enter setup
			if(_op!==_pos){
				// Warning: clones!
				var t = 1;
				// Warning: IE11
				if (!!window.MSInputMethodContext && !!document.documentMode) t=20
				setTimeout(function(){obj.classList.add("swipin-enter");}, t);
			} else obj.classList.add("swipin-enter");
			
			// Event out
			obj.dispatchEvent(e_m);
		}
		
		// Clones setup
		var addClones = function() {
			clones = 0;
			if (loop) {
				if (extended) {
					if (sliderLength < 5) {
						clones = 4;
						addClone(0);
						addClone(1);
						addClone(sliderLength-2);
						addClone(sliderLength-1);
					} else return;
				} else {
					if (sliderLength < 3) {
						clones = 2;
						addClone(0);
						addClone(1);
					} else return;
				}
			}
		}
		
		// Single clone setup
		var addClone = function(p) {
			while (p >= sliderLength) p = p - sliderLength;
			while (p < 0) p = p + sliderLength;
			var c = items[p].cloneNode(true);
			c.classList.add('swipin-clone');
			_obj.appendChild(c);
		}
		
		// Remove items of a specified class
		var removeItems = function(cls){
			var v = obj.getElementsByClassName(cls);
			for (var i = v.length-1; i >= 0; i--) v[i].remove();
		}
		
		// Main preload function
		var preload = function() {
			_preload(pos);
			var n = pos + 1;
			if(n>=sliderLength) n = n - sliderLength;
			_preload(n);
			n= pos - 1;
			if(n<0) n = n + sliderLength;
			_preload(n);
			if(extended){
				n= pos - 2;
				if(n<0) n = n + sliderLength;
				_preload(n);
				n = pos + 2;
				if(n>=sliderLength) n = n - sliderLength;
				_preload(n);
			}
		}
		
		// preload of a single slide
		var _preload = function(n) {
			var repla = function(imgs) {
				for(var i=0;i<imgs.length;i++){
					var di = imgs[i].getAttribute('data-srcset');
					if(di){
						imgs[i].srcset = di;
						imgs[i].removeAttribute('data-srcset');
					}
					di = imgs[i].getAttribute('data-src');
					if(di){
						imgs[i].src = di;
						imgs[i].removeAttribute('data-src');
					}
					di = imgs[i].getAttribute('data-background');
					if(di){
						imgs[i].style.backgroundImage = 'url('+di+')';
						imgs[i].removeAttribute('data-background');
					}
				}
			}
			for(var f=0;f<items.length;f++) {
				var id = Number(items[f].getAttribute('data-id'));
				if(id===n+1) {
					repla(items[f].getElementsByTagName('img'));
					repla(items[f].getElementsByTagName('source'));
					repla(items[f].getElementsByTagName('div'));
				}					
			}
		}

		// Common movement management
		var prevNext = function(p,ani){
			if (moving){
				return;
			}
			_pos = p;
			obj.dispatchEvent(e_bm);
			if (typeof ani === 'undefined') ani = true;
			moving = true;
			obj.classList.remove("swipin-enter");
			if (ani) obj.classList.add("swipin-anim");
			updateClasses();
		}

		// Public Methods
		
		// Update slider and clones
		that.update = function(){ init(); }
		
		// Get slider info
		that.info = function(){ 
			_p = _pos;
			if(_p<0) _p = _p + sliderLength;
			else if (_p>=sliderLength) _p = _p - sliderLength;
			return({
				"pos": pos+1,
				"next": _p+1,
				"moving": moving,
				"visible": visible,
				"length": sliderLength,
				"extended": extended,
				"loop": loop
			});
		}
		
		// Move to a certain slide
		that.goTo = function(p){
			p = p-1;
			if(p===pos) return;
			if (!loop) {
				if(p>=sliderLength) return;
				if(p<0) return;
			}
			prevNext(p, false);
			eoTransition();
		}
		
		// Move to next slide
		that.next = function(){
			if (!loop) {
				if(pos >= sliderLength-1) {
					if (autoadvance) that.goTo(1);
					return;
				}
			}
			prevNext(pos+1);
		}
		
		// Move to previous slide
		that.prev = function(){
			if (!loop) if(pos<1) return;
			prevNext(pos-1);
		}
		
		// Get N slide element
		that.getItem = function(p){
			if (typeof p === 'undefined') p = pos;
			else p = p - 1;
			return items[p];
		}
		
		// Set N slide HTML
		that.setItem = function(p, h){
			var o = that.getItem(p);
			if (o){
				o.innerHTML = h;
				that.update();
			}
		}
		
		// Add one slide: position, HTML
		that.addItem = function(p, h){
			if (typeof h === 'undefined') h = '';
			var d = document.createElement('div');
			d.className="swipin-item";
			d.innerHTML = h;
			if(p>sliderLength) _obj.appendChild(d);
			else {
				var dd = that.getItem(p);
				_obj.insertBefore(d, dd);
			}
			if(pos+1>=p) pos++;
			if(_pos+1>=p) _pos++;
			that.update();
		}
		
		// remove slide N
		that.removeItem = function(p){
			var o = that.getItem(p);
			o.remove();
			if(pos+1>=p) pos--;
			if(_pos+1>=p) _pos--;
			that.update();
		}
		
		// "semiprivate" visibility change handler
		that._visibility = function(tf){
			if (tf !== visible) {
				visible = tf;
				if(!tf){
					if (auto>0) moOver();
				} else {
					if (auto>0) moOut();
					preload();
				}
				obj.dispatchEvent(e_v);
			}
		}
		
		// Touch object setup
		if (touch) touch_obj = new SWIPIN_TOUCH(obj,function(g){
			if (g==='next') that.next();
			else if (g==='prev') that.prev();
		});
		
		// final init
		init();
		
	}

	// CustomEvent support
	if (typeof window.CustomEvent !== "function" ) {
		var CustomEve = function( event, params ) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent( 'CustomEvent' );
			evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
			return evt;
		}
		CustomEve.prototype = window.Event.prototype;
		window.CustomEvent = CustomEve;
	}	

	// Main touch management class
	var SWIPIN_TOUCH = function(obj,cabe) {
		var self=this,sx,sy,app=0,evt='';
		var supp=("ontouchstart" in document.documentElement);
		if(supp)if(navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) app=1;
		if(supp)obj.addEventListener('touchstart', function(e){self.tstart(e)}, {passive: true});

		this.tstart=function(e){
		  sx=e.touches[0].pageX;sy=e.touches[0].pageY;
		  evt='';
		  obj.addEventListener('touchmove', function(e){self.tmove(e)}, false);
		  obj.addEventListener('touchend', function(e){self.tend(e)}, false);
		}
		this.tmove=function(e){
		  if(evt=='scroll')return;
		  if(e.touches.length>1||e.scale&&e.scale!=1)return;
		  var dx=e.touches[0].pageX - sx,dy=e.touches[0].pageY - sy;
		  if (evt=='')if(Math.abs(dx)<Math.abs(dy))evt='scroll';
		  if (evt!='scroll') {
			e.preventDefault();
			if(evt!='swipe'){
				if(Math.abs(dx)>30){
					evt='swipe';
					if(dx>0)cabe('prev');
					else cabe('next');
				}	
			}
		  }
		}
		this.tend=function(e){
		  evt='';
		  obj.removeEventListener('touchmove', function(e){self.tmove(e)}, false);
		  obj.removeEventListener('touchend', function(e){self.tend(e)}, false);
		}
	}
	
	// Observer setup
	var observer = false;
	if ('IntersectionObserver' in window) {	
		var observerOptions = {
				root: null,
				rootMargin: "0px",
				threshold: [0.1]
			};
		var observerCallback = function(entries){
			entries.forEach(function(entry) {
				var ob = false;
				if (entry.target.classList.contains('swipin')){
					if(entry.target.swipin) ob = entry.target.swipin;
				}
				if (ob) {
					if(entry.intersectionRatio>=.1) ob._visibility(true);
					else ob._visibility(false);
				}
			});
		}
		observer = new IntersectionObserver(observerCallback, observerOptions);
	}
	
	// Element.remove support
	if (!('remove' in Element.prototype)) {
		Element.prototype.remove = function() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		};
	}
	
	// Global method to search and activate all the sliders of the page
	window.swipinUpdate = function(){
		var sli = document.getElementsByClassName('swipin');
		for (var i=0; i < sli.length; i++){
			if ('undefined' === typeof sli[i].swipin) {
				var id = sli[i].getAttribute('id');
				if(!id) {
					id = 'swipin_'+i;
					sli[i].setAttribute('id', id);
				}
				sli[i].swipin = new SWIPIN(id);
			}
		}
	}

	// Global slider activation
	window.swipinUpdate();
	
})();