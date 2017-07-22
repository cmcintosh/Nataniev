function Editor()
{
	App.call(this);

  this.name = "editor";
  this.size = {width:420,height:420};
  this.origin = {x:120,y:120};
  this.theme = "noir";
  this.methods.new = {name:"new"};
  this.methods.load = {name:"load"};
  this.methods.save = {name:"save"};

  this.tree = null;

  this.browser_el = document.createElement("yu"); this.browser_el.className = "full";
  this.navi_el = document.createElement("yu"); this.navi_el.className = "at al lh15 w4";
  this.status_el = document.createElement("yu"); this.status_el.className = "pa ab al lh30 w4 mb15 ml wf f9";

  this.textarea_el = document.createElement("textarea"); this.textarea_el.className = "wf_7 pl5 pa hf_3 sl pdl";
  this.textarea_el.style.display = "none";
  this.wrapper_el.appendChild(this.textarea_el);
  this.wrapper_el.appendChild(this.browser_el);
  this.wrapper_el.appendChild(this.navi_el);
  this.wrapper_el.appendChild(this.status_el);

  this.textarea_el.setAttribute("autocomplete","off")
  this.textarea_el.setAttribute("autocorrect","off")
  this.textarea_el.setAttribute("autocapitalize","off")
  this.textarea_el.setAttribute("spellcheck","false")
  this.textarea_el.setAttribute("type","text")

  this.textarea_el.addEventListener('input', text_change, false);

  function text_change()
  {
    lobby.apps.editor.update_navi();
  }

  this.location = "";

  this.clear = function()
  {
    this.location = null;
    this.browser_el.innerHTML = "Nothing to see..";    
    this.resize_window_to(600,30);
  }

  this.on_input_change = function(value)
  {
    if(value.split(" ")[0] == "editor.save"){
      if(this.location){
        this.browser_el.innerHTML = "Overwrite "+this.location;
      }
      else{
        this.browser_el.innerHTML = "No file selected.";  
      }
    }
    else if(value.split(" ")[0] == "editor.load"){
      this.update_browser(value);    
      this.view_browser();  
    }
  }

  this.view_editor = function()
  {
    this.textarea_el.style.display = "block";
    this.navi_el.style.display = "block";
    this.status_el.style.display = "block";  
    this.browser_el.style.display = "none";    

    this.organize_window_center();
    this.update_navi();
  }

  this.view_browser = function()
  {
    this.textarea_el.style.display = "none";
    this.navi_el.style.display = "none";
    this.browser_el.style.display = "block";
  }

  this.update_browser = function(value = null)
  {
    var targets = value.trim().split(" "); targets.shift();
    var candidates = this.candidates_from_string(targets);

    var html = "";
    if(candidates.length < 1){
      html += "No candidates found."
    }
    else{
      for(candidate_id in candidates){
        html += "<ln class='lh15 "+(candidate_id == candidates.length-1 ? 'bf f0' : 'ff')+"'>"+candidates[candidate_id]+'</ln>';
      }  
      var target_height = (candidates.length * 15)+60;
      this.resize_window_to(420,target_height > 300 ? 300 : target_height)
    }
    this.browser_el.innerHTML = html;
  }

  this.on_launch = function()
  {
    this.update_tree();
  }

  this.update_tree = function()
  {
    this.call("get_tree");
  }

  this.load = function(value)
  {
    var targets = value.trim().split(" ");
    var candidates = this.candidates_from_string(targets);
    var target = candidates[candidates.length-1];

    this.location = target;

    var app = this;
    $.ajax({url: '/editor.load',
      type: 'POST', 
      data: { file_path: this.location },
      success: function(data) {
        app.textarea_el.value = data;
        app.textarea_el.style.display = "block";
        app.navi_el.style.display = "block";
        app.browser_el.style.display = "none";
        app.organize_window_center();
        app.update_navi();
      }
    })
  }

  this.save = function()
  {
    if(!this.location){ return; }

    $.ajax({url: '/editor.save',
      type: 'POST', 
      data: { file_path: this.location, file_content: this.textarea_el.value },
      success: function(data) {
        console.log(data);
      }
    })

    this.textarea_el.style.display = "block";
    this.navi_el.style.display = "block";
    this.browser_el.style.display = "none";
    this.organize_window_center();
  }

  this.call_back = function(m,r)
  {
    if(m == "get_tree"){ this.callback_tree(r); }
  }

  this.callback_tree = function(r)
  {
    this.tree = r[0].payload;

    var html = "";
    for(file_id in this.tree){
      html += this.tree[file_id]+"\n";
    }
    this.textarea_el.value = html;
  }

  this.update_navi = function()
  {
    var lines = this.textarea_el.value.split("\n");

    var html = "";

    for(line_id in lines)
    {
      var line = lines[line_id];
      var marker = line.trim().split(" ")[0];
      var targets_minor = ["def","attr_accessor","function"];
      var targets_major = ["class","module"];
      var targets_miscs = ["private"];
      if(targets_major.indexOf(marker) > -1){
        var name = line.replace(marker,"").trim().split(" ")[0].substr(0,14);
        html += "<ln>"+name+"</ln>";
      }
      if(targets_minor.indexOf(marker) > -1){
        var name = line.replace(marker,"").trim().split(" ")[0].substr(0,14);
        html += "<ln class='f9'>"+name+"</ln>";
      }
      if(targets_miscs.indexOf(marker) > -1){
        var name = line.trim().split(" ")[0].substr(0,14);
        html += "<ln class='f5'>"+name+"</ln>";
      }
    }

    html += "<ln class='di mt f3'>L"+lines.length+"</ln>"
    this.navi_el.innerHTML = html;

    this.update_status();
  }

  this.update_status = function()
  {
    this.status_el.innerHTML = this.location;
  }

  this.candidates_from_string = function(targets)
  {
    var candidates = [];
    for(file_id in this.tree){
      var file_name = this.tree[file_id];

      var found = 0;
      for(target_id in targets){
        var target = targets[target_id];
        if(file_name.indexOf(target) > -1){ found += 1; }
      } 
      if(found == targets.length){
        candidates.push(file_name);   
      }
    }
    return candidates;
  }

  this.key_escape = function()
  { 
    if(this.location){
      this.view_editor();
    }
    else{
      this.view_browser();
    }
    lobby.commander.notify("hello!");
  }
}

lobby.install_callback("Editor");