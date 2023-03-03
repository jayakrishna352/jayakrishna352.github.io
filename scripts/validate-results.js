$(document).ready(function () {
  $("#resultsForm").validate({
    rules: {
      constituency: {
        required: true,
      },
    },
    messages: {
      constituency: {
        required: "Please select a constituency",
      },
    },
    submitHandler: function (form) {
      form.submit();
    },
  });
});
