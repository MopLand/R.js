
/*
	打印对象信息
	data	数据
*/
function dump( data ){
	var str = '';
	for( var key in data ){
	      str += '"'+ key +'" : "'+data[key]+'",';
	}
	return ( '{'+str+'}' ).replace(/,\}/g,'}');
}

//DOM 载入后执行
R.reader(function(){

	R("#build").html( "当前版本：" + R.version + " 最后更新：" + R.build );

	///////////////////////////////

	//当前路径，过滤掉 # 以后的内容
	var self = location.href.replace(/#([\S\s])*$/,'');

	//处理导航
	R("nav ul li a").each(function(){

		//高亮当前，如果在 api 目录时高亮 api.html
		if(
		   this.href == self ||
		   ( self.substring( self.length-1 , self.length ) == "/" && this.href.indexOf("index.html") > -1 ) ||
		   ( this.href.indexOf("api.html") > -1 && self.indexOf("api/") > -1 )
		){
			this.className = "active";
		}

	});

	///////////////////////////////

	//目录索引
	R("#entry").before( 'menu', {
		"id" : "index",
		"innerHTML" : "<ul></ul>"
	});

	//创建索引
	R("#entry dt").each(function(){

		//条目名称
		var text = R.String( this.innerHTML ).trim();
		var hash = escape( text );

		//加入到索引
		R("#index ul").append( 'li', {
			"innerHTML" : "<a href='#"+ hash +"'>"+ text +'</a>'
		});

		//创建锚点
		R( this ).append( 'a', {
			"name" : hash
		});

	});

});
