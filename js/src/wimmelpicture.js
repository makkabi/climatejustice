document.addEventListener("DOMContentLoaded", initWimmelPicture);

function initWimmelPicture() {
  initWimmelDialog();

  document.querySelector(".use-svg").addEventListener("click", e => {
    document
      .querySelector(".wimmel__picture")
      .insertAdjacentHTML(
        "afterbegin",
        "<source type='image/svg+xml' srcset='img/climatejustice-wimmelpicture_by_foxitalic.svg'>"
      );
    e.currentTarget.disabled = true;
  });

  // sortSvgOutlines();

  addAriaAttributesToOutlineLinks();
  const outlinesSvg = document.querySelector(".wimmel__outlines");
  // Toggle mousedown class to prevent .focus class when elements are clicked.
  outlinesSvg.addEventListener("mousedown", handleOutlineMouseDown);
  outlinesSvg.addEventListener("mouseup", handleOutlineMouseUp);

  outlinesSvg.addEventListener("click", handleOutlineClick);

  outlinesSvg.addEventListener("keydown", handleKeydown);

  for (const outlineLink of document.querySelectorAll(
    ".wimmel__outlines > g > a"
  )) {
    outlineLink.addEventListener("focus", e => {
      // Only add focus class if the element hasn't received the focus by mousedown
      if (e.currentTarget.classList.contains("mousedown")) {
        return;
      }
      e.currentTarget.classList.add("focus");
      // Scroll the element into view. (.scrollIntoView() didn't work).
      const position = e.currentTarget.getBoundingClientRect();
      window.scrollTo(
        position.left +
          position.width / 2 -
          window.innerWidth / 2 +
          window.scrollX,
        position.top +
          position.height / 2 -
          window.innerHeight / 2 +
          window.scrollY
      );
    });
    outlineLink.addEventListener("focusout", e =>
      e.currentTarget.classList.remove("focus")
    );
  }
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

    // Return focus after closing dialog
    const lastFocusedLink = document.querySelector(".keypressed");
    if (lastFocusedLink) {
      lastFocusedLink.focus();
    }
    for (const link of document.querySelectorAll(".keypressed")) {
      link.classList.remove("keypressed");
    }
  });

  dialog
    .querySelector(".dialog__content")
    .addEventListener("click", handleDialogLinkClick);
}

function handleDialogLinkClick(e) {
  const clickedElement = e.target;

  const clickedLink = clickedElement.closest("a");
  if (!clickedLink) {
    return;
  }

  // The href attribute includes the full url
  const idStart = clickedLink.href.indexOf("#info");
  if (!Number.isInteger(idStart)) {
    return;
  }
  const id = parseInt(clickedLink.href.substr(idStart + 5));

  if (!id) {
    return;
  }

  setDialogContent(id);
  e.preventDefault();
  e.stopPropagation();
}

function handleOutlineMouseDown(e) {
  const clickedElement = e.target;
  const clickedOutlineLink = clickedElement.closest(
    ".wimmel__outlines > g > a"
  );
  if (!clickedOutlineLink) {
    return;
  }
  // Class will prevent adding the .focus class
  clickedOutlineLink.classList.add("mousedown");
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
  const clickedOutlineLink = clickedElement.closest(
    ".wimmel__outlines > g > a"
  );
  if (!clickedOutlineLink) {
    return;
  }

  clickedOutlineLink.classList.remove("focus");
  const id = clickedOutlineLink.closest("g").dataset.infoid;
  // Prevent modal from beeing immediately closed again.
  e.stopPropagation();
  setDialogContent(id);
  document.querySelector(".dialog").customShowModal();
}

function handleKeydown(e) {
  // I know .keyCode is deprecated, but it will work 100% in all relevant browsers

  if (![13, 32].includes(e.keyCode)) {
    // Space or Enter
    return;
  }

  const focusedElement = e.target;
  const focusedOutlineLink = focusedElement.closest(
    ".wimmel__outlines > g > a"
  );
  if (!focusedOutlineLink) {
    return;
  }
  focusedOutlineLink.classList.add("keypressed");
}

function setDialogContent(selectedId) {
  selectedId = parseInt(selectedId);

  const description = descriptions.find(({ id }) => id === selectedId);

  if (!description) {
    return;
  }

  const dialog = document.querySelector(".dialog");

  dialog.querySelector(".dialog__title").innerHTML = description.title;
  dialog.querySelector(".dialog__text").innerHTML = description.text;
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

function addAriaAttributesToOutlineLinks() {
  for (const link of document.querySelectorAll(".wimmel__outlines > g > a")) {
    link.setAttribute("role", "button");
    link.setAttribute("aria-haspopup", true);
  }
}
