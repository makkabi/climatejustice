document.addEventListener("DOMContentLoaded", initWimmelPicture);

function initWimmelPicture() {
  initWimmelDialog();
  // addLinkToOutlines();
  // sortSvgOutlines();
  // addDescriptionsNavigation();
  addAriaAttributesToOutlineLinks();
  const outlinesSvg = document.querySelector(".wimmel__outlines");
  // Toggle mousedown class to prevent .focus class when elements are clicked.
  outlinesSvg.addEventListener("mousedown", handleOutlineMouseDown);
  outlinesSvg.addEventListener("mouseup", handleOutlineMouseUp);

  outlinesSvg.addEventListener("click", handleOutlineClick);

  outlinesSvg.addEventListener("keydown", handleKeydown);

  for (const outline of document.querySelectorAll(".wimmel__outlines > g")) {
    outline.addEventListener("focus", e => {
      clearAllOutlines();
      if (e.currentTarget.classList.contains("mousedown")) {
        return;
      }
      e.currentTarget.classList.add("focus");
      // Scroll the element into view. (.scrollIntoView() didn't work).
      const position = e.currentTarget.getBoundingClientRect();
      window.scrollTo(
        position.left - window.innerWidth / 2,
        position.top - window.innerHeight / 2
      );
    });
    outline.addEventListener("focusout", e =>
      e.currentTarget.classList.remove("focus")
    );
  }

  // createLegendFromObject();
}

function initWimmelDialog() {
  const dialog = document.querySelector(".dialog");

  if (!window.HTMLDialogElement) {
    const script = document.createElement("script");
    script.src = "js/src/dialog-polyfill.js";
    script.onload = function() {
      if (dialog && window.dialogPolyfill) {
        window.dialogPolyfill.registerDialog(dialog);
      }
    };
    document.head.append(script);
  }

  dialog.customShowModal = function() {
    document.body.classList.add("open-modal-dialog");
    this.showModal();
    document.body.addEventListener("click", dialog.closeDialogOnOutsideClick);
  };

  dialog.closeDialogOnOutsideClick = function(e) {
    const dialogContent = e.target.closest(".dialog__content");

    if (!dialogContent && dialog.open) {
      // Removing the eventListener won't work if the event is still being processed
      e.stopPropagation();
      dialog.close();
    }
  };

  dialog.addEventListener("close", () => {
    document.body.classList.remove("open-modal-dialog");
    document.body.removeEventListener(
      "click",
      dialog.closeDialogOnOutsideClick
    );
  });
}

function handleOutlineMouseDown(e) {
  const clickedElement = e.target;
  const clickedOutline = clickedElement.closest(".wimmel__outlines > g");
  if (!clickedOutline) {
    return;
  }
  clickedOutline.classList.add("mousedown");
}

function handleOutlineMouseUp(e) {
  const outlines = e.currentTarget.querySelectorAll(".mousedown");
  for (const outline of outlines) {
    outline.classList.remove("mousedown");
  }
}

function handleOutlineClick(e) {
  // Prevent scrolling to link target
  e.preventDefault();
  const clickedElement = e.target;
  const clickedOutline = clickedElement.closest(".wimmel__outlines > g");
  if (
    !clickedOutline ||
    clickedOutline.classList.contains("wimmel__outline--clicked")
  ) {
    clearAllOutlines();
    return;
  }
  clearAllOutlines();
  clickedOutline.classList.add("wimmel__outline--clicked");
  clickedOutline.classList.remove("focus");
  const id = clickedOutline.dataset.infoid;
  // Prevent modal from beeing immediately closed again.
  e.stopPropagation();
  openModal(id);
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
  const id = focusedOutline.dataset.infoid;
  // Prevent modal from beeing immediately closed again.
  e.stopPropagation();
  openModal(id);
}

function clearAllOutlines() {
  for (const outline of document.querySelectorAll(
    ".wimmel__outline--clicked"
  )) {
    outline.classList.remove("wimmel__outline--clicked");
  }
}

function openModal(selectedId) {
  console.log(selectedId);
  selectedId = parseInt(selectedId);

  const description = descriptions.find(({ id }) => id === selectedId);
  console.log(description);
  if (!description) {
    return;
  }

  const dialog = document.querySelector(".dialog");

  dialog.querySelector(".dialog__title").innerHTML = description.title;
  dialog.querySelector(".dialog__text").innerHTML = description.text;

  dialog.customShowModal();
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

function sortSvgOutlines() {
  const outlines = [...document.querySelectorAll(".wimmel__outlines > g")];

  outlines.sort((a, b) => {
    const aId = parseInt(a.id.substr(2));
    const bId = parseInt(b.id.substr(2));
    if (aId < bId) {
      return -1;
    } else if (aId > bId) {
      return 1;
    } else {
      return 0;
    }
  });

  const outlinesSvgContainer = document.querySelector(".wimmel__outlines");

  outlinesSvgContainer.innerHTML = "";

  for (const outline of outlines) {
    outlinesSvgContainer.insertAdjacentElement("beforeend", outline);
  }
}

function addLinkToOutlines() {
  const outlines = [...document.querySelectorAll(".wimmel__outlines > g")];

  for (const outline of outlines) {
    const id = parseInt(outline.dataset.infoid);
    const info = descriptions.find(description => description.id === id);
    if (info) {
      const outlineContent = outline.innerHTML;
      const linkHtml = `<title>${info.title}</title><a aria-label="${info.title}" href="#info${info.id}">${outlineContent}</a>`;
      outline.innerHTML = linkHtml;
    }
  }
}

function addDescriptionsNavigation() {
  const linksHtml = descriptions
    .map(
      ({ id, title }) =>
        `<li class="legend__nav__list-item"><a class="legend__nav__link" href='#info${id}'>${title}</a></li>`
    )
    .join("");

  document.querySelector(".legend__nav__list").innerHTML = linksHtml;
}

function addAriaAttributesToOutlineLinks() {
  for (const link of document.querySelectorAll(".wimmel__outlines > g > a")) {
    link.setAttribute("role", "button");
    link.setAttribute("aria-haspopup", true);
  }
}
