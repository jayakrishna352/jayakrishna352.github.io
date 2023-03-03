$(document).ready(function () {
  $("#castVoteForm").submit(function (event) {
    event.preventDefault();
    fetch("/castVote/getFP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: document.getElementById("publicKey").value,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        // Check fingerprint
        if (response["fp"] === "") {
          window.location.href = "/castVote";
        } else {
          $.ajax({
            url: "https://localhost:8443/SGIMatchScore",
            type: "POST",
            data: {
              Template1: response["fp"],
              Template2: $("#fingerprint").val(),
            },
            dataType: "JSON",
            success: function (fpData) {
              console.log("Inside ajax success");
              if (fpData["ErrorCode"] === 0 && fpData["MatchingScore"] > 170) {
                console.log("Success");
                $("#matchingScore").val(fpData["MatchingScore"]);
                $("#castVoteForm").unbind("submit").submit();
              } else {
                console.log("Unsuccess!");
                alert("Fingerprint is not matching!");
              }
            },
          });
        }
      })
      .catch((error) => console.error(error));

    // window.location.href = "/castVote";
    console.log("End");
  });
});
