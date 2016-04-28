R("#left").bind('click',function(){
    R("#motion_box").style( {"position":"absolute","width":"50","height":"50","background":"red"} ).motion( 20, {
        //"opacity":{"min":10,"max":100},
        "left":{"min":300,"max":600}
    });
});

R("#right").bind('click',function(){
    R("#motion_box").style( {"position":"absolute","width":"50","height":"50","background":"red"} ).motion( 20, {
        //"opacity":{"min":10,"max":100},
        "right":{"min":300,"max":600}
    });
});

/************* 事件绑定 测试 ****************/

R("#bind").bind('click',function(){ R("#bind_box").html("你点了我一下！",true); });

R("#unbind").bind('click',function(){ R("#bind").unbind('click'); });

/************* 对象焦点 测试 ****************/

R("#focus").bind('click',function(){ R("#focus_box").focus( function(){ R( this ).value( '焦点在这里！' ); } ); });

/************* 失去焦点 测试 ****************/

R("#blur").bind('click',function(){ R("#blur_box").blur( function(){ R( this ).value( '焦点不在这里！' ); } ); });

/************* 读取值 测试 ****************/

R("#btn_value").bind('click',function(){ R("#read").html( R('#bind_value').value() ); });

R("#btn_multi").bind('click',function(){ R("#multi").html( R('input[name=multi]').value() ); });

R("#btn_checkbox").bind('click',function(){ R("#checkbox").html( R('input[name=chkbox]').value() ); });

/************* 写入值 测试 ****************/

R("#text").style({"color":"red","fontFamily":"Verdana"}).value( "文字的颜色是" + R("#text").style("color") );

R("#hidden").value("B");

R("#select").value("B");

R("#multiple").value(["B","C"]);

R("#textarea").value("textarea");

R("input.radio").value("B");

R("input.checkbox").value("B");

/************* 写入文本 测试 ****************/

R("#btn_text").bind('click',function(){
	R("select[name=text-two]").text('C+','D+');
});

/************* 访问父节点 测试 ****************/

R("#btn_parent").html( '父节点的父节点是：'+R("#btn_parent").parent( 2 ).attr('id') );

/************* 显示/隐藏对象 测试 ****************/

R("#btn_hide").bind('click',function(){
    R("#hide").hide();
});

R("#btn_show").bind('click',function(){
    R("#show").show( 10, function(){ R("#show").html('我是一个回调事件，你可以不理我！'); } ).html('我又出来了！');
});

R("#btn_toggle").bind('click',function(){
    R("#toggle").toggle();
});

/************* 对象HTML 测试 ****************/

R("#btn_html").bind('click',function(){

    R("#html").html('<a href="http://www.veryide.com/">VeryIDE</a>');

});

/************* 创建对象 测试 ****************/

R("#btn_create").bind('click',function(){

    R("#create").create( "strong" , { "innerHTML" : "我是刚创建的 strong 标签。", "data-test" : "strong" } );

});
/************* 创建对象 测试 ****************/

var i = 0;

R("#btn_insert").bind('click',function(){

    R("#insert").insert( "p" , { "innerHTML" : "我是刚创建的 P 标签："+ ( i++ ) } );

});

/************* 插入对象 测试 ****************/

R("#btn_append").bind('click',function(){

    R("#append").append( document.createElement("hr") );

});

/************* 删除对象 测试 ****************/

R("#btn_remove").bind('click',function(){

    R("#remove").remove();

});

R("#btn_unattr").bind('click',function(){

    R("#unattr").remove( 'style' );

});


/************* 对象位置 测试 ****************/

R("#btn_position").bind('click',function(){

    var pos = R("#position").position();
    var str = '';
    for(var x in pos){
        str +=  x + " : " + pos[x]  + "<br />";
    }

    R("#position").html(str);

});

/************* 对象属性 测试 ****************/

R("#btn_attr").bind('click',function(){

    R("#attr").attr( { "width" : R.between( 100 , 200 ) } );

    R("#box_attr").html( "width: " + R("#attr").attr( "width" ) );

});

/************* 选中/取消选中对象 测试 ****************/

R("#btn_checked_all").bind('click',function(){
    R("#checked input[type=checkbox]").checked( true );
});

R("#btn_checked_un").bind('click',function(){
    R("#checked input[type=checkbox]").checked( false );
});

R("#btn_checked_anti").bind('click',function(){
    R("#checked input[type=checkbox]").checked( );
});

/************* 禁用/启用对象 测试 ****************/

R("#btn_disabled").bind('click',function(){
    R("#disabled").disabled();
});


R("#btn_enabled").bind('click',function(){
    R("#enabled").enabled();
});

/************* 提交/重置表单 测试 ****************/

R("#form_submit button").bind('click',function(){

	return R("#form_submit").submit(function(){
		return confirm( '确定要提交吗?' );
	});

});

R("#form_reset button").bind('click',function(){

	R("#form_reset input").value( R.random(10) );

	return R("#form_reset").reset(function(){
		return confirm( '确定要重置吗?' );
	});

});
