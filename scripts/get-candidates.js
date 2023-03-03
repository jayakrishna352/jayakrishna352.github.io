window.addEventListener("load", async function () {
  await fetch("/castVote/vote/getCandidates", {
    method: "POST",
    body: {},
  })
    .then((response) => response.json())
    .then((response) => {
      // console.log(response);
      var options = response;
      console.log(options);
      var radioContainer = document.getElementById("radio-container");
      var radioTable = document.createElement("table");
      options.forEach(function (option, index) {
        var radioFormCheck = document.createElement("div");
        radioFormCheck.classList.add("form-check");

        var radioInput = document.createElement("input");
        radioInput.classList.add("form-check-input");
        radioInput.type = "radio";
        radioInput.name = "candidate";
        radioInput.value = option[2];
        console.log(radioInput.value);
        radioInput.id = "candidate-" + (index + 1);

        var radioLabel = document.createElement("label");
        radioLabel.classList.add("form-check-label");
        radioLabel.setAttribute("for", "candidate-" + (index + 1));

        radioFormCheck.appendChild(radioInput);

        var table = document.createElement("table");
        table.classList.add("table");
        var tableBody = document.createElement("tbody");

        var row = document.createElement("tr");
        var th = document.createElement("th");
        th.setAttribute("scope", "row");
        th.innerHTML = "Candidate Name";
        row.appendChild(th);
        var name = document.createElement("td");
        name.innerHTML = option[0];
        row.appendChild(name);
        tableBody.appendChild(row);

        row = document.createElement("tr");
        th = document.createElement("th");
        th.setAttribute("scope", "row");
        th.innerHTML = "Constituency";
        row.appendChild(th);
        var constituency = document.createElement("td");
        constituency.innerHTML = option[3];
        row.appendChild(constituency);
        tableBody.appendChild(row);

        row = document.createElement("tr");
        th = document.createElement("th");
        th.setAttribute("scope", "row");
        th.innerHTML = "Party Name";
        row.appendChild(th);
        var party = document.createElement("td");
        party.innerHTML = option[4];
        row.appendChild(party);
        tableBody.appendChild(row);

        table.appendChild(tableBody);
        radioLabel.appendChild(table);

        radioFormCheck.appendChild(radioLabel);
        var tableRow = document.createElement("tr");
        tableRow.appendChild(radioFormCheck);
        radioContainer.appendChild(tableRow);
      });
    })
    .catch((error) => console.error(error));
});
