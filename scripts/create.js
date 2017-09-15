/*
Controls behavior in form.hbs when rendered
Functions:
	addSection -- for precondition only
	addPre -- called by onclick -> calls addSection
	addSched -- will be called if multiple schedules is enabled
	changeActive -- called by onclick -> calls switchActive
	switchActive -- switches div between hidden and active
	removeExtra -- removes excluded divs after submit
	verify -- called by submit, and submits, to force required elements remove commented
	changeExclude -- switches between exclude and include
	checkRequired -- disabled, enable to force required elements
*/


var precondition_count = 0;
var schedule_count = 0;

/*
Adds new section to body of html
Adds sub navigation element and div element
For div element, edits input names to be unique
Requires: 
	section.div to have valid div element that serves as an example to copy
 	section.name, and section.count 
 	item is the object that was clicked on in the event 
*/
function addSection(section, item){
	try{
		var id = section.name + section.count;
		//Nav Element
		var n_li = document.createElement("li");
		var n_txt = document.createTextNode(id);
		n_li.appendChild(n_txt);
		item.parentNode.appendChild(n_li);
		n_li.setAttribute("class","");
		n_li.setAttribute("value",id);
		n_li.setAttribute("id",id+"_nav");
		n_li.setAttribute("onclick","changeActive(this)");
		
		//Form Element
		var p_div = document.getElementById(section.div);
		var n_div = document.createElement("div");
		n_div.innerHTML = p_div.innerHTML;
		p_div.parentNode.appendChild(n_div);
		n_div.setAttribute("class","hide");
		n_div.setAttribute("id",id+"_div");
		n_div.setAttribute("name",section.name);
		try{
			var children = n_div.childNodes[1].childNodes;
			for(var i in children){
				
				if(children[i].nodeName == "SELECT" || children[i].nodeName == "INPUT"){
					var stub = children[i].getAttribute("id");
					var name = section.name + "[" + section.count + "][" + stub + "]";
					children[i].setAttribute("id", id + "_" +stub);
					children[i].setAttribute("name", name);
				}else if(children[i].nodeName == "H3"){
					children[i].innerHTML = id;
				}
				
			}
		}catch(err){
			throw err;
		}
		
		changeActive(n_li);
	}catch(err){
		throw err;
	}
}

//onclick Event
function addPre(item){
	var section = new Object;
	section.count = precondition_count;
	section.div = "precondition_ex";
	section.name = "precondition";
	addSection(section, item);
	precondition_count ++;
}

function addSched(item){
	var section = new Object;
	section.count = schedule_count;
	section.div = "schedule_ex";
	section.name = "schedule";
	addSection(section, item);
	schedule_count ++;
	
}


//onclick Event
function changeActive(item){
	try{
		if(item.getAttribute('onclick')=="changeActive(this)"){
			var list = item.parentNode.childNodes;
			for(var i in list){
				if(list[i].nodeName =="LI"){
					if(list[i].classList.contains("active")){
						switchActive(list[i]);
					}//end if active
				}//end if li
			}//end for length
			switchActive(item);	
		}
	}catch(err){
		throw err;
	}
}
function switchActive(item){
	try{
		var div = document.getElementById(item.getAttribute('value')+"_div");
		if(item.classList.contains("active")){
			item.classList.remove("active");
			div.classList.remove("active");
			div.classList.add("hide");
		}else{
			item.classList.add("active");
			div.classList.add("active");
			div.classList.remove("hide");
		}
	}catch(err){
		throw err;
	}
}
function removeExtra(section){
	var item = document.getElementById(section + "_div").children
	for(var i in item){
		if(item[i].nodeName =="DIV"){
			if(item[i].classList.contains("Exclude")){
				item[i].parentNode.removeChild(item[i]);
			}
		}
	}
}
function verify(){
	var data = [];
	
	//Save all input to array
	var collection = document.getElementsByTagName("INPUT");
	collection += document.getElementsByTagName("SELECT");
	
	for(var i in collection){
		data.push(collection[i]);
	}

	removeExtra("precondition");
	removeExtra("schedule");
	//remove to enable required
	document.getElementsByTagName("FORM")[0].submit();
/***************************************************************
 	var alert_val = "false";
 	
	while(data.length != 0){
		var item = data.pop();
		if(item.id && item.id.indexOf("_")==0){
			item.parentNode.removeChild(item);
		}else if(item.type && item.type == "submit"){
			//do nothing
		}else{	

			//verify
			if(checkRequired(item, alert_val) == "true"){
				alert_val = "true";
			}
		}
	}
	if(alert_val =="false"){
		document.getElementsByTagName("FORM")[0].submit();
	}
******************************************************************/
}

function changeExclude(item){
	try{
		var str = "Exclude";
		var opt = "false";
		if(item.parentNode.parentNode.classList.contains(str)){
			item.parentNode.parentNode.classList.remove(str);
		}else{
			item.parentNode.parentNode.classList.add(str);
			str = "Include";
			opt = "true";
		}
		item.setAttribute("value",str);
		var children = item.parentNode.childNodes;
		for(var i in children){
			if(children[i].nodeName == "SELECT" || children[i].nodeName == "INPUT"){
				if(children[i].getAttribute("data-optional")){
					children[i].setAttribute("data-optional",opt);
				}	
			}
		}
	}catch(err){
		throw err;
	}
}
 
/*
*************************************************************************
 Temporarily Disabled
 
function checkRequired(item, alert_val){
	var str = item.parentNode.parentNode.id;
	var nav = document.getElementById(str.substr(0, str.indexOf("_div")) + "_nav");
	
	if(item.getAttribute("data-optional")=="false"){
		item.setAttribute("required","required");
		if(item.value == ""){
			nav.classList.add("required");
			if(alert_val == "false"){
				alert("You must fill all required fields");
				var str = item.parentNode.parentNode.id;
				if(str.indexOf("precondition")==0){
					changeActive(document.getElementById("precondition_nav"));
				}
				str = str.substr(0, str.indexOf("_div"));
				str += "_nav";
				var nav = document.getElementById(str);
				changeActive(nav);
				return "true";
			}
		}
	}
	return "false";
}
*************************************************************************************
*/

