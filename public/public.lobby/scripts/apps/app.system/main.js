function System()
{
  App.call(this);

  this.name = "system";
  
  this.window.size = {width:900,height:900};
  this.window.pos = {x:300,y:30};

  this.methods.set_wallpaper = {name:"set_wallpaper",passive:true};
  this.methods.set_theme = {name:"set_theme"};
  this.methods.aquire = {name:"aquire"};

  this.widget_el = document.createElement("t"); this.widget_el.className = "toggle";

  this.setup.ready = function()
  {
    lobby.commander.install_widget(this.app.widget_el);

    var app = this.app;
    app.widget_el.addEventListener("mousedown", function(){ app.window.toggle() }, true);
    
    this.app.when.resize();
  }

  this.setup.start = function()
  {
    this.app.update();
    this.app.window.organize.fill();
  }

  this.aquire = function()
  {
    lobby.commander.get_tree();
  }

  this.update = function()
  {
    var html = ""

    for(app_id in lobby.apps){
      var app = lobby.apps[app_id];
      if(app_id != "ronin" && app_id != "marabu" && app_id != "ide" && app_id != "twitter"){ continue; }
      html += app.IO.sprite();
      // Draw routes
      for(route_id in app.IO.routes){
        var route = app.IO.routes[route_id];
        console.log(app.name+" route:",route);
      }
    }

    // html += "<line x1='150' y1='180' x2='300' y2='255' stroke='black' stroke-width='2'/>"

    html += "<line x1='420' y1='180' x2='300' y2='390' stroke='black' stroke-width='2'/>"

    html += "<line x1='150' y1='180' x2='600' y2='135' stroke='black' stroke-width='2'/>"

    this.wrapper_el.innerHTML = '<svg width="'+this.window.size.width+'" height="'+this.window.size.height+'" class="fh" style="fill:black; stroke:none; stroke-linecap:butt; font-size:11px">'+html+'</svg>';
  }

  this.on_input_change = function(value)
  {
    if(value.split(" ")[0] == "system.set_wallpaper"){
      var val = value.split(" "); val.shift(); val = val.join(" ").trim();
      this.set_wallpaper(val,true);
    }
  }

  this.when.resize = function()
  {
    this.app.widget_el.innerHTML = lobby.window.size.width+"x"+lobby.window.size.height;
  }

  this.set_wallpaper = function(val, is_passive = false)
  {
    if(is_passive){
      lobby.commander.show_browser();
      lobby.commander.browse_candidates(val,["jpg","png"]);
      return;
    }
    lobby.commander.hide_browser();
    lobby.wallpaper_el.style.backgroundImage = "url(/"+lobby.commander.select_candidate(val,["jpg","png"]).replace('/public','')+")";
    lobby.commander.notify("Updated Wallpaper")   
  }

  this.set_theme = function()
  {

  }

  this.status = function()
  {
    var app_count = 0;
    for(app_id in lobby.apps){
      app_count += 1;
    }

    return app_count+" Applications";
  }
}

lobby.summon.confirm("System");
