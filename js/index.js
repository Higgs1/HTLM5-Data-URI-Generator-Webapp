$(function() {
  // cache javascript results to avoid extra prosessing
  var cache = {
    "seltab"   : "",  // currently selected tab
    "utf8str"  : "",  // the utf8 encoded string for text input
    "datastr"  : "",  // the encoded data in base64 for the file upload
    "mimetype" : "",  // automatically detected mime type for file upload
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
  
  // set tab to the tab that was selected before
  var oldtab = $("#inputmethodl").val()
  if (oldtab) {
    $("#inputmethod li a[href=" + oldtab + "]").tab("show");
    cache.seltab = oldtab;
  }
  
  var updatedatauri = function() {
    var datauri = "data:" + getmimetype();
    
    var b64 = $("#base64").prop("checked");
    datauri += b64 ? ";base64," : ",";
    
    switch (cache.seltab) {
      case "#textinput":
        if (b64) {
          // yes, the semicolon is always present, even when the mimetype in blank
          datauri += btoa(cache.utf8str); 
        } else {
          datauri += encodeURIComponent($("#text").val()); 
        }
        break;
      case "#fileupload":
        break;
    }
    
    $("#datauri").html("<a href=\"" + datauri + "\" target=\"_blank\">" + datauri + "</a>");
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
    $("#base64").prop("checked", true);
    $("input[name=mimetypesel][value=auto]").prop("checked", true)
    $("#mimetypeinpt").hide();
    $("#mimetype").val("");
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
});
