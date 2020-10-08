const socket = io();

// Elements
const $messageForm = document.querySelector("#form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template")
  .innerHTML;

socket.on("countUpdated", (count) => {
  console.log("The count has been updated", count);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  // disable

  const data = e.target.elements.message.value;

  socket.emit("sendMessage", data, (error) => {
    // enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log("The message delivered");
  });
});

socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render($locationTemplate, {
    link: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit(
        "sendLocation",
        `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
        () => {
          console.log("location shared!");
        }
      );
      $locationButton.removeAttribute("disabled");
    },
    (e) => {
      console.log(e);
    }
  );
});
