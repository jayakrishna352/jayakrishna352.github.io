window.addEventListener("popstate", function () {
  fetch("/logout", {
    method: "GET",
    credentials: "include",
  });
});
