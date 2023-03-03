$(document).ready(function () {
  $("#registerForm").validate({
    rules: {
      name: "required",
      dob: {
        required: true,
        minAge: 18,
      },
      idNum: {
        required: true,
        minlength: 12,
        maxlength: 12,
        digits: true,
      },
      mobileNum: {
        required: true,
        minlength: 10,
        maxlength: 10,
        digits: true,
      },
      fingerprint: "required",
      state: "required",
      district: "required",
      constituency: "required",
    },
    messages: {
      name: "Please enter your name",
      dob: {
        required: "Please enter your date of birth",
        maxlength: "You must be at least 18 years old",
      },
      idNum: {
        required: "Please enter your identity number",
        minlength: "Identity number should be 12 digits",
        maxlength: "Identity number should be 12 digits",
        digits: "Identity number should be numeric",
      },
      mobileNum: {
        required: "Please enter your indian mobile number (10 digit)",
        minlength: "Mobile number should be 10 digits",
        maxlength: "Mobile number should be 10 digits",
        digits: "Mobile number should be numeric",
      },
      fingerprint: "Please enroll your fingerprint",
      state: "Please enter the state you belong",
      district: "Please enter the district",
      constituency: "Please enter your constituency",
    },
    errorElement: "div",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      element.closest(".form-group").append(error);
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
    submitHandler: function (form) {
      // your form submission code here
      // for example, form.submit() or an AJAX call
      form.submit();
    },
  });

  $.validator.addMethod(
    "minAge",
    function (value, element, minAge) {
      var today = new Date();
      var birthDate = new Date(value);
      var age = today.getFullYear() - birthDate.getFullYear();

      if (age < minAge) {
        return false;
      }
      return true;
    },
    "You must be at least 18 years old."
  );
});
