function myLogger(id){
	id = id||"ICLogWindow";
	//日志窗体的引用
	var logWindow = null;
	//创建日志窗体
	var createWindow = function(){
		//获取浏览器窗口的大小
		var browserWindowSize = IC.getBrowserWindowSize();
		//浏览器高度
		var top =( browserWindowSize.height-200)/2||0; 
		//浏览器左上角坐标
		var left =( browserWindowSize.width-200)/2||0; 
		
		//使用UL
		logWindow = document.createElement('IC');
		
		//添加ID进行标识
		logWindow.setAttribute("id",id);
		
		//对窗体进行CSS样式的控制
		logWindow.style.position = 'absolute';
		logWindow.style.top = top + 'px';
		logWindow.style.left = left + 'px';
		
		//对UL窗体进行控制
		logWindow.style.width = '200px';
		logWindow.style.height = '200px';
		logWindow.style.overflow = 'scroll'; //让滚动条出现
		
		//对UL进行控制,根据盒子模型
		logWindow.style.padding = '0';
		logWindow.style.margin = '0';
		logWindow.style.border = '1px solid black';
		//背景白色,列表样子没有,字体设置
		logWindow.style.backgroundColor = 'white';
		logWindow.style.listStyle = 'none';
		logWindow.style.font = '10px/10px Verdana, Tahoma, Sans';
		
		//在body上添加一个子节点,我们创建的窗体挂载到BODY上
		document.body.appendChild(logWindow);
		
	}
	//向日志窗体中添加一行
	this.writeRaw = function(message){
		//如果初始窗体是不存在的,则生成日志窗体
		if(!logWindow){
			createWindow();
		}
		//创建LI 的DOM节点
		var li = document.createElement('LI');
		//进行CSS样式控制
		li.style.padding = '2px';
		li.style.border = '0';
		li.style.borderBottom = '1px dotted black';
		li.style.margin = '0';
		li.style.color = '#000'
		
		//验证message信息
		if(typeof message == 'undefined'){
			li.appendChild(
				document.createTextNode('Message is undefined')
			);
		}else if(typeof li.innerHTML != undefined){
			li.innerHTML = message;
		}else{
			li.appendChild(
				document.createTextNode(message)
			);
		}
		
		logWindow.appendChild(li);
		return true;
	};
}

//对象字面量的方式声明特权方法
myLogger.prototype = {
	//向日志窗体添加一行,对输入的内容进行简单处理.
	write:function(message){
		if(typeof message == 'string' && message.length==0){
			return this.writeRaw('没有输入信息');	
		}
		if(typeof message != 'string'){
			if(message.toString){
				return this.writeRaw(message.toString());
			}else{
				return this.writeRaw(typeof message);	
			}
		}
		
		//将大于号小于号进行正则转换成HTML标记
		message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;");
		return this.writeRaw(message);
	},
	//向日志 窗体中添加标题
	header:function(message){
		message = '<span style="color:white;background-color:black;font-weight:bold;padding:0px 5px;">' + message +'</span>';
		return this.writeRaw(message);
	}
};

window['IC']['log'] = new myLogger();