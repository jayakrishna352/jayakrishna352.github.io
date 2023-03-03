$(document).ready(function () {
  $("#fetch").click(function (e) {
    e.preventDefault();

    var selectedConstituency = $("#constituency").val();

    if (selectedConstituency) {
      $.ajax({
        url: "/results/fetch",
        type: "POST",
        data: {
          constituency: selectedConstituency,
        },
        success: function (response) {
          var options = response;
          console.log(response);
          var resultContainer = document.getElementById("result-container");
          var resultTable = document.createElement("table");
          resultTable.classList.add("table");
          var tableHead = document.createElement("thead");
          resultTable.appendChild(tableHead);

          var tableRow = document.createElement("tr");
          var tableData = document.createElement("td");
          tableData.setAttribute("scope", "col");

          tableData.innerHTML = "Sl. No. ";
          tableRow.appendChild(tableData);

          tableData = document.createElement("td");
          tableData.setAttribute("scope", "col");
          tableData.innerHTML = "Candidate Name";
          tableRow.appendChild(tableData);

          tableData = document.createElement("td");
          tableData.setAttribute("scope", "col");
          tableData.innerHTML = "Constituency";
          tableRow.appendChild(tableData);

          tableData = document.createElement("td");
          tableData.setAttribute("scope", "col");
          tableData.innerHTML = "Party Name";
          tableRow.appendChild(tableData);

          tableData = document.createElement("td");
          tableData.setAttribute("scope", "col");
          tableData.innerHTML = "People Vote Count";
          tableRow.appendChild(tableData);
          tableHead.appendChild(tableRow);

          var tableBody = document.createElement("tbody");

          options.forEach(function (option, index) {
            var row = document.createElement("tr");
            var td = document.createElement("td");

            td.innerHTML = index + 1;
            row.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = option[0];
            row.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = option[3];
            row.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = option[4];
            row.appendChild(td);

            td = document.createElement("td");
            var count = parseInt(option[5].hex, 16);
            td.innerHTML = count;
            row.appendChild(td);

            tableBody.appendChild(row);
          });
          resultTable.appendChild(tableBody);
          resultContainer.appendChild(resultTable);
        },
        error: function (error) {
          console.error(error);
        },
      });
    } else {
      alert("Please select a constituency");
    }
  });
});
