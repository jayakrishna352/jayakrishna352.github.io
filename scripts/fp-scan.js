var button = document.getElementById("fpbtn");

button.addEventListener("click", function () {
  const Url = "https://localhost:8443/SGIFPCapture";
  $.ajax({
    url: Url,
    type: "POST",
    data: {},
    dataType: "JSON",
    success: function (result) {
      let val = JSON.stringify(result);
      if (result["ErrorCode"] === 0) {
        // console.log(val);
        document.getElementById("fingerprint").value = result["TemplateBase64"];
      } else {
        // console.log(`Error: ${val}`);
      }
    },
    error: function (error) {
      console.error(`Error: ${JSON.stringify(error)}`);
    },
  });
});

// $(document).ready(function () {
//   const Url = "https://localhost:8000/SGIFPCapture";
//   $("#fpbtn").click(function () {
//     $.ajax({
//       url: Url,
//       type: "POST",
//       data: {},
//       dataType: "JSON",
//       success: function (result) {
//         console.log(result);
//       },
//       error: function (error) {
//         console.error("Error ${error}");
//       },
//     });
//   });
// });

// // Get the button by its ID
// var button = document.getElementById("fpbtn");

// // Add an event listener to the button that listens for a click
// button.addEventListener("click", function () {
//   // Create an object with the data to send

//   // Use the Fetch API to make a POST request
//   fetch("https://localhost:8000/SGIFPCapture", {
//     method: "POST",
//     // headers: {
//     //   "Content-Type": "JSON",
//     // },
//   })
//     .then((response) => {
//       if (response.ok) {
//         console.log(JSON.stringify(response.json()));
//         // return response.json();
//       } else {
//         // throw new Error("Error occurred, status code: " + response.status);
//         console.log(response.status);
//       }
//     });
//     // .then((data) => {
//     //   console.log(JSON.stringify(response.json()));
//     // })
//     // .catch((error) => {
//     //   console.error(error);
//     // });
// });
