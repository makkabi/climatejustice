document.addEventListener("DOMContentLoaded", initWimmelPicture);

function initWimmelPicture() {

  sortSvgOutlines();
  const outlinesSvg = document.querySelector(".wimmel__outlines");
  outlinesSvg.addEventListener("click", handleOutlineClick);
  outlinesSvg.addEventListener("keydown", handleKeydown);

  for (const outline of document.querySelectorAll(".wimmel__outlines > g")) {
    outline.tabIndex = "0";
    outline.addEventListener("focus", e => {
      clearAllOutlines();
      e.currentTarget.classList.add("focus");
    });
    outline.addEventListener("focusout", e =>
      e.currentTarget.classList.remove("focus")
    );
  }

  createLegendFromObject();
}

function handleOutlineClick(e) {
  clearAllOutlines();
  const clickedElement = e.target;
  const clickedOutline = clickedElement.closest(".wimmel__outlines > g");
  if (!clickedOutline) {
    return;
  }

  clickedOutline.classList.add("wimmel__outline--clicked");
  clickedOutline.classList.remove("focus");
}

function handleKeydown(e) {
  // I know .keyCode is deprecated, but it will work 100% in all relevant browsers
  if (e.keyCode === 27) {
    // Escape
    clearAllOutlines();
    return;
  }
  if (![13, 32].includes(e.keyCode)) {
    // Space or Enter
    return;
  }

  const focusedElement = e.target;
  const focusedOutline = focusedElement.closest(".wimmel__outlines > g");
  if (!focusedOutline) {
    return;
  }
  clearAllOutlines();
  focusedOutline.classList.add("wimmel__outline--clicked");
  e.preventDefault();
}

function clearAllOutlines() {
  for (const outline of document.querySelectorAll(
    ".wimmel__outline--clicked"
  )) {
    outline.classList.remove("wimmel__outline--clicked");
  }
}

function createLegendFromObject() {
  let html = "";
  for (const { id, title, text } of descriptions) {
    const descriptionHtml = `
    <article class="legend__description" id="info${id}">
    <h3>${id}. ${title}</h3>
    <p>${text}</p>
</article>
    `;
    html += descriptionHtml;
  }

  document
    .querySelector(".legend__descriptions")
    .insertAdjacentHTML("beforeend", html);
}


function sortSvgOutlines(){

  const outlines = [...document.querySelectorAll(".wimmel__outlines > g")];

  outlines.sort((a, b) => {
    const aId = parseInt(a.id.substr(2));
    const bId = parseInt(b.id.substr(2));
    if(aId < bId){
      return - 1;
    } else if (aId > bId){
      return 1;
    } else {
      return 0;
    }
  });

  const outlinesSvgContainer = document.querySelector(".wimmel__outlines");

  outlinesSvgContainer.innerHTML = "";

  for(const outline of outlines){
    outlinesSvgContainer.insertAdjacentElement("beforeend", outline);
  }

}
