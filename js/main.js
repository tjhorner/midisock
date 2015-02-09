(function(){
  var midi = require("midi");
  var os = require("os");
  var gui = require("nw.gui");

  var errorTimeout;

  function goToStep(stepId){
    $(".step").fadeOut(function(){$("#step-"+stepId).fadeIn()});
  }

  function startServer(){
    http = require("http").Server();
    server = require("socket.io")(http);
    var devices = [];
    var connectedSockets = 0;

    server.on("connect", function(socket){
      connectedSockets++;
      $("#clients").text(connectedSockets);

      socket.emit("device:select");

      socket.on("device:select", function(d){
        socket.device = {};

        socket.device.name = d.name;
        socket.device.input = new midi.input();
        socket.device.output = new midi.output();

        if(os.platform() === "win32"){
          socket.device.input.openPort(midiPort);
          socket.device.output.openPort(midiPort);
        }else{
          socket.device.input.openVirtualPort("Wireless " + socket.device.name);
          socket.device.output.openVirtualPort("Wireless " + socket.device.name);
        }

        socket.on("midi:message", function(msg){
          socket.device.output.sendMessage(msg);
        });

        socket.device.input.on("message", function(delta, msg){
          socket.emit("midi:message", msg);
        });

        socket.emit("midi:ready");
      });

      socket.on("disconnect", function(){
        socket.device.input.closePort();
        socket.device.output.closePort();

        connectedSockets--;
        $("#clients").text(connectedSockets);
      });
    });

    http.listen(3000);
  }

  function error(text){
    clearTimeout(errorTimeout);
    $(".error").text(text);
    $(".error").fadeIn();
    errorTimeout = setTimeout(function(){
      $(".error").fadeOut();
    }, 3000);
  }

  function refreshMidiDevices(){
    $(".mididevices").html("");
    for(var i=0; i < input.getPortCount(); i++){
      $(".mididevices").append("<option value='"+i+"'>"+input.getPortName(i)+"</option>");
    }
  }

  var callbacks = {
    chooseMidiDevice: function(data){
      if(data.midiPort === null || undefined){
        error("Select a valid controller!");
        return false;
      }
      console.log(data);

      midiPort = parseInt(data.midiPort);
      return true;
    },
    chooseVirtualPort: function(data){
      if(data.midiPort === null || undefined){
        error("Select a valid port!");
        return false;
      }
      console.log(data);

      midiPort = parseInt(data.midiPort);
      goToStep(2);
      $(".windows-only").fadeOut(function(){$(".other-platforms").show()});
      startServer();
      return false;
    },
    test: function(data){
      return true;
    },
    chooseClient: function(){
      $(".server-only").hide();

      input = new midi.input();
      output = new midi.output();

      refreshMidiDevices();
      $(".refresh").click(refreshMidiDevices);
      return true;
    },
    chooseServer: function(){
      $(".client-only").hide();

      if(os.platform() === "win32"){
        $(".other-platforms").hide();

        input = new midi.input();
        output = new midi.output();

        refreshMidiDevices();
        $(".refresh").click(refreshMidiDevices);
      }else{
        $(".windows-only").hide();
        startServer();
      }
      return true;
    },
    exitApplication: function(){
      process.exit();
      return true;
    },
    chooseServerIp: function(data){
      if(data.serverIp === "" || undefined){
        error("Enter a valid IP address!");
        return false;
      }
      console.log(data);

      socket = io.connect("ws://" + data.serverIp);
      socket.on("connect", function(){
        $("#connectioninfo").text("Connection established");

        output.openPort(midiPort);
        socket.on("midi:message", function(msg){
          output.sendMessage(msg);
        });

        input.openPort(midiPort);
        input.on("message", function(delta, msg){
          socket.emit("midi:message", msg);
        });

        socket.on("session:name", function(){
          $("#connectioninfo").text("Sending session info...");
          socket.emit("session:name", "MIDIsock session");
        });

        socket.on("device:select", function(){
          $("#connectioninfo").text("Sending MIDI controller info...");
          socket.emit("device:select", {id: "generic", name: input.getPortName(midiPort)});
        });

        socket.on("midi:ready", function(){
          $("#connectioninfo").text("Ready!");
        });

        socket.emit("user:position", 1);

        socket.on("disconnect", function(){
          $("#connectioninfo").text("Connection closed");
        });
      });
      return true;
    }
  }

  $.each($(".step"), function(i,e){
    var $e = $(e);
    if(i !== 0) $e.hide();
    $.each($e.find(".next"), function(i2,e2){
      $(e2).click(function(){
        var callbackData = {};
        $.each($e.find("input, select"), function(i3,e3){
          $e3 = $(e3);
          callbackData[$e3.attr("data-key")] = $e3.val();
        });
        if(callbacks[$(e2).attr("data-next-callback")](callbackData)){
          $e.fadeOut(function(){$("#step-" + (i+1)).fadeIn()});
        }
      });
    });
  });

  $.each($("a[target=_browser]"), function(i,e){
    $(e).click(function(ev){
      ev.preventDefault();
      gui.Shell.openExternal($(e).attr("href"));
    });
  });
}());
