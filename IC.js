if(document.all && !document.getElementById){
	document.getElementById = function(id){
		return document.all[id];
	}
}

if(!String.repeat){
	String.prototype.repeat = function(l){
		return new Array(l+1).join(this);
	}
}

if(!String.trim){
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g,'');	
	}	
}

(function(){

	if(!window['IC']){
		window['IC'] = {};
	}
	 
	function $(){
		var elements = new Array();
		//arguments返回当前$符号传进来的一个参数的数组
		for(var i=0; i<arguments.length; i++){
			var element = arguments[i];
	
			if(typeof element == 'string'){
				element = document.getElementById(element);
			}
	
			//如果只有一个参数,就直接返回,返回一个element
			if(arguments.length==1){
				return element;
			}
			elements.push(element);
		}
		return elements;
	};
	window['IC']['$']=$;
	
	//向某一个对象添加事件
	function addEvent(node, type, listener){
		
		if(!(node = $(node))) return false;
		
		if(node.addEventListener){
			
			node.addEventListener(type, listener, false);
			return true;
		} else if(node.attachEvent){
			
			node['e'+type+listener] = listener;
			node[type+listener] = function(){node['e'+type+listener](window.event);}
			node.attachEvent('on'+type, node[type+listener]);
			return true;
		}
		return false;
	};
	window['IC']['addEvent']=addEvent;
	
	
	//通过getElementsByClassName获得类名 , tag 为加强过滤 当然什么TD下的什么什么..等..
	function getElementsByClassName(className, tag){
		parent = parent || document;
		if(!(parent = $(parent))) return false;
		
		//对tag进行过滤,把tag的对象全取出来.
		var allTags = (tag == "*" && parent.all) ? parent.all : parent.getElementsByTagName(tag);
		var matchingElements = new Array();
	
		//对className进行正则匹配
		className = className.replace(/\-/g, "\\-");
		var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");
	
		var element;
	//循环,所有tag里为className为我们的指定的对象,就把它push放到一个数据里面
		for(var i=0; i<allTags.length; i++){
			element = allTags[i];
			if(regex.test(element.className)){
				matchingElements.push(element);
			}
		}
	
		//返回这个数组
		return matchingElements;
	
	};
	window['IC']['getElementsByClassName']=getElementsByClassName;
	
	function bindFunction(obj, func){
		return function(){
			func.apply(obj,arguments);	
		}
	};
	window['IC']['bindFunction']=bindFunction;
	
	function getBrowserWindowSize(){
		var de = document.documentElement;
		
		return {
			'width'	:(
				window.innerWidth
				|| (de && de.chileWidth)
				|| document.body.clientWidth),
			'height' :(
				window.innerHeight
				|| (de && de.clientHeight)
				|| document.body.clientHeight)
			
		}
	};
	window['IC']['getBrowserWindowSize']=getBrowserWindowSize;
	
	window['IC']['node']={
		ELEMENT_NODE :1,
		ATTRIBUTE_NODE:2,
		TEXT_NODE:3,
		CDATA_SECTION_NODE:4,
		ENTITY_REFERENCE_NODE:5,
		ENTITY_NODE:6,
		PROCESSING_INSTRUCTION_NODE:7,
		COMMENT_NODE:8,
		DOCUMENT_NODE:9,
		DOCUMENT_TYPE_NODE:10,
		DOCUMENT_FRAGMENT_NODE:11,
		NOTATION_NODE:12
	}
	
	//遍历整个节点树
	function walkElementsLisner(func,node){
		var root = node || window.document;
		var nodes = root.getElementsByTagName("*");
		for(var i=0; i<nodes.length; i++){
			func.call(nodes[i]);
		}
	}
	window['IC']['walkElementsLisner']=walkElementsLisner;
	
	function walkTheDOMRecursive(func,node,depth,returnFromParent){
		var root = node || window.document;
		var returnFromParent = func.call(node,depth++,returnFromParent);
		var node = root.firstChild;
		while(node){
			walkTheDOMRecursive(func,node,depth,returnFromParent);
			node = node.nextSibling;
		}
	}
	window['IC']['walkTheDOMRecursive']=walkTheDOMRecursive;
	
	function walkTheDOMWithAttributes(node,func,depth,returnedFromParent){
		var root = node || window.document;
		returnedFromParent = func.call(root,depth++,returnedFromParent);
		if(root.attributes){
			for(var i=0; i<root.attributes.length; i++){
				walkTheDOMWithAttributes(root.attributes[i],func,depth-1,returnedFromParent);
			}
		}
		if(root.nodeType != IC.node.ATTRIBUTE_NODE){
			node = root.firstChild;
			while(node){
				walkTheDOMWithAttributes(node,func,depth,returnedFromParent);
				node = node.nextSibling;
			}
		}
	}
	window['IC']['walkTheDOMWithAttributes'] = walkTheDOMWithAttributes;
	
	function camelize(s){
		return s.replace(/-(\w)/g, function(strMatch, p1){
			return p1.toUpperCase();
		});
	}
	window['IC']['camelize'] = camelize;
})();