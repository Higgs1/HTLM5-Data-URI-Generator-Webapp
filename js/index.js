$(function() {
  // erase fake file input
  $("#fakefileinput").val("");
  
  // cache javascript results to avoid extra prosessing
  var cache = {
    "seltab"   : "",  // currently selected tab
    "utf8str"  : "",  // the utf8 encoded string for text input
    "datastr"  : "",  // the encoded data in base64 for the file upload
    "mimetype" : "",  // automatically detected mime type for file upload
  }
  
  // set tab to the tab that was selected before
  var oldtab = $("#inputmethodl").val()
  if (oldtab) {
    $("#inputmethod li a[href=" + oldtab + "]").tab("show");
    cache.seltab = oldtab;
  } else {
    cache.seltab = "#fileupload";
  }
  
  // return the selected mime type
  var getmimetype = function() {
    switch ($("input[name=mimetypesel]:checked").val()) {
      case "inpt":
        return $("#mimetype").val();
      case "auto":
        return cache.seltab == "#textinput" ? "text/plain;charset=utf-8" : cache.mimetype;
    }
    return "";
  }
  
  var updatedatauri = function() {
    var datauri = "data:" + getmimetype();
    
    var b64 = $("#base64").prop("checked");
    datauri += b64 ? ";base64," : ",";
    
    switch (cache.seltab) {
      case "#textinput":
        datauri += b64 ? btoa(cache.utf8str) : encodeURIComponent($("#text").val()); 
        break;
      case "#fileupload":
        datauri += b64 ? cache.datastr : escape(atob(cache.datastr));
        break;
    }
    
    $("#datauri").html("<a href=\"" + datauri + "\" target=\"_blank\" download=\"" + $("#fakefileinput").val() + "\" title=\"Click to open the data URI in a new window.\">" + datauri + "</a>");
  }
  
  // initialize mime type input typeahead with the mime types list in mimetypes.js
  $("#mimetype").typeahead({"source": mimetypes, "items" : 8,});
  
  // mime type input method is changed
  $("input[name=mimetypesel]").change(function() {
    $("#mimetypeinpt")[$("input[name=mimetypesel]:checked").val() == "inpt" ? "show": "hide"]();
    updatedatauri();
  }).change();
  
  // select button is clicked
  $("#btn_selall").click(function() {
    selectNode($("#datauri")[0]);
  });

  // reset button is clicked
  $("#btn_reset").click(function() {
    cache.utf8str = "";
    cache.datastr = "";
    cache.mimetype = "";
    $("#fakefileinput").val("");
    $("#textinput textarea").val("");
    $("#base64").prop("checked", true);
    $("input[name=mimetypesel][value=auto]").prop("checked", true)
    $("#mimetypeinpt").hide();
    $("#mimetype").val("");
    updatedatauri();
  });
  
  // the manual mime type input is changed
  var mimetypechanged = function() {
    // update the data uri only if the manual option is chosen
    if ($("input[name=mimetypesel][value=inpt]").is(":checked")) {
      updatedatauri();
    }
  }
  $("#mimetype").keyup(mimetypechanged).change(mimetypechanged);
  
  // tab is switched
  $("#inputmethod a").on("shown", function(evt) {
    cache.seltab = $("#inputmethod li.active a").attr("href");
    $("#inputmethodl").val(cache.seltab);
    updatedatauri();
  });
  
  // base 64 encoding option is changed
  $("#base64").change(updatedatauri);
  
  // text input is modified
  $("#text").keyup(function() {
    var text = $("#text").val();
    cache.utf8str = rstr2utf8(text);
    $("#textcharlen").text(text.length);
    $("#textbytelen").text(cache.utf8str.length);
    updatedatauri();
  }).keyup();
  
  // fake file input is clicked
  $("#fakefile *").click(function() {
    $("#realfileinput").click();
  });
  
  // do not perform the default event action
  var noop = function(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  
  // file has been read by file reader
  var filereader = new FileReader();
  filereader.onload = function (e) {
    //TODO does not work with text files because mime type has an extra delimiter
    var rdup = this.result.split(",");
    cache.datastr = rdup[1];
    cache.mimetype = rdup[0].split(";")[0].split(":")[1];
    updatedatauri();
  };
  
  // a file has been selected
  var updatefiledata = function(file) {
    $("#fakefileinput").val(file.name);
    filereader.readAsDataURL(file);
  }
  
  // file is selected using file input form
  $("#realfileinput").on("change", function() {
    updatefiledata(this.files[0]);
  });
  
  // file dnd events
  var dndclass = "dnd_hover";
  var dndstop = function(e) {
    var related = e.relatedTarget, inside = false;
    if (related !== this) {
      if (related) {
        inside = $.contains(this, related);
      }
      if (!inside) {
        noop(e);
        $("#filednd").removeClass(dndclass);
      }
    }
  }
  $("#filednd").on({
    "dragenter" : function(e) {
      noop(e);
      $("#filednd").addClass(dndclass);
    },
    "dragover" : noop,
    "dragleave" : dndstop,
    "dragend" : dndstop,
    "drop" : function(e) {
      dndstop(e);
      updatefiledata(e.originalEvent.dataTransfer.files[0]);
    }
  });
});
