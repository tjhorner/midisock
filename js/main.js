(function(){
  var midi = require("midi");

  var errorTimeout;

  function goToStep(stepId){
    $(".step").fadeOut(function(){$("[data-step-id="+stepId+"]").fadeIn()});
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
    $("#mididevices").html("");
    for(var i=0; i < input.getPortCount(); i++){
      $("#mididevices").append("<option value='"+i+"'>"+input.getPortName(i)+"</option>");
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
    test: function(data){
      console.log(WebSocket);
      return true;
    },
    chooseClient: function(){
      $(".server-only").hide();

      input = new midi.input();
      output = new midi.output();

      refreshMidiDevices();
      $("#refresh").click(refreshMidiDevices);
      return true;
    },
    chooseServer: function(){
      $(".client-only").hide();
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
}());
