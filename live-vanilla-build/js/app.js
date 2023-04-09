const menu = document.querySelector(".menu");
const menuItems = document.querySelector(".items");

menu.addEventListener("click", (event) => {
  menuItems.classList.toggle("hidden");
});
