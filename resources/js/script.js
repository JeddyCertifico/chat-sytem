$(document).ready(() => {
  function scrollLastMsgIntoView() {
    var lastMsg = $(".media-body").last().children().last();
    if (lastMsg.length > 0) {
      lastMsg[0].scrollIntoView({ behavior: "smooth" });
    }
  }

  function sendMsg(event) {
    if (event) {
      event.preventDefault();
    }
    const msgInput = $("#msg");
    const msg = msgInput.val().trim();
    if (msg) {
      const mediaBody = $(".media-body");
      const p = $("<p>").html(msg);
      if (mediaBody.length > 0) {
        mediaBody.last().append(p);
        msgInput.val("");
        scrollLastMsgIntoView();
      }
    }
  }

  $("#msg").focus();
  scrollLastMsgIntoView();

  $("#myModal").modal("show");

  const sendBtn = $("#send");
  const msgInput = $("#msg");

  sendBtn.click((event) => {
    event.preventDefault();
    $("#msg").focus();
    sendMsg();
  });

  msgInput.keyup((event) => {
    if (event.key === "Enter") {
      sendMsg();
    }
  });

  // modal
  $("#submit").click(() => {
    const name = $("#name").val();
    $(".modal-title").html(`Hello ${name}.`);
  });

  $("#name").focus();
});