window.addEventListener("load", function () {
  fetch("/results/constituencies", {
    method: "POST",
    body: {},
  })
    .then((response) => response.json())
    .then((response) => {
      var options = response;
      console.log(options);
      var optionContainer = document.getElementById("constituency");
      options.forEach((option, index) => {
        var optionInput = document.createElement("option");
        optionInput.value = option;
        optionInput.innerHTML = option;
        optionContainer.appendChild(optionInput);
      });
    })
    .catch((err) => {});
});
