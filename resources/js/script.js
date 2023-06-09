$(document).ready(() => {
  // connect to socket.io
  const socket = io.connect($("#url").text());

  // join chat
  const mediaContainer = $(".media-container");

  mediaContainer.append(`
    <div class="text-center">
      <h7 class="opacity-75">You joined the chat</h7>
    </div>
  `);

  socket.emit("join", roomName);

  socket.on("join", (user) => {
    if (user) {
      mediaContainer.append(`
        <div class="text-center">
          <h7 class="opacity-75">${user} joined the chat</h7>
        </div>
      `);
    }
  });

  // left
  socket.on("leave", (user) => {
    if (user)
      mediaContainer.append(`
        <div class="text-center">
          <h7 class="opacity-75">${user} left the chat</h7>
        </div>
      `);
  });

  // scroll to last message
  function scrollLastMsgIntoView() {
    var lastMsg = $(".media-body").last().children().last();
    if (lastMsg.length > 0) {
      lastMsg[0].scrollIntoView({ behavior: "smooth" });
    }
  }

  //reset prevSocketId
  var prevSocketId = "";

  // send message
  function sendMsg(event) {
    if (event) {
      event.preventDefault();
    }
    const msgInput = $("#msg");
    const msg = msgInput.val().trim();
    if (msg) {
      socket.emit("send-message", roomName, msg);
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
      prevSocketId = "";
      scrollLastMsgIntoView();
      msgInput.val("");
    }
  }

  // receive message
  socket.on("send-message", (msg, socket, user) => {
    const mediaBodyLast = $(".media-body").last();
    const p = $("<p>").html(msg);
    // console.log(`socket: ${socket}`);
    // console.log(`prevSocketId: ${prevSocketId}`);

    if (prevSocketId != socket) {
      mediaContainer.append(` 
      <div class="media media-chat">
        <i class="pt-2 avatar fas fa-user"></i>
        <div class="media-body">
          <h6 style="margin-top: -1.05rem; margin-bottom: -0.02rem; font-size: 10px"><b>${user}</b></h6>
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
