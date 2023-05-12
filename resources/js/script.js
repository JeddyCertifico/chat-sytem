$(document).ready(() => {
  // connect to socket.io
  const socket = io.connect($("#url").text());

  // scroll to last message
  function scrollLastMsgIntoView() {
    var lastMsg = $(".media-body").last().children().last();
    if (lastMsg.length > 0) {
      lastMsg[0].scrollIntoView({ behavior: "smooth" });
    }
  }

  // send message
  function sendMsg(event) {
    if (event) {
      event.preventDefault();
    }
    const mediaContainer = $(".media-container");
    const msgInput = $("#msg");
    const msg = msgInput.val().trim();
    if (msg) {
      socket.emit("send-message", msg);
      const mediaBody = $(".media-body");
      const p = $("<p>").html(msg);
      if (!mediaContainer.children().last().hasClass("media-chat-reverse")) {
        mediaContainer.append(`
          <div class="media media-chat media-chat-reverse">
            <div class="media-body">
              <p>${msg}</p>
            </div>
          </div>  `);
      } else {
        mediaBody.last().append(p);
      }
      scrollLastMsgIntoView();
      msgInput.val("");
    }
  }

  // receive message
  var prevSocketId = "";

  socket.on("send-message", (msg, socket) => {
    const mediaContainer = $(".media-container");
    const mediaBodyLast = $(".media-body").last();
    const p = $("<p>").html(msg);
    console.log(`Prev Socket: ${prevSocketId} `);
    console.log(`Socket ${socket} `);

    if (prevSocketId != socket) {
      mediaContainer.append(`
      <div class="media media-chat">
        <i class="pt-2 avatar fas fa-user"></i>
        <div class="media-body">
          <p>${msg}</p>
        </div>
      </div>
    `);
    } else {
      mediaBodyLast.append(p);
    }
    prevSocketId = socket;
    scrollLastMsgIntoView();
  });

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

  $("#name").focus();
});
