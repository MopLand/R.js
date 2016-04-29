/*!
*	(C)2016 VeryIDE
*	http://www.veryide.com/
*	ray.js 核心框架
*	$Id: ray.js 2016/04/28 Lay $
*/

(function( win, doc ){

	//实例化选择器
	var R = function ( selector, context ){
		return new R.init( selector, context );
	}

	//R版本号
	R.version = 0.1;

	//最后更新时间
	R.build = 20160428;

	//当前 Unix 时间戳
	R.timestamp = new Date().getTime();

	//浏览器
	R.Browser = {
		msie : false,
		opera : false,
		safari : false,
		chrome : false,
		firefox : false
	};

	//浏览器版本
	var nav = navigator;
	var uat = nav.userAgent;
	var reg = '';

	switch ( nav.appName ){

		case "Microsoft Internet Explorer":{
			R.Browser.name = "ie";
			R.Browser.msie = true;
			reg = /^.+MSIE (\d+\.\d+);.+$/;
		break;

		}default:{
			if ( uat.indexOf("Chrome") != -1 ){
				R.Browser.name = "chrome";
				R.Browser.chrome=true;
				reg = /^.+Chrome\/([\d.]+?)([\s].*)$/ig;

			}else if ( uat.indexOf("Safari") != -1 ){
				R.Browser.name = "safari";
				R.Browser.safari=true;
				reg = /^.+Version\/([\d\.]+?) (Mobile.)?Safari.+$/;

			}else if ( uat.indexOf("Opera") != -1 ){
				R.Browser.name = "opera";
				R.Browser.opera=true;
				reg = /^.{0,}Opera\/(.+?) \(.+$/;

			}else{
				R.Browser.name = "firefox";
				R.Browser.firefox=true;
				reg = /^.+Firefox\/([\d\.]+).{0,}$/;

			}
		}
		break;
	}

	//客户端版本
	R.Browser.version = uat.replace(reg, "$1");

	//客户端语言
	R.Browser.lang = ( !R.Browser.msie ? nav.language : nav.browserLanguage ).toLowerCase();

	//是否为移动设备
	R.Browser.mobile = /(iPhone|iPad|iPod|Android)/i.test( uat );

	///////////////////////

	//扩展 outerHTML 方法
	if(typeof HTMLElement !== "undefined" && !("outerHTML" in HTMLElement.prototype)) {
		HTMLElement.prototype.__defineGetter__("outerHTML",function(){
			var a=this.attributes, str="<"+this.tagName, i=0;for(;i<a.length;i++)
			if(a[i].specified)
				str+=" "+a[i].name+'="'+a[i].value+'"';
			if(!this.canHaveChildren)
				return str+" />";
			return str+">"+this.innerHTML+"</"+this.tagName+">";
		});
		HTMLElement.prototype.__defineSetter__("outerHTML",function(s){
			var r = this.ownerDocument.createRange();
			r.setStartBefore(this);
			var df = r.createContextualFragment(s);
			this.parentNode.replaceChild(df, this);
			return s;
		});
		HTMLElement.prototype.__defineGetter__("canHaveChildren",function(){
			return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
		});
	}

	//修正Node的DOM
	if(window.Node){

		//替换指定节点
		Node.prototype.replaceNode = function(Node){
			this.parentNode.replaceChild( Node, this );
		}

		//删除指定节点
		Node.prototype.removeNode = function(Children){
			if( Children )
				return this.parentNode.removeChild(this);
			else{
				var range=document.createRange();
				range.selectNodeContents(this);
				return this.parentNode.replaceChild(range.extractContents(),this);
			}
		}

		//交换节点
		Node.prototype.swapNode = function(Node){
			var base            = this.parentNode;
			var next            = this.nextSibling;
			var replaced        = Node.parentNode.replaceChild( this, Node );

			//向后移动
			if( replaced == next ){
				base.insertBefore( next, this );

			//向前移动
			}else if( next ){
				base.insertBefore( replaced, next );

			//最后一个向前移动
			}else{
				base.appendChild( replaced );
			}

			return this;
		}

	}

	///////////////////////

	//获取ID对象
	R.$ = function(id){
		return document.getElementById(id);
	};

	/*
		页面完全载入后执行
		func	函数块
	*/
	R.reader = function( func ){
		R( window ).bind( 'load' , function(){ func( new Date().getTime() - R.time ); } );
	};

	/*
		页面改变后执行
		func	函数块
	*/
	R.resize = function( func ){
		R( window ).bind( 'resize' , func );
	}

	///////////////////////

	/**
	 * @author 	Maxime Haineault (max@centdessin.com)
	 * @version	0.3
	 * @desc 	JavaScript cookie manipulation class
	 */
	R.Cookie = {

		/** Get a cookie's value
		 *
		 *  @param integer	key		The token used to create the cookie
		 *  @return void
		 */
		get: function(key) {
			// Still not sure that "[a-zA-Z0-9.()=|%/]+($|;)" match *all* allowed characters in cookies
			var tmp =  document.cookie.match((new RegExp(key +'=[a-zA-Z0-9.()=|%/]+($|;)','g')));
			if(!tmp || !tmp[0]) return null;
			else return unescape(tmp[0].substring(key.length+1,tmp[0].length).replace(';','')) || null;

		},

		/** Set a cookie
		 *
		 *  @param integer	key		The token that will be used to retrieve the cookie
		 *  @param string	value	The string to be stored
		 *  @param integer	ttl		Time To Live (hours)
		 *  @param string	path	Path in which the cookie is effective, default is "/" (optional)
		 *  @param string	domain	Domain where the cookie is effective, default is window.location.hostname (optional)
		 *  @param boolean 	secure	Use SSL or not, default false (optional)
		 *
		 *  @return setted cookie
		 */
		set: function(key, value, ttl, path, domain, secure) {
			var cookie = [key+'='+    escape(value),
					  'path='+    ((!path   || path=='')  ? '/' : path),
					  'domain='+  ((!domain || domain=='')?  window.location.hostname : domain)];
			if (ttl)         cookie.push(R.Cookie.hoursToExpireDate(ttl));
			if (secure)      cookie.push('secure');
			return document.cookie = cookie.join('; ');
		},

		/** Unset a cookie
		 *
		 *  @param integer	key		The token that will be used to retrieve the cookie
		 *  @param string	path	Path used to create the cookie (optional)
		 *  @param string	domain	Domain used to create the cookie, default is null (optional)
		 *  @return void
		 */
		unset: function(key, path, domain) {
			path   = (!path   || typeof path   != 'string') ? '' : path;
			domain = (!domain || typeof domain != 'string') ? '' : domain;
			if (R.Cookie.get(key)) R.Cookie.set(key, '', 'Thu, 01-Jan-70 00:00:01 GMT', path, domain);
		},

		/** Return GTM date string of "now" + time to live
		 *
		 *  @param integer	ttl		Time To Live (hours)
		 *  @return string
		 */
		hoursToExpireDate: function(ttl) {
			if (parseInt(ttl) == 'NaN' ) return '';
			else {
				var now = new Date();
				now.setTime(now.getTime() + (parseInt(ttl) * 60 * 60 * 1000));
				return now.toGMTString();
			}
		},

		/** If Firebug JavaScript console is present, it will dump cookie string to console.
		 *
		 *  @return void
		 */
		dump: function() {
			if (typeof console != 'undefined') {
				console.log(document.cookie.split(';'));
			}
		},

		//删除所有 cookies
		clear : function (){
			var keys=document.cookie.match(/[^ =;]+(?=\=)/g);
			if (keys) {
				for (var i = keys.length; i--;){
					//document.cookie = keys[i]+'=0;expires=' + new Date(0).toUTCString();
					R.Cookie.unset( keys[i] );
				}
			}
		}

	}

	///////////////////////

	// Simple JavaScript Templating
	// John Resig - http://ejohn.org/ - MIT Licensed
	/*
		模板解析
		ele		模板对象（element）
		data	数据对象
	*/
	R.Template = function( ele, data ){

		//缓存池
		R.Template.cache =  R.Template.cache || {};

		var tmpl = function(ele, data){
			try {
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(ele) ? R.Template.cache[ele] = R.Template.cache[ele] || tmpl(document.getElementById(ele).innerHTML) :

				  // Generate a reusable function that will serve as a template
				  // generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					ele.replace(/[\r\t\n]/g, " ")
						.replace(/'(?=[^%]*%>)/g,"\t")
						.split("'").join("\\'")
						.split("\t").join("'")
						.replace(/<%=(.+?)%>/g, "',$1,'")
						.split("<%").join("');")
						.split("%>").join("p.push('")
						+ "');}return p.join('');");

				// Provide some basic currying to the user
				return data ? fn( data ) : fn;

			} catch (e) {
				//err = e.message;
				console.log( e.message );
			}
	  };

	  return tmpl( ele, data );

	};

	/*
		获取当前视口信息
	*/
	R.getViewportSize = function () {
		var value = {width:0, height:0};
		undefined !== window.innerWidth ? value = {width:window.innerWidth, height:window.innerHeight} : value = {width:document.documentElement.clientWidth, height:document.documentElement.clientHeight};
		return value;
	};

	/*
		获取元素在视口内的位置信息
		f	目标元素
	*/
	R.getClinetRect = function (f) {
		var d = f.getBoundingClientRect(), e = (e = {left:d.left, right:d.right, top:d.top, bottom:d.bottom, height:(d.height || (d.bottom - d.top)), width:(d.width || (d.right - d.left))});
		return e;
	};

	/*
		获取当前滚动条信息
	*/
	R.getScrollPosition = function () {
		var position = {left:0, top:0};
		if (window.pageYOffset) {
			position = {left:window.pageXOffset, top:window.pageYOffset};
		}
		else if (typeof document.documentElement.scrollTop != 'undefined' && document.documentElement.scrollTop > 0) {
			position = {left:document.documentElement.scrollLeft, top:document.documentElement.scrollTop};
		} else if (typeof document.body.scrollTop != 'undefined') {
			position = {left:document.body.scrollLeft, top:document.body.scrollTop};
		}
		return position;
	};

	///////////////////////

	R.Array = function( source ){

		//内部类
		var inti = function( source ){
			this.self = source;
			return this;
		}

		//扩展方法
		inti.prototype = {

			//返回源
			output : function(){
				return this.self;
			},

			slice:([]).slice,

			//返回第一个元素
			first : function () {
				return this.self[0];
			},

			//返回最后一个元素
			last : function () {
				return this.self[this.self.length - 1];
			},

			//返回最大的一个元素
			max : function () {
				return Math.max.apply(null, this.self);
			},

			//返回最小的一个元素
			min : function () {
				return Math.min.apply(null, this.self);
			},

			//数组求和
			sum : function () {
				for( var i=0, sum=0; i<this.self.length; sum += isNaN( parseInt(this.self[i]) ) ? 0 : parseInt(this.self[i]), i++ );
				return sum;
			},

			//清空数组
			clear :function(){
				this.self = [];
				return this;
			},

			/*
				检查在数组内是否存在某值
				value	要查找的值
			*/
			indexOf : function( value ) {
				var l = this.self.length;
				for(var i=0; i<=l; i++) {
					if( this.self[i]== value ) return i;
				}
				return -1;
			}

		}

		//实例化类
		return new inti(source);

	}

	///////////////////////

	R.String = function( source ){

		//内部类
		var inti = function( source ){
			this.self = String( source || '' );
			return this;
		}

		//扩展方法
		inti.prototype = {

			//返回源
			output : function(){
				return this.self;
			},

			//字符串填充
			pad : function(l, s, t){
				var str = this.self.toString();
				return s || (s = " "), (l -= str.length) > 0 ? (s = new Array(Math.ceil(l / s.length)
					+ 1).join(s)).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2))
					+ str + s.substr(0, l - t) : str;
			},

			//返回字符串长度
			length : function(){
				return String( this.self ).replace(/[^\x00-\xff]/g, "ci").length;
			},

			//去掉左右空白字符
			trim : function(){
				this.self = this.self.replace(/(^\s*)|(\s*$)/g, "");
				return this;
			},

			//去掉左边空白字符
			leftTrim : function(){
				this.self = this.self.replace(/(^\s*)/g, "");
				return this;
			},

			//去掉右边空白字符
			rightTrim : function(){
				this.self = this.self.replace(/(\s*$)/g, "");
				return this;
			},

			//过滤JS
			stripScript : function() {
				this.self = this.self.replace(/<script.*?>.*?<\/script>/ig, '');
				return this;
			},

			/*
				移除 HTML 标签
				allowed		允许的标签
			*/
			stripTags : function( allowed ) {

			  // http://kevin.vanzonneveld.net
			  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			  // +   improved by: Luke Godfrey
			  // +      input by: Pul
			  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			  // +   bugfixed by: Onno Marsman
			  // +      input by: Alex
			  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			  // +      input by: Marc Palau
			  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			  // +      input by: Brett Zamir (http://brett-zamir.me)
			  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			  // +   bugfixed by: Eric Nagel
			  // +      input by: Bobby Drake
			  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			  // +   bugfixed by: Tomasz Wesolowski
			  // +      input by: Evertjan Garretsen
			  // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
			  // *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
			  // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
			  // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
			  // *     returns 2: '<p>Kevin van Zonneveld</p>'
			  // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
			  // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
			  // *     example 4: strip_tags('1 < 5 5 > 1');
			  // *     returns 4: '1 < 5 5 > 1'
			  // *     example 5: strip_tags('1 <br/> 1');
			  // *     returns 5: '1  1'
			  // *     example 6: strip_tags('1 <br/> 1', '<br>');
			  // *     returns 6: '1  1'
			  // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
			  // *     returns 7: '1 <br/> 1'
			  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
			  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
			  this.self = this.self.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) { return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''; });
			  return this;
			},

			//过滤标签
			stripTags : function() {
				this.self = String( this.self ).replace(/<[^>]+>/g, "");
				return this;
			},

			//ASCII -> Unicode转换
			unicode : function(){

				if( this.self ){
					var result = '';
					for (var i=0; i<this.self.length; i++){
						result += '&#' + this.self.charCodeAt(i) + ';';
					}
					this.self = result;
				}

				return this;
			},

			//Unicode -> ASCII转换
			ascii : function() {

				if( this.self ){
					var code = this.self.match(/&#(\d+);/g);
					if( code != null ){
						var result = '';
						for (var i=0; i<code.length; i++){
							result += String.fromCharCode(code[i].replace(/[&#;]/g, ''));
						}
						this.self = result;
					}
				}

				return this;
			},

			//格式化字符串
			format : function (){
				var param = [];
				for (var i = 0, l = arguments.length; i < l; i++){
					param.push(arguments[i]);
				}

				this.self = this.self.replace(/\{(\d+)\}/g, function(m, n){
					return param[n];
				});

				return this;
			},

			/*
				返回解码后的字符串
				string		源字符串
			*/
			encodeHTML : function(){
				return this.self.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
			},

			/*
				返回编码码后的字符串
				string		源字符串
			*/
			decodeHTML : function(){
				var b = this.self.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
				return b.replace(/&#([\d]+);/g, function(d, c) {
					return String.fromCharCode(parseInt(c, 10))
				});
			},

			/*
				编码特殊符号
			*/
			escapeSymbol : function(){
				return String( this.self ).replace(/\%/g, "%25").replace(/&/g, "%26").replace(/\+/g, "%2B").replace(/\ /g, "%20").replace(/\//g, "%2F").replace(/\#/g, "%23").replace(/\=/g, "%3D");
			},

			/*
				将 CSS 样式属性名转为 JS 形式
				例如：z-index 转换为 zIndex
			*/
			toCamelCase : function(){
				var a = this.self;
				if (a.indexOf("-") < 0 && a.indexOf("_") < 0) {
					return a
				}
				return a.replace(/[-_][^-_]/g, function(b) {
					return b.charAt(1).toUpperCase()
				});
			},

			/*
				将字符串转为对象
			*/
			eval : function(){
				return (new Function( 'return (' + this.self.replace(/\r/gm,'').replace(/\n/gm,'\\n') + ');'))();
			},

			/*
				获取URL参数
				key	参数名称
				url		URL链接，默认为当前URL
			*/
			get : function( key, url ){

				var url = url ? url : location.href;
				var v = '';
				var o = url.indexOf( key + "=" );
				if (o != -1){
					o += key.length + 1 ;
					e = url.indexOf("&", o);
					if (e == -1){
						e = url.length;
					}
					//v = decodeURIComponent(url.substring(o, e));
					v = url.substring(o, e);
				}

				return v;
			},

			/*
				获取随机字符
				length	长度
			*/
			random : function( length, prefix ){
				return ( prefix || '' ) + Math.random().toString(16).substring(2);
			}

		}

		//实例化类
		return new inti(source);
	}

	///////////////////////

	R.Number = function( source ){

		//内部类
		var inti = function( source ){
			this.self = String( source || '' );
			return this;
		}

		//扩展方法
		inti.prototype = {

			/*
				逗号分隔数字串
			*/
			comma : function( d ){
				var c = this.self;
				if (!d || d < 1) {
					d = 3;
				}
				c = String(c).split(".");
				c[0] = c[0].replace(new RegExp("(\\d)(?=(\\d{" + d + "})+$)", "ig"), "$1,");
				return c.join(".");
			},

			/* 检查是否全为数字 */
			isNumber : function(num){
				return /^[0-9]{1,20}$/.exec(num);
			},

			/*
				返回两个数值之间的一个随机值
				min	最小值
				max	最大值
			*/
			between : function( min, max ){
				return Math.round(min+(Math.random()*(max-min)));
			}

		}

		//实例化类
		return new inti(source);
	}

	///////////////////////

	R.Datetime = function( date ){

		//内部类
		var inti = function( date ){
			this.self = ( R.Validate.Number(date) ? new Date(parseInt(date) * 1000) : date ) || new Date();
			return this;
		}

		//扩展方法
		inti.prototype = {

			//判断是否是闰年,返回 true 或者 false
			leapyear : function(){
				var year = this.self.getFullYear();
				return ( 0 == year % 4 && ((year % 100 != 0)||(year % 400 == 0)));
			},

			//返回该月天数
			days : function(){
				return (new Date(this.self.getFullYear(),this.self.getRnth()+1,0)).getDate();
			},

			//获取现在的 Unix 时间戳 (Unix timestamp)
			time : function(){
				return Math.round( this.self.getTime()/1000 );
			},

			/*
				格式化日期
				format		格式字符串
			*/
			format : function( format ){
				var str = format;
				var now = this.self;
				var y = now.getFullYear(),
						m = now.getRnth()+1,
						d = now.getDate(),
						h = now.getHours(),
						i = now.getMinutes(),
						s = now.getSeconds();

				str = str.replace('yy',y.toString().substr(y.toString().length-2));
				str = str.replace('y',y);
				str = str.replace('mm',('0'+m).substr(m.toString().length-1));
				str = str.replace('m',m);
				str = str.replace('dd',('0'+d).substr(d.toString().length-1));
				str = str.replace('d',d);
				str = str.replace('hh',('0'+h).substr(h.toString().length-1));
				str = str.replace('h',h);
				str = str.replace('ii',('0'+i).substr(i.toString().length-1));
				str = str.replace('i',i);
				str = str.replace('ss',('0'+s).substr(s.toString().length-1));
				str = str.replace('s',s);

				return str;
			},

			/*
				倒计时
				expire		过期时间,Unix 时间戳（秒）
				func		回调函数
			*/
			diff : function( expire, func ){

				//空函数
				if( typeof func != 'function' ) var func = function(){};

				//过期时间
				if( !expire ){
					return false;
				}

				//转换成微秒
				var expire = Math.round( parseInt(expire) * 1000 );

				window.setInterval(function(){

					//已过期
					if( new Date().getTime() > expire ){
						//回调
						func( -1, { "d":0, "h":0, "m":0, "s":0 } );

					}else{

						var DifferenceHour = -1;
						var DifferenceMinute = -1;
						var DifferenceSecond = -1;
						var daysms = 24 * 60 * 60 * 1000;
						var hoursms = 60 * 60 * 1000;
						var Secondms = 60 * 1000;
						var microsecond = 1000;
						var time = new Date();
						var convertHour = DifferenceHour;
						var convertMinute = DifferenceMinute;
						var convertSecond = DifferenceSecond;
						var Result = Diffms = asd - time.getTime();
						DifferenceHour = Math.floor(Diffms / daysms);
						Diffms -= DifferenceHour * daysms;
						DifferenceMinute = Math.floor(Diffms / hoursms);
						Diffms -= DifferenceMinute * hoursms;
						DifferenceSecond = Math.floor(Diffms / Secondms);
						Diffms -= DifferenceSecond * Secondms;
						var dSecs = Math.floor(Diffms / microsecond);

						if(convertHour != DifferenceHour){
							var a = DifferenceHour;
						}

						if(convertMinute != DifferenceMinute){
							var b = DifferenceMinute;
						}

						if(convertSecond != DifferenceSecond){
							var c = DifferenceSecond;
							var d = dSecs;
						}

						/*
							回调函数
							Result	相差秒数
							date	[json]
									a	天
									b	小时
									c	分钟
									d	秒
						*/
						func( parseInt( Result / 1000 ) , { "day":a, "hour":b, "minute":c, "second":d } );
					}

				},1000);

			}

		}

		//实例化类
		return new inti(date);

	}

	///////////////////////

	R.Event = function( event ){

		//内部类
		var inti = function( event ){
			this.self = event || window.event;
			return this;
		}

		//扩展方法
		inti.prototype = {

			/*
				停止事件冒泡和浏览器默认行为
				type	默认停止冒泡和默认行为
						1	仅停止冒泡
						2	仅停止行为
			*/
			stop : function( type ){
				if( !this.self ) return;

				if ( R.Browser.msie ) {

					//停止冒泡
					type !== 2 && ( window.event.cancelBubble = true );

					//阻止浏览器默认动作
					type !== 1 && ( window.event.returnValue = false );

				} else {

					//停止冒泡
					type !== 2 && this.self.stopPropagation();

					//阻止浏览器默认动作(W3C)
					type !== 1 && this.self.preventDefault();

				}

				//return false;
				return this;
			},

			/* 发生事件的节点 */
			element : function() {
				if( !this.self ) return;
				if ( R.Browser.msie ) {
					return window.event.srcElement;
				}else{
					return this.self.currentTarget;
				}
			},

			/* 发生当前在处理的事件的节点 */
			target : function() {
				if( !this.self ) return;

				if ( R.Browser.msie ) {
					return window.event.srcElement;
				}else{
					return this.self.target;
				}
			},

			/* 获取当前鼠标光标所在位置 */
			mouse : function(){
				if( !this.self ) return;

				if ( R.Browser.msie ) {
					var x = this.self.x + document.body.scrollLeft;
					var y = this.self.y + document.body.scrollTop;
				}else{
					var x = this.self.pageX;
					var y = this.self.pageY;
				}
				return { "x":x, "y":y };
			},

			/* 响应键盘事件 */
			keyboard : function( code, func ){
				if( !this.self ) return;

				//对比按键码
				if( ( code>-1 && this.self.keyCode == code ) || code == -1 ){

					//回调
					func( this.self, this.self.keyCode );

				}

			}

		}

		//实例化类
		return new inti(event);

	}

	///////////////////////

	R.Validate = {

		/*
			获取对象类型
			o	目标对象
		*/
		is : function (o) {
			return ({}).toString.call(o).slice(8, -1);
		},

		//判断对象是否是数组
		Array : function(obj){
			return Object.prototype.toString.apply(obj) === '[object Array]';
		},

		//判断对象是否是函数
		Function : function(obj){
			return Object.prototype.toString.apply(obj) === '[object Function]';
		},

		//判断对象是否是对象
		Object : function(obj){
			return Object.prototype.toString.apply(obj) === '[object Object]';
		},

		//日期
		Date : function(o){
			//验证字符串
			if( typeof o == 'string' ){
				 return o.match(/^(\d{4})(\-)(\d{1,2})(\-)(\d{1,2})(\s{1})(\d{1,2})(\:)(\d{1,2})/) != null || o.match(/^(\d{4})(\-)(\d{1,2})(\-)(\d{1,2})/) != null;
			}else{
				//验证对象
				return Object.prototype.toString.apply(o) === '[object Date]';
			}
		},

		//数值
		Number : function(o) {
			return !isNaN( parseFloat( o ) ) && isFinite(o);
		},

		//字符串
		String : function(o){
			return typeof o === 'string';
		},

		//未定义
		Defined : function(o){
			return typeof o != 'undefined';
		},

		//对象是否为空
		Empty : function(o){
			return typeof o == 'undefined' || o == '';
		},

		//布尔
		Boolean : function(o){
			return typeof o === 'boolean';
		},

		//是否为Window对象
		Window : function(o){
			return /\[object Window\]/.test( o );
		},

		//是否为HTML根
		Document : function(o){
			return /\[object HTMLDocument\]/.test( o );
		},

		//是否为HTML元素
		Element : function(o){
			return o.tagName ? true : false;
		},

		/****************************/

		/*
			检查是否包含中文
			str		字符串
			all		全部由中文构成
		*/
		Chinese : function( str , all ) {

			if( all ){

				//测试是否为双字节字符
				return ( str.length*2 == str.replace(/[^\x00-\xff]/g,"**").length );

			}else{

				//测试是否为双字节字符
				return (str.length != str.replace(/[^\x00-\xff]/g,"**").length);

			}

		},

		//检查是否含有特殊字符
		Safe : function(str){
			var chkstr;
			var i;
			chkstr="'*%@#^$`~!^&*()=+{}\\|{}[];:/?<>,.";
			for (i=0;i<str.length;i++){
				if (chkstr.indexOf(str.charAt(i))!=-1) return false;
			}
			return true;
		},

		//检查是否为电子邮件地址
		Email : function(str){
			return /^\s*([A-Za-z0-9_-]+(\.\w+)*@(\w+\.)+\w{2,3})\s*$/.test(str);
		},

		//检查是否为URL地址
		URL : function(str){
			return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\:+!]*([^<>])*$/.test(str);
		},

		//检查是否为合法IP
		IP : function(str){
			return /^[0-9.]{1,20}$/.test(str);
		},

		//检查是否为合法密码
		Password : function(str){
			return /^(\w){6,20}$/.test(str);
		},

		//检查是否为颜色值
		Color : function(str){
			return /^#(\w){6}$/.test(str);
		},

		/****************************/

		/* 校验身份证（18位数字） */
		ID : function(str){
			if(str.length==18){
				return R.Validate.Number(str.substring(0,17));
			}else{
				return false;
			}
		},

		//校验普通电话、传真号码：可以“+”开头，除数字外，可含有“-”
		Phone : function(str){
			return /(?:^0{0,1}1\d{10}$)|(?:^[+](\d){1,3}1\d{10}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}$)|(?:^\d{7,8}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}[\-#]{1}\d{1,5}$)/.test(str);
		},

		//校验手机号码：必须以数字开头，除数字外，可含有“-”
		Mobile : function(str){
			return /^[1][0-9]{10}$/.test(str);
		}

	}

	///////////////////////

	/*
		序列化表单
		form		表单对象
		func		是否将值编码，传入编码函数，默认使用 encodeURIComponent
		link		是否将结果转换为 URL 字符串，请使用 &
		prefix		键前辍，适用于 Ajax，请使用 &
	*/
	R.Serialize = function( form, func, link, prefix ){

		//空函数
		if( typeof func != 'function' ){
			var func = function( str ){ return str ? encodeURIComponent( str ) : ''; };
		}

		var pix = prefix ? prefix : '';

		///////////////////////

		//临时数组
		var data = {};

		/*遍历表单元素*/
		var len = form.elements.length;
		for (var i=0; i<len; i++){

			var ele	= form.elements[i];
			var key	= func(ele.name);
			var val	= ele.value;

			/*忽略没有名字元素*/
			if ( !key ) continue;

			var key = i == 0 ? key : pix + key;

			/*处理其它元素*/
			switch( ele.type ){

				case "select-one":
					var opt = ele[ele.selectedIndex];
					data[key] = func( opt.attributes && opt.attributes.value && !(opt.attributes.value.specified) ? opt.text : opt.value );
				break;

				case "select-multiple":
					for (var x = 0; x < ele.length; x++) {
						if( ele[x].selected ){
							data[key] = func(ele[x].value);
						}
					}
				break;

				case "radio":
					if( ele.checked ){
						data[key] = func(ele.value);
					}
				break;

				case "checkbox":
					if( ele.checked ){
						data[key] = func(ele.value);
					}
				break;

				default:
					data[key] = func(val);
				break;
			}

		}

		///////////////////////

		//转换成 URL 请求字符串
		if( link ){
			var str = '';
			//拼接url
			for ( var key in data ) {
				str += link + key +'=' + ( data[key] || '' );
			}
			data = str;
		}

		return data;
	}

	/*
	  表单遍历检查（那些具有自定义属性的元素）
	  示例:
	  onsubmit="return R.ValidForm(this,function(i){alert(i);});"
	  onsubmit="return R.ValidForm(this,null);"

	  form		表单对象
	  func		回调函数,返回错误信息(string)
	  desc		元素描述文本样式
	*/

	R.ValidForm = function( form , func ){

		//空函数
		if( typeof func != 'function' ) var func = function( err ){ alert(err);};

		//表单元素数量
		var len = form.elements.length;

		for ( var i=0; i<len; i++ ){

			//当前元素
			var ele		= form.elements[i];

			//自定义名称
			var _name	= ele.getAttribute("data-valid-name");

			//描述信息
			var _desc	= ele.getAttribute("placeholder");

			//清空描述信息
			if( _desc && ele.value == _desc ) ele.value = '';

			/* 非自定义属性的元素不予理睬 */
			if ( !_name ) continue;

			/* 已禁用的元素不予理睬 */
			if ( ele.disabled === true ) continue;

			/* 校验当前元素 */
			if ( R.ValidForm.Element( ele, func ) === false ){
				return false;
			}
		}

		return true;
	}

	/*
	  检查表单元素【此函数配合 R.ValidForm 而使用】

	  /////////////////////////////////

	  ele		表单元素
	  func	回调函数

	  /////////////////////////////////

	  元素支持以下自定义属性：

	  data-valid-name			元素别名  		    *不为空时才校验其值*

	  注意：以下属性值取值范围
	  "no" 不强制(值可为空,不为空时检查)
	  "yes" 为强制检查

	  data-valid-empty	    	为空检查
	  data-valid-number	  	数字类检查
	  data-valid-password  	密码类型属性，会自动启用 data-valid-secure 属性
	  data-valid-ip		   		 IP地址型属性
	  data-valid-url		  		URL地址验证
	  data-valid-idcard		  		身份证号属性
	  data-valid-email		  	邮箱地址验证
	  data-valid-phone		    电话号码属性
	  data-valid-mobile	  		手机号码属性
	  data-valid-datetime	 	  	时间日期属性
	  data-valid-regexp	 	  	正则表达式
	  data-valid-minsize	  	字符最小长度
	  data-valid-maxsize	  	字符最大长度
	  data-valid-accept			文件上传扩展名
	  data-valid-confirm		对比两值是否相同

	  /////////////////////////////////

	  返回值：
	  true		无错误
	  false	有错误，同时调用 func

	*/

	R.ValidForm.Element = function( ele , func ){

		//自定名称
		var title	 = ele.getAttribute("data-valid-name");

		//值
		var val		= ele.value;

		//元素类型
		var type	= ele.type;

		//元素ID
		var id		= ele.id;

		//元素名称
		var name	= ele.name;

		//错误消息
		var err		= '';

		/////////////////////////

		//不同类型不同处理
		if( R.Array( ['text','textarea','password','hidden','file'] ).indexOf( type ) > -1 ){

			/* 值为空测试 */
			var emp		= R.Validate.Empty( R.String( val ).trim().output() );

			/* 内容长度 */
			var size	= R.String( val ).length();

			/* 非空校验 */
			var chknull = ele.getAttribute("data-valid-empty");
			if ( chknull == "yes" && emp ){
				err = title + " 不能为空! ";
			}

			/* 密码校验 */
			if( type == "password" ){

				var chkpwd = ele.getAttribute("data-valid-password");

				if ( chkpwd && R(chkpwd).size() && R(chkpwd).value() != val ){
					err = title + " 输入有误! ";
				};

				//这里有问题
				ele.setAttribute("data-valid-empty","yes");

			}

			/* 相同性校验 */
			var chkvalue = ele.getAttribute("data-valid-confirm");
			if ( chkvalue && R(chkvalue).value() != val ){
				err = title + " 输入有误! ";
			}

			/* 扩展名检查 */
			var chkexte = ele.getAttribute("data-valid-accept");
			var chkexte = chkexte ? chkexte.replace(/[,|，]/ig," ") : '';
			if ( chknull == "yes" && chkexte && R.Array( chkexte.split(" ") ).indexOf( ele.value.replace(/.*\./,"").toLowerCase() ) == -1 ){
				err = title + " 不支持此类型文件! ";
			}

			/* 最小长度 */
			var minsize = ele.getAttribute("data-valid-minsize");
			if ( size < parseInt(minsize) ){
				err = title + " 未到最小长度："+minsize;
			}

			/* 最大长度 */
			var maxsize = ele.getAttribute("data-valid-maxsize");
			if ( size > parseInt(maxsize) ){
				err = title + " 超出最大长度："+maxsize;
			}

			/*字符安全性检测*/
			var chksafe = ele.getAttribute("data-valid-secure");
			if ( (chksafe == "yes" && !R.Validate.Safe(val)) || (chksafe=="no" && !emp && !R.Validate.Safe(val)) ){
				err = title + " 存在非法字符! ";
			}

			/* E-mail地址合法性检测 */
			var chkemail = ele.getAttribute("data-valid-email");
			if ( (chkemail == "yes" && !R.Validate.Email(val)) || (chkemail=="no" && !emp && !R.Validate.Email(val)) ){
				err = title + " 应为电子邮件地址! ";
			}

			/* IP地址合法性检测 */
			var chkip = ele.getAttribute("data-valid-ip");
			if ( (chkip == "yes" && !R.Validate.IP(val)) || (chkip=="no" && !emp && !R.Validate.IP(val)) ){
				err = title + " 应为IP地址! ";
			}

			/* URL地址合法性检测 */
			var chkurl = ele.getAttribute("data-valid-url");
			if ( (chkurl== "yes" && !R.Validate.URL(val)) || (chkurl=="no" && !emp && !R.Validate.URL(val)) ){
				err = title + " 应为URL地址! ";
			}

			/* 数据类型校验 */
			var chknum = ele.getAttribute("data-valid-number");
			if ( (chknum == "yes" && !R.Validate.Number(val)) || (chknum=="no" && !emp && !R.Validate.Number(val)) ){
				err = title + " 应为数字! ";
			}

			/* 身份证号校验 */
			var chkid = ele.getAttribute("data-valid-idcard");
			if ( (chkid== "yes" && !R.Validate.ID(val)) || (chkid=="no" && !emp && !R.Validate.ID(val)) ){
				err = title + " 应为身份证号码! ";
			}

			/* 电话号码校验 */
			var chkTel = ele.getAttribute("data-valid-phone");
			if ( (chkTel == "yes" && !R.Validate.Phone(val)) || (chkTel=="no" && !emp && !R.Validate.Phone(val)) ){
				err = title + " 应为电话号码! ";
			}

			/* 手机号码校验 */
			var chkMobile = ele.getAttribute("data-valid-mobile");
			if ( (chkMobile == "yes" && !R.Validate.Mobile(val)) || (chkMobile=="no" && !emp && !R.Validate.Mobile(val)) ){
				err = title + " 应为手机号码! ";
			}

			/* 时间日期校验 */
			var chkDate = ele.getAttribute("data-valid-datetime");
			if ( (chkDate == "yes" && !R.Validate.Date(val)) || (chkDate=="no" && !emp && !R.Validate.Date(val)) ){
				err = title + " 应为日期格式! ";
			}

			/* 正则表达式校验 */
			var chkRegex = ele.getAttribute("data-valid-regexp");
			if ( chkRegex && val ){
				var re = new RegExp(chkRegex);
				if( !re.test(val) ){
					err = title + " 格式不匹配! ";
				}
			}

		}else{

			/* 其它类型检查 */
			switch(type){

				case "select-one":
					var val = R( ele ).value();
					if( val == '' && ele.getAttribute("data-valid-empty") == "yes" ){
						err = " 请选择 "+ title;
					}
				break;

				case "radio":
					var val = R("input[name='"+ name +"']").value();
					if( val == '' && ele.getAttribute("data-valid-empty") == "yes" ){
						err = " 请选择 "+ title;
					}
				break;

				case "checkbox":
					var obj = R("input[name='"+ name +"']");

					var x=0;
					for( var i=0; i<obj.size(); i++ ){
						if( obj.item(i).checked ){
							x++;
						}
					}

					/* 非空校验 */
					var chknull = ele.getAttribute("data-valid-empty");
					if ( chknull == "yes" && x == 0 ){
						err = title+" 不能为空! ";
					}

					var chkMax = ele.getAttribute("data-valid-maxsize");
					var chkMin = ele.getAttribute("data-valid-minsize");

					if ( chkMax && chkMax<x ){
						err = title +" 最多只能选 "+chkMax+" 项! ";
					}

					if ( chkMin && chkMin>x ){
						err = title +" 至少需要选 "+chkMin+" 项! ";
					}
				break;
			}
		}

		//有错误
		if( err ){

			//焦点移到可见对象上
			if ( type !="hidden" ){
				try{
					ele.focus();
				}catch(e){

				}
			}

			/*
				回调函数
				err	错误信息
				ele	当前元素
			*/
			func( err, ele );

			return false;
		}

		return true;
	}

	///////////////////////

	/*
		操作消息
		用于页面操作反馈

		参数：
			id			信息框ID
			class		附加的样式名称
			html		信息框内容
			time		显示时间,秒
			config	配置
			func		回调函数
	*/
	R.Toast = function( style, html, time, config, func ){

		//配置选项
		var config = config ? config : {};

		//显示时间
		var time = config['time'] || 3;

		//分配ID
		var unique = config["unique"] || R.String().random( 10, 'R' );

		///////////////////////

		//空消息
		if( !html ) return;

		//对象已存，直接显示
		R( "#"+unique ).remove();

		//创建对象
		R( document.body ).create( "div" , { "id" : unique, "className" : style, "innerHTML" : html } );

		time && window.setTimeout(function(){

			//隐藏对象
			R( "#"+unique ).hide();

			//回调函数
			func && func( R( "#"+unique ).item(0) );

		}, 1000 * time );

	}

	///////////////////////

	/*
		Ajax
		file	文件名称
	*/
	R.Ajax = function(file) {
		this.xmlhttp = null;

		this.resetData = function() {
			this.method = "GET";
			this.URLString = "";
			this.encodeURL = true;
			this.file = file;
			this.late = true;
			this.failed = false;
		};

		this.resetFunctions = function() {
			this.onLoading = function() { };
			this.onLoaded = function() { };
			this.onInteractive = function() { };
			this.onCompletion = function() { };
			this.onError = function() { };
			this.encode = (encodeURIComponent && this.encodeURL)?function(s) {
				return encodeURIComponent(s);
			}:function(s){return s;}
		};

		this.reset = function() {
			this.resetFunctions();
			this.resetData();
		};

		this.createAJAX = function(){
			try {
				this.xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			}catch (e1){
				try {
					this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e2) {
					this.xmlhttp = null;
				}
			}
			if (! this.xmlhttp) {
				if (typeof XMLHttpRequest != "undefined") {
					this.xmlhttp = new XMLHttpRequest();
				} else {
					this.failed = true;
				}
			}
		};

		this.setVar = function(name, value) {
			var arr1 = [], arr2 = [];
			if (typeof name == "object" && !value) {
				for(var i in name) {
					arr1[arr1.length] = i;
					arr2[arr2.length] = name[i];
				}
			}
			else {
				arr1[0] = name;
				arr2[0] = value;
			}

			var first = (this.URLString.length == 0);

			for(var i=0;i<arr1.length;i++) {
				this.URLString += (first)?"":"&";
				this.URLString += arr1[i] + "=" + this.encode(arr2[i]);
			}
		};

		/*
			设置请求头信息
		*/
		this.setHeader = function( key , value ){
			try {
				this.xmlhttp.setRequestHeader( key , value );
			} catch(e) {}
		};

		/*
			返回最终请求地址
		*/
		this.getURL = function(){
			return this.file + '?' + this.URLString;
		};

		this.send = function(content) {
			if (!content) content = "";
			if (!this.xmlhttp || this.failed ) {
				this.onError();
				return;
			}
			var self = this;
			if (this.method == "GET" || this.method == "GET&POST") {
				this.xmlhttp.open(this.method,this.file+"?"+this.URLString,this.late);
			} else if (this.method == "POST") {
				this.xmlhttp.open(this.method,this.file,this.late);
				try {
					this.xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				} catch(e) {}
			}
			else this.onError();
			this.xmlhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
			this.xmlhttp.onreadystatechange = function() {
				switch (self.xmlhttp.readyState) {
					case 1:
						self.onLoading();
					break;
					case 2:
						self.onLoaded();
					break;
					case 3:
						self.onInteractive();
					break;
					case 4:
						self.response = self.xmlhttp.responseText;
						self.responseXML = self.xmlhttp.responseXML;
						try{
							var status = self.xmlhttp.status;
						}catch(e){
							var status = "Trouble accessing it";
						}

						if (self.xmlhttp.readyState == 4 || status == "200") {
							self.onCompletion();
						} else {
							self.onError();
						}
						self.URLString = "";
					break;
				}
			};

			if (this.method == "POST") {
				this.xmlhttp.send(this.URLString);
			} else if (this.method == "GET") {
				this.xmlhttp.send(null);
			} else if (this.method == "GET&POST") {
				this.xmlhttp.send(content);
			}
		};

		this.reset();
		this.createAJAX();
	};


	/*
		加载 Script 脚本
		src		文件地址
		func		回调函数
		attr		属性（JSON格式）
		target	目标元素，默认为<head>
	*/
	R.script = function( src, attr, func, target ){

		//空函数
		if( typeof func != 'function' ) var func = function(){};

		//附加属性
		attr = attr ? attr : {};
		attr["type"] = "text/javascript";
		attr["src"] = src;

		//追加元素
		( target || document.getElementsByTagName("head")[0] ).appendChild(script);

		/*
		设定读取完以后的操作
		IE9 以上同时支持 onreadystatechange 和 onload，所以使用 executed 来确保只执行一次
		http://www.aaronpeters.nl/blog/prevent-double-callback-execution-in-IE9
		*/
		script.onreadystatechange = script.onload = function() {
			if( ( !this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) && !this.executed ) {
				this.executed = true;
				func && func(this);
			}
		};

	}

	/*
		加载 Script 脚本
		src		文件地址
		func		回调函数
		attr		属性（JSON格式）
		target	目标元素，默认为<head>
	*/
	R.jsonp = function( src, attr, func ){

		//空函数
		if( typeof func != 'function' ) var func = function(){};

		//匿名函数名称
		var c = 'cross' + parseInt(Math.random()*1000);

		//头部容器
		var head = document.getElementsByTagName("head")[0];

		//附加回调参数
		if( attr.autocall != false ){
			src = src.substr( 0, src.length-1 ) + c;
		}

		//附加属性
		attr = attr ? attr : {};
		attr["type"] = "text/javascript";
		attr["src"] = src;

		var script = R( head ).create( "script", attr, true );

		// Handle JSONP-style loading
		//将函数名设置为window的一个方法,这样此方法就是全局的了.
		window[ c ] = window[ c ] || function( data ) {

			//调用匿名函数
			func(data);

			// Garbage collect
			window[ c ] = undefined;

			try {
				delete window[ c ];
			} catch(e) {}

			//移除自己
			script.remove();

		};

	}

	///////////////////////

	R.Lazy = (function(){
		var pResizeTimer = null;
		var imgs={};
		function addEventHandler (oTarget, sEventType, fnHandler) {
			if (oTarget.addEventListener) {
				oTarget.addEventListener(sEventType, fnHandler, false);
			} else if (oTarget.attachEvent) {
				oTarget.attachEvent("on" + sEventType, fnHandler);
			} else {
				oTarget["on" + sEventType] = fnHandler;
			}
		};
		function resize(){
			if(pResizeTimer) return '';
			pResizeTimer = setTimeout(function(){
				resize_run();
				try{
					clearTimeout(pResizeTimer);
				}
				catch(e){};
				pResizeTimer=null;
			}, 100);
		}
		function resize_run(){
			var min={};
			var max={};
			//min.Top=document.documentElement.scrollTop;
			min.Top = document.body.scrollTop + document.documentElement.scrollTop;
			min.Left=document.documentElement.scrollLeft;
			max.Top=min.Top+document.documentElement.clientHeight;
			max.Left=min.Left+document.documentElement.clientWidth;

			for(var i in imgs){
				if(imgs[i]){
					var _img=imgs[i];
					var img=document.getElementById(i);

					//修复图片已不存在会在 IE 中抛出 Object required 的问题
					if( !img ) continue;

					var width = img.clientWidth;
					var height = img.clientHeight;
					var wh = position(img);
					if(
						(wh.Top>=min.Top && wh.Top<=max.Top && wh.Left>=min.Left && wh.Left<=max.Left)
						||
						((wh.Top+height)>=min.Top && wh.Top<=max.Top && (wh.Left+width)>=min.Left && wh.Left<=max.Left))
					{
						img.src=_img.src;
						delete imgs[i];
					}

				}
			}
		}

		function position(o){
			var p={Top:0,Left:0};
			while(!!o){
				p.Top+=o.offsetTop;
				p.Left+=o.offsetLeft;
				o=o.offsetParent;
			}
			return p;
		}

		return {
			init:function(){
				for(var i=0;i<document.images.length;i++){
					var img = document.images[i];
					var config={};
					config.id = img.id;
					config.src = img.getAttribute('_src');
					if(config.src && !config.id){
						config.id = encodeURIComponent(config.src) + Math.random();
						img.id = config.id;
					}
					if(!config.id || !config.src) continue;
					R.Lazy.push(config);
				}
			},
			push:function(config){
				imgs[config.id] = config;
			},
			run:function(){
				resize_run();
				addEventHandler(window,'scroll',resize);
				//addEventHandler(window,'resize',resize);
			}
		};
	})();

	///////////////////////

	/*
		基本选择器
		selector	选择器表达式
		context		上下文
	*/
	R.find = function(selector, context){
		return ( context || document ).querySelectorAll(selector);
	};

	/*
		扩展选择器方法
		func	函数
	*/
	R.extend = function( func ){
		for( var i in func ){
			R.init.prototype[i] = func[i];
		}
	};

	//创建对象
	R.create = function( tag, attr ){
		var obj = document.createElement( tag );

		//附加属性
		var attr = attr || {};
		for( var key in attr ){
			//DOM 方法
			if( /[A-Z]/.test(key) ){
				obj[ key ] = attr[ key ];
			}else{
				obj.setAttribute( key, attr[key] );
			}
		}
		return obj;
	};

	/*
		初始化
		selector	选择器
		context		父对象
	*/
	R.init = function( selector, context ){
		this.self = typeof selector == 'string' ? R.find( selector, context ) : [selector];
	};

	R.init.prototype = {

		/*
			检测节点是否存在于文档中
			o	目标节点
		*/
		isOnDom:function () {
			var body = document.body;
			this.each( function( ){
				var node = this;
				if (!node || !node.nodeType || node.nodeType !== 1) return;
				while (node.parentNode) {
					if (node === body) return true;
					node = node.parentNode;
				}
			});
			return false;
		},

		/*
			元素数量

			返回：
			int		数量
		*/
		size : function(){
			return this.self.length;
		},

		/*
			选择元素
			i		索引位置
			self	重置为当前元素

			返回：
			int		数量
		*/
		item : function( i, self ){

			//元素数量
			var size = this.size();

			//当前元素
			var ele = null;

			//从左至右返回元素
			if( i >= 0 ){
				ele = i <= size ? this.self[i] : null;
			}else{
				//从右至左返回元素
				ele = Math.abs(i) <= size ? this.self[ ( size + i ) ] : null;
			}

			//重置为当前元素
			if( self ){
				this.self = [ele];
			}

			return self ? this : ele;

		},

		/*
			隐藏元素
			func	回调函数
		*/
		hide : function( func ){

			this.each( function( ){

				//隐藏对象
				this.style.display = 'none';

				func && func.call( this );

			} );

			return this;
		},

		/*
			显示元素
			func	回调函数
		*/
		show : function( func ){

			this.each( function( ){

				//显示对象
				this.style.display = '';

				func && func.call( this );

			} );

			return this;
		},

		/*
			显示或隐藏对象
			func	回调函数
		*/
		toggle : function( func ){

			this.each( function( ){

				if( this.style.display == "none" || this.offsetHeight == 0 || this.offsetWidth == 0 ) {
					this.style.display = "";
				}else{
					this.style.display = "none";
				}

				/*
					回调函数
					parm	是否可见
				*/
				func && func.call( this, this.style.display != 'none' );

			} );

			return this;
		},

		/*
			设置或返回对象值
			text		[可选]文本值
			add		[可选]是否在原文本上追加
		*/
		value : function( text, add ){

			//设置值
			if( typeof text != 'undefined' ){

				this.each( function( ){

					//子元素数量
					var len = this.length;

					//按类型处理
					switch( this.type ){

						//单选下拉
						case "select-one":

							for(var i=0; i<len; i++ ){
								if( this[i].value == text ){
									this.selectedIndex=i;
									break;
								}
							}

						break;

						//多选下拉
						case "select-multiple":

							for( var i=0; i<len; i++ ){
								if( R.Array( text ).indexOf( this[i].value ) !== -1 ){
									this[i].selected = true;
								}else{
									this[i].selected = false;
								}
							}

						break;

						//单选和筛选按钮
						case "radio":
						case "checkbox":

							if( ( R.Validate.Array(text) && R.Array( text ).indexOf( this.value ) !== -1 ) || this.value == text ){
								this.checked = true;
							}else{
								this.checked = false;
							}

						break;

						//文本框、隐藏域和多行文本
						case "text"	:
						case "hidden":
						case "textarea":
						case "password":

							if( add ){
								this.value += text;
							}else{
								this.value = text;
							}

						break;

					}

				} );

				return this;

			}

			///////////////////////////////////

			//返回值
			var val = [];

			//批量绑定
			this.each( function( ){

				//子元素数量
				var len = this.length;

				//按类型处理
				switch( this.type ){

					//单选下拉
					case "select-one":
						val.push( this.selectedIndex > -1 ? this[this.selectedIndex].value : null );
					break;

					//多选下拉
					case "select-multiple":
						for( var i=0; i<len; i++ ){
							this[i].selected && val.push( this[i].value );
						}
					break;

					//单选和筛选按钮
					case "radio":
					case "checkbox":
						this.checked && val.push( this.value );
					break;

					//文本框、隐藏域和多行文本
					case "text"	:
					case "hidden":
					case "textarea":
					case "password":
						val.push( this.value );
					break;

				}

			} );

			return this.size() == 1 ? val[0] : val;
		},

		/*
			设置或返回对象文本
			text			[可选]文本值
			replace		[可选]新的文本値
		*/
		text : function( text, replace ){

			//设置值
			if( typeof text != "undefined" ){

				this.each( function( ){

					//子元素数量
					var len = this.length;

					//按类型处理
					switch( this.type ){

						//单选下拉
						case "select-one":

							for( var i=0; i<len; i++ ){
								if( this[i].text == text ){
									this.selectedIndex=i;
									if( typeof replace != "undefined" ) this[i].text = replace;
									break;
								}
							}

						break;

						//多选下拉
						case "select-multiple":

							for( var i=0; i<len; i++ ){
								if( R.Array( text ).indexOf( this[i].text ) !== -1 ){
									this[i].selected = true;
									if( typeof replace != "undefined" ) this[i].text = replace;
								}else{
									this[i].selected = false;
								}
							}

						break;

					}

				} );

				return this;

			}

			///////////////////////////////////

			//返回值
			var val = [];

			//批量绑定
			this.each( function( ){

				//子元素数量
				var len = this.length;

				//按类型处理
				switch( this.type ){

					//单选下拉
					case "select-one":
						if( len ){
							val = this[this.selectedIndex].text;
						}
					break;

					//多选下拉
					case "select-multiple":

						for( var i=0; i<len; i++ ){
							if( this[i].selected ){
								val.push(this[i].text);
							}
						}

					break;

				}

			} );

			return val;
		},

		/*
			判断元素中是否有某对象
			element		元素
		*/
		contains : function( element ){
			var res = false;
			this.each( function( ){
				//a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b))
				res = this.contains( element );
			});
			return res;
		},

		/*
			设置或返回对象内容
			html		[可选]代码块
			add		[可选]是否在原代码上追加
		*/
		html : function( html, add ){

			if( typeof html != 'undefined' ){

				this.each( function( ){
					if( add ){
						this.innerHTML += html;
					}else{
						this.innerHTML = html;
					}
				});

				return this;
			}

			var ele = this.self[0];

			return ele.innerHTML;
		},

		/*
			设置或返回对象样式名
			key		[String]	时返回样式值
					[Array]		时设置属性值，如：{"color":"red","fontSize":"14px"}
		*/
		attr : function( key ){

			//返回对象属性值
			if( typeof key == 'string' ){

				//没有对象
				if( this.size() == 0 ) return null;

				var ele = this.self[0];

				//DOM 方法
				if( /[A-Z]/.test(key) ){
					return ele[ key ];
				}else{
					return ele.getAttribute(key);
				}

			}else{

				this.each( function( ){

					//设置对象属性
					for(var x in key){

						//DOM 方法
						if( /[A-Z]/.test( x ) ){
							this[ x ] = key[ x ] ;
						}else{
							this.setAttribute( x, key[x] );
						}

					}

				} );

				return this;

			}

		},

		/*
			设置或返回对象样式
			key		[String]	时返回样式值
					[Array]		时设置样式值，如：{"color":"red","fontSize":"14px"}
		*/
		style : function( key ){

			//返回对象样式值
			if( typeof key == 'string' ){

				//没有对象
				if( this.size() == 0 ) return null;

				var ele = this.self[0];
				var fn = function(){
					var f = document.defaultView;
					return new Function('el','style',[
						"style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));",
						"style=='float' && (style='",
						f ? 'cssFloat' : 'styleFloat',
						"');return el.style[style] || ",
						f ? 'window.getComputedStyle(el, null)[style]' : 'el.currentStyle[style]',
						' || null;'].join(''));
				}();

				return fn( ele, key );

			}else{

				this.each( function( ){

					//设置对象样式
					for(var x in key){
						this.style[x] = key[x];
					}

				} );

				return this;

			}

		},

		/*
			返回对象位置和尺寸信息
			Array	如：{"width":width,"height":height}
		*/
		position : function( ){

			//没有对象
			if( this.size() == 0 ) return null;

			var ele = this.self[0];

			var width 	= ele.offsetWidth;
			var height	= ele.offsetHeight;

			var top		= ele.offsetTop;
			var left	= ele.offsetLeft;

			while( ele = ele.offsetParent ){
				top 	+= ele.offsetTop;
				left	+= ele.offsetLeft;
			}

			return { "width":width, "height":height, "top":top, "left":left };

		},

		/*
			遍历元素，对每个元素执行回调函数
			func		需要执行的函数
		*/
		each : function( func ){

			var size = this.size();
			var ele = this.self;

			for( var i = 0; i< size; i++ ){

				//如果需要中断，需要在函数体内定义 return false;
				if( func.call( ele[i], i ) === false ) break;

			}

			return this;

		},

		/*
			为对象绑定事件
			evt		事件名称
			fn		要执行的函数
		*/
		bind : function( evt , fn ){

			this.each( function( index ){

				var self = this;	//IE中必须
				var call = function( e ){ return fn.call( self, index, e ); };

				//生成序列，用于后期移除
				!this.Listeners && ( this.Listeners = [] );

				//加入序列
				this.Listeners.push({ e: evt, fn: call });

				//绑定事件
				if (this.addEventListener) this.addEventListener( evt, call, false );
				else if (this.attachEvent) this.attachEvent( 'on' + evt, call );
				else this['on' + evt] = call;

			} );

			return this;
		},

		/*
			匹配对象绑定事件
			evt			事件名称
			selector	元素选择器
			fn			回调函数
		*/
		live: function( evt, selector, cb ){
			document.addEventListener( evt, function (event) {
				var qs = document.querySelectorAll(selector);
				if (qs) {
					var el = event.target, index = -1;
					while (el && ((index = Array.prototype.indexOf.call(qs, el)) === -1)) {
						el = el.parentElement;
					}
					if (index > -1) {
						cb.call(el, index, event);
					}
				}
			});
		},

		/*
			移除为对象绑定的事件
			evt		事件名称
		*/
		unbind : function( evt ){

			this.each( function( index ){

				//移除序列
				if ( this.Listeners ) {

					for (var i = 0; i < this.Listeners.length; i++) {
						if (this.removeEventListener) this.removeEventListener( this.Listeners[i].e, this.Listeners[i].fn, false );
						else if (this.detachEvent) this.detachEvent( 'on' + this.Listeners[i].e, this.Listeners[i].fn );
						else this['on' + evt] = null;
					};

				   delete this.Listeners;
				};

			} );

			return this;
		},

		/*
			模拟事件
		*/
		event : function( e ){

			this.each( function( ){

				try{

					if( document.createEvent ){

						var evt = document.createEvent("RuseEvents");
						evt.initEvent( e, true, true);
						this.dispatchEvent(evt);

					}else if( document.createEventObject ){

						var evt = document.createEventObject();
						this.fireEvent('on'+e, evt);

					}else{
						this['on'+e]();
					}

				}catch(e){

				}

			});

			return this;
		},

		/*
			设置对象焦点
			func	要执行的函数
		*/
		focus : function( func, e ){

			this.each( function( index ){

				//聚焦元素
				this.focus();

				//回调
				if(typeof func == 'function'){
					return func.call( this, index, e );
				}

			} );

			return this;
		},

		/*
			使对象失去焦点
			func	要执行的函数
		*/
		blur : function( func, e ){

			this.each( function( index ){

				//失去焦点
				this.blur();

				//回调
				if( typeof func == 'function' ){
					return func.call( this, index, e );
				}

			} );

			return this;
		},

		/*
			提交表单，针对表单
			func	要执行的函数
		*/
		submit : function( func, e ){

			this.each( function( index ){

				//回调必需为真或没有回调时执行
				if( ( typeof func == 'function' && func.call( this, index, e ) ) || typeof func == "undefined" ){
					this.submit();
				}

				return false;

			} );

			return this;
		},

		/*
			重置表单，针对表单
			func	要执行的函数
		*/
		reset : function( func, e ){

			this.each( function( index ){

				//回调必需为真或没有回调时执行
				if( ( typeof func == 'function' && func.call( this, index, e ) ) || typeof func == 'undefined' ){
					this.reset();
				}

				return false;

			} );

			return this;
		},

		/*
			禁用当前元素
		*/
		disabled : function(){

			this.each( function( ){
				this.disabled = true;
			} );

			return this;
		},

		/*
			启用当前元素
		*/
		enabled : function(){

			this.each( function( ){
				this.disabled = false;
			} );

			return this;
		},

		/*
			选中或取消选中当前元素，本方法只针对 checkbox 元素有效
		*/
		checked : function( checked ){

			this.each( function( ){

				if( R.Validate.Boolean( checked ) ){
					this.checked = checked;
				}else{
					this.checked = ( this.checked? false : true );
				}

			} );

			return this;
		},

		/*
			在当前元素上创建子元素
			obj		元素对象
			attr		属性对象
			self		是否重置为当前元素
		*/
		create : function( tag, attr, self ){

			//创建对象
			var obj = R.create( tag , attr );

			/////////////////

			//批量插入
			this.append( obj );

			//重置为当前元素
			if( self ) this.self = [obj];

			return this;
		},

		/*
			在当前元素前面位置创建兄弟元素
			obj		元素对象
			attr		属性对象
			self		是否重置为当前元素
		*/
		insert : function( tag , attr , self ){

			//创建对象
			var obj = R.create( tag , attr );

			//批量插入
			this.each( function( ){
				this.parentNode.insertBefore( obj , this );
			});

			//重置为当前元素
			if( self ) this.self = [obj];

			return this;
		},

		/*
			插入外部创建的元素
			[ array ]		元素对象
		*/
		append : function( ){

			//遍历参数
			for( var i = 0; i < arguments.length; i++ ){

				var obj = arguments[i];

				//批量插入
				this.each( function( ){
					this.appendChild( obj );
				});

			}

			return this;
		},

		/*
			插入外部创建的元素
			[String]		位置
			[String]		内容
		*/
		adjacent : function( position, text ){

			this.each( function( ){
				this.insertAdjacentHTML( position, text);
			});

			return this;
		},

		/*
			删除元素或属性
			attr	属性名称，否则为元素
		*/
		remove : function( attr ){

			this.each( function( ){
				if( typeof attr == 'string' ){
					this.removeAttribute( attr );
				}else{
					this.parentNode.removeChild( this );
				}
			} );

			return this;
		},

		/*
			访问父节点
			level		层次，默认为 1
		*/
		parent : function( level ){

			//新元素
			var tmp = [];

			//访问层次
			var lev = R.Validate.Number( level ) ? parseInt( level ) : 1;

			//批量查找
			this.each( function( ){
				var ele = this;
				for( var i=0; i<lev; i++ ){
					ele = ele.parentNode;
				}
				tmp.push( ele );
			} );

			this.self = tmp;

			return this;

		},

		/*
			返回上一个兄弟节点
			node		是否必需为元素结节
			self		是否重置为当前元素
		*/
		prev : function( node, self ){

			//没有对象
			if( this.size() == 0 ) return null;

			var ele = this.self[0];
			var obj = null;
			var obj = node ? ele.previousElementSibling : ele.previousSibling;

			//重置为当前元素
			if( self ){
				this.self = [obj];
				return this;
			}else{
				return obj;
			}

		},

		/*
			返回下一个兄弟节点
			node		是否必需为元素结节
			self		是否重置为当前元素
		*/
		next : function( node, self ){

			//没有对象
			if( this.size() == 0 ) return null;

			var ele = this.self[0];
			var obj = node ? ele.nextElementSibling : ele.nextSibling;

			//重置为当前元素
			if( self ){
				this.self = [obj];
				return this;
			}else{
				return obj;
			}

		}

	};

	win.R = win.Mo = R;

})( window, document, undefined );
