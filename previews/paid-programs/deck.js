(() => {
  const WIDTH = 1920;
  const HEIGHT = 1080;

  const stage = document.getElementById("stage");
  const slides = Array.from(stage.querySelectorAll(".slide"));
  const notes = document.getElementById("notes");
  const counter = document.getElementById("counter");
  const viewer = document.getElementById("viewer");
  const viewerImage = viewer.querySelector("img");

  // Enlarged screenshots fill up to this share of the window, and never grow past twice their captured size.
  const VIEWER_WIDTH = 0.96;
  const VIEWER_HEIGHT = 0.92;
  const VIEWER_MAX_ZOOM = 2;

  // Notes show one sentence per paragraph, except that a question keeps the sentences that answer it, up to the
  // next question, in its own paragraph. Browsers without a sentence splitter break after . ? or ! and a space.
  const sentenceSplitter = "Segmenter" in Intl ? new Intl.Segmenter("en-CA", { granularity: "sentence" }) : null;

  let current = 0;
  let hideTimer = 0;
  let enlarged = null;

  function fit() {
    const scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  // Slides are numbered from 1 in the address (#1 to #10) so a link can open any one of them.
  function indexFromHash() {
    const number = Number(location.hash.slice(1));
    const inRange = number >= 1 && number <= slides.length;
    return inRange ? number - 1 : 0;
  }

  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => slide.classList.toggle("active", i === current));

    counter.textContent = `${current + 1} / ${slides.length}`;

    renderNotes(slides[current]);

    history.replaceState(null, "", `#${current + 1}`);
  }

  function splitSentences(text) {
    if (sentenceSplitter) {
      return Array.from(sentenceSplitter.segment(text), (part) => part.segment.trim()).filter(Boolean);
    }
    return text.split(/(?<=[.?!])\s+/).filter(Boolean);
  }

  // The source wraps notes to suit the editor, so line breaks and indents are collapsed before splitting.
  function renderNotes(slide) {
    const aside = slide.querySelector("aside");
    const text = aside ? aside.textContent.replace(/\s+/g, " ").trim() : "";

    notes.replaceChildren(...groupAnswers(splitSentences(text)).map(renderParagraph));
  }

  // Each group is a question (or null) and the sentences that follow it.
  function groupAnswers(sentences) {
    const groups = [];
    let question = null;

    for (const sentence of sentences) {
      const isQuestion = sentence.endsWith("?");
      if (isQuestion) {
        question = { question: sentence, answer: [] };
        groups.push(question);
      } else if (question) {
        question.answer.push(sentence);
      } else {
        groups.push({ question: null, answer: [sentence] });
      }
    }

    return groups;
  }

  function renderParagraph(group) {
    const paragraph = document.createElement("p");

    if (group.question) {
      const bold = document.createElement("b");
      bold.textContent = group.question;
      paragraph.append(bold);
    }

    const answer = group.answer.join(" ");
    paragraph.append(group.question && answer ? ` ${answer}` : answer);

    return paragraph;
  }

  function toggleNotes() {
    notes.hidden = !notes.hidden;
  }

  function toggleFullScreen() {
    const isFullScreen = document.fullscreenElement !== null;
    if (isFullScreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  function fitViewer() {
    const zoom = Math.min(
      (window.innerWidth * VIEWER_WIDTH) / enlarged.naturalWidth,
      (window.innerHeight * VIEWER_HEIGHT) / enlarged.naturalHeight,
      VIEWER_MAX_ZOOM
    );
    viewerImage.style.width = `${Math.round(enlarged.naturalWidth * zoom)}px`;
    viewerImage.style.height = `${Math.round(enlarged.naturalHeight * zoom)}px`;
  }

  function openViewer(image) {
    enlarged = image;
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt;
    fitViewer();
    viewer.hidden = false;
  }

  function closeViewer() {
    viewer.hidden = true;
    enlarged = null;
  }

  // The controls appear while the mouse moves and fade after a few seconds.
  function revealControls() {
    document.body.classList.add("show-controls");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => document.body.classList.remove("show-controls"), 2500);
  }

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    // With a screenshot enlarged, any key (a clicker included) closes it rather than changing slides behind it.
    if (enlarged) {
      closeViewer();
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
      case "Enter":
        show(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
      case "Backspace":
        show(current - 1);
        break;
      case "Home":
        show(0);
        break;
      case "End":
        show(slides.length - 1);
        break;
      case "n":
      case "N":
        toggleNotes();
        break;
      case "f":
      case "F":
        toggleFullScreen();
        break;
      default:
        return;
    }

    event.preventDefault();
  });

  document.getElementById("prev").addEventListener("click", () => show(current - 1));
  document.getElementById("next").addEventListener("click", () => show(current + 1));
  document.getElementById("toggle-notes").addEventListener("click", toggleNotes);
  document.getElementById("toggle-full").addEventListener("click", toggleFullScreen);

  stage.addEventListener("click", (event) => {
    const image = event.target.closest(".slide img");
    if (image) openViewer(image);
  });
  viewer.addEventListener("click", closeViewer);

  document.addEventListener("mousemove", revealControls);
  window.addEventListener("resize", () => {
    fit();
    if (enlarged) fitViewer();
  });
  window.addEventListener("hashchange", () => show(indexFromHash()));

  fit();
  show(indexFromHash());
})();
