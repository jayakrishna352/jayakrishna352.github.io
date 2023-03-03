$(document).ready(function () {
  $("#voteForm").validate({
    rules: {
      candidate: {
        required: true,
      },
    },
    messages: {
      candidate: {
        required: "Please select a candidate",
      },
    },
    submitHandler: function (form) {
      form.submit();
      console.log("Success!");
    },
  });
});
