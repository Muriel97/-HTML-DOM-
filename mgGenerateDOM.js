(function(){
	
	/************************************
	* 该方法的作用是用于保证字符串是一个安全的JavaScript字符串
	* 该方法用来转义单引号,双引号,反斜杠
	*************************************/
	function encode(str){
		if(!str) return null;
		str = str.replace(/\\/g,'\\\\');
		str = str.replace(/';/g,"\\'");
		str = str.replace(/\s+^/mg,"\\n");
		return str;
	}
	/************************************
	* 该方法用来查找所有节点值中包含美元符号的变量,
	* 如果包含则返回一个带绰号的字符串或一个变量名称.
	* 而且还会把变量声明添加到requiredVariables字符串中，
	* 以便在结果中显示.
	*************************************/
	function checkForVariable(v){
		if(v.indexOf('$')==-1){
			v = '\'' + v + '\''
		}else{
			v = v.substring(v.indexOf('$')+1)
			requiredVariables += 'var '+ v +';\n';
		}
		return v;
	}
	/************************************
	* 当循环遍历domRoot的子节点时,使用该方法处理属性
	*************************************/
	function processAttribute(tabCount,refParent){
		//跳过文本节点
		if(this.nodeType!=IC.node.ATTRIBUTE_NODE) return;
		//取得属性值
		var attrValue = (this.nodeValue?encode(this.nodeValue.trim()):'');
		//如果没有值测人会
		if(!attrValue) return;
		var tabs = (tabCount?'\t'.repeat(parseInt(tabCount)):'');
		//根据nodeName判断,除了class和style其余类型按默认处理
		switch(this.nodeName){
			default:
				if(this.nodeName.substring(0,2)=='on'){
					//如果是以on开头,说明是一个嵌入事件属性,也就是需要创建一个给该属性赋值的函数
					domCode+= tabs + refParent + '.' + this.nodeName + '=function(){' + attrValue + '}\n';
				}else{
					domCode+= tabs + refParent + '.setAttribute(\''+ this.nodeName+ '\','+checkForVariable(attrValue)+');\n';

				}
				break;
			case 'class':
				//使用className属性
				domCode += tabs + refParent +'.className= ' + checkForVariable(attrValue) +';\n';
				break;
			case 'style':
				//使用正则表达式基于; 和相信的空格字符串分隔样式属性.
				var style = attrValue.split(/\s*;\s*/);
				
				if(style){
					for(pair in style){
						if(!style[pair]) continue;
						//使用正则表达式基于:和相邻的空格符来分割每对样式属性
						var prop = style[pair].split(/\s*:\s*/);
						if(!prop[1]) continue;
						//将css-property格式的css属性转换为骆驼峰式写法
						
						prop[0] = IC.camelize(prop[0]);
						
						var propValue = checkForVariable(prop[1]);
						if(prop[0] == 'float'){
							//float式保留字因此属性特殊情况
							//cssFloat是标准的属性
							//styleFloat是IE使用的属性
							domCode += tabs + refParent +'.style.cssFloat = ' + propValue + ';\n';
							domCode += tabs + refParent +'.style.styleFloat = ' + propValue + ';\n';
						} else {
							domCode += tabs + refParent +'.style.' + prop[0] + ' = ' + propValue + ';\n';
						}
					}
				}
				break;
		}
	}
	/************************************
	* 当循环遍历domRoot的子节点时,使用processNode()方法分析树中每个节点,
	* 确定节点的类型,值和属性,以便重新创建适当的DOM代码.
	*************************************/
	function processNode(tabCount,refParent){
		//根据树的深度级别添加缩进
		var tabs = (tabCount?'\t'.repeat(parseInt(tabCount)):'');
		
		//确定节点类型并处理元素和文本节点
		switch(this.nodeType){
			case IC.node.ELEMENT_NODE:
				//计数器加1并创建一个使用标签和计数器值表示的新变量,例如:a1,a2,a3
				if(nodeNameCounters[this.nodeName]){
					++nodeNameCounters[this.nodeName];
				}else{
					nodeNameCounters[this.nodeName]=1;
				}
				var ref = this.nodeName.toLowerCase() + nodeNameCounters[this.nodeName];
				//添加创建这个元素的DOM代码行
				domCode += tabs + 'var '+ ref +' = document.createElement(\'' + this.nodeName +'\');\n';
				
				newVariables += ' '+ ref + ';\n';
				
				//检测是否存在属性,如果是则循环遍历这些属性使用processAttribute()方法来遍历DOM树
				if(this.attributes){
					for(var i=0; i<this.attributes.length; i++){
						IC.walkTheDOMRecursive(
							processAttribute,
							this.attributes[i],
							tabCount,
							ref
						);
					}
				}
				break;
			case IC.node.TEXT_NODE:
				//检测特殊字符
				var value = (this.nodeValue?encode(this.nodeValue.trim()):'') ;
				if(value){
					//计数器加1 并创建一个txt加上计数值的新变量
					if(nodeNameCounters['txt']){
						++nodeNameCounters['txt'];
					}else{
						nodeNameCounters['txt']=1;
					}
					var ref = 'txt' + nodeNameCounters['txt'];
					//检查是否是$开头的
					value = checkForVariable(value);
					
					//添加创建这个DOM元素的DOM代码
					domCode += tabs + 'var '+ ref +' = document.createTextNode(' + value + ');\n';
					newVariables += ' '+ ref + ';\n';
				
				}else{
					return;
				}
				break;
			default:
				break;
		}
		//添加将这个节点添加到其父节点的代码
		if(refParent){
			domCode += tabs + refParent +'.appendChild('+ref+');\n'
		}
		return ref;
	}
	//最终展示的代码串
	var domCode = '';
	//自动产生的变量数组
	var nodeNameCounters = [];
	//HTML中存在的变量报告
	var requiredVariables = '';
	//自动产生的变量报告
	var newVariables = '';
	
	function generate(strHTML,strRoot){
		var domRoot = document.createElement('DIV');
		domRoot.innerHTML = strHTML;
		
		domCode = '';
		nodeNameCounters = [];
		requiredVariables = '';
		newVariables = '';
		
		var node = domRoot.firstChild;
		while(node){
			IC.walkTheDOMRecursive(processNode,node,0,strRoot);
			node = node.nextSibling;
		}
		
		domCode = '/*代码中的requiredVariables: \n'+ requiredVariables + '*/\n\n'
			+domCode +'\n\n'
			+'/* 新对象的代码: \n'+newVariables+'*/\n\n';
			return domCode;
	}
	
	window['generateDOM'] = generate;
		
})();