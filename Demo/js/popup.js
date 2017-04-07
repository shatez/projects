// Called on browser start
var baseUrl = "https://insights-chrome-ext.mybluemix.net/"

document.addEventListener('DOMContentLoaded', function() {
  console.log("excution started");
  $(".results-page").hide();

  $('#submit').click(function(event) {
    $(".loader").show();
    var text = $("#text").val();
    var wordCount = text.trim().split(/\s+/).length;
    var error = { "show": false };
    if (wordCount < 100) {
      error.show = true;
      error.message = "Please enter atleast 100 words";
      showError(error);
      return;
    }
    var sanitizedText = text.replace(/[^\x00-\x7F]/g, "");
    var sanitizedTextWordCount = sanitizedText.trim().split(/\s+/).length;
    if (sanitizedTextWordCount < 100) {
      error.show = true;
      error.message = "Please enter atleast 100 words";
      showError(error);
      return;
    }
    var data = {
      "text": sanitizedText
    }
    var res = $.post({
      url: baseUrl + "generate",
      data: data,
      success: function(data, b, c) {
        $("#results-textarea").val(data);
        $("#results-textarea").attr('readonly','readonly');
        $(".text-page").hide()
        $(".results-page").show();
        $(".loader").hide();
        console.log(b)
        console.log(c)
      }
    });
  });

  $("#close-button").click(function(event) {
    $("#error").hide();
    $("#error-msg").text("");
  });

  var showError = function(error) {
    var show = error.show;
    var message = error.message;
    $("#error").show();
    $("#error-msg").text(error.message);
  };

  $("#reset").click(function(event) {
    console.log("asdasda");
    $("#text").val("");
    $(".text-page").show()
    $(".results-page").hide();
    $("#error").hide();

  });

  $("#copy").click(function(){
    $("#results-textarea").select();
    document.execCommand('copy');
  });

});
