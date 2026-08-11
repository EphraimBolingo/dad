(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page ?? "";
  const select = (selector, parent = document) => parent.querySelector(selector);
  const selectAll = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function goTo(url) {
    window.location.href = url;
  }

  function showScene(current, next) {
    if (!current || !next) return;
    current.classList.add("is-leaving");
    window.setTimeout(() => {
      current.hidden = true;
      current.classList.remove("is-active", "is-leaving");
      next.hidden = false;
      next.classList.add("is-active", "is-entering");
      window.setTimeout(() => next.classList.remove("is-entering"), reduceMotion ? 1 : 1200);
    }, reduceMotion ? 1 : 620);
  }

  function setupImageFallback(image) {
    if (!(image instanceof HTMLImageElement)) return;
    const markMissing = () => image.classList.add("is-missing");
    image.addEventListener("error", markMissing, { once: true });
    if (image.complete && image.naturalWidth === 0) markMissing();
  }

  function setupMediaFallbacks() {
    selectAll("img").forEach(setupImageFallback);
  }

  function initOpening() {
    const opening = select("#open-scene");
    const videoScene = select("#video-scene");
    const welcomeScene = select("#welcome-scene");
    const openButton = select("#open-story");
    const video = select("#intro-video");
    const videoNext = select("#video-next");
    const videoStatus = select(".video-status");
    const welcomeNext = select("#welcome-next");
    if (!opening || !videoScene || !welcomeScene || !openButton || !video || !videoNext || !welcomeNext) return;

    let nextHasAppeared = false;
    const revealVideoNext = () => {
      if (nextHasAppeared) return;
      nextHasAppeared = true;
      videoNext.classList.add("is-visible");
      if (videoStatus) videoStatus.textContent = "Quand tu es prêt, continue l'histoire.";
    };

    const startVideo = () => {
      video.currentTime = 0;
      video.muted = false;
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {
          video.muted = true;
          video.play().catch(() => revealVideoNext());
        });
      }
    };

    openButton.addEventListener("click", () => {
      document.body.classList.add("story-unlocked");
      showScene(opening, videoScene);
      window.setTimeout(startVideo, reduceMotion ? 1 : 520);
    });

    video.addEventListener("loadeddata", () => {
      video.classList.remove("is-missing");
      if (videoStatus) videoStatus.textContent = "La lecture commence maintenant.";
    });
    video.addEventListener("ended", revealVideoNext);
    video.addEventListener("error", () => {
      video.classList.add("is-missing");
      if (videoStatus) videoStatus.textContent = "Ajoute assets/video/intro.mp4 pour lancer ta vidéo.";
      window.setTimeout(revealVideoNext, 850);
    });
    window.setTimeout(() => {
      if (video.readyState === 0) {
        video.classList.add("is-missing");
        if (videoStatus) videoStatus.textContent = "Ajoute assets/video/intro.mp4 pour lancer ta vidéo.";
        revealVideoNext();
      }
    }, 1800);

    videoNext.addEventListener("click", () => showScene(videoScene, welcomeScene));
    welcomeNext.addEventListener("click", () => goTo("messages.html"));
  }

  function initBalloons() {
    const opening = select("#open-scene");
    if (!opening || reduceMotion) return;
    let overlay = opening.querySelector(".balloon-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "balloon-overlay";
      opening.appendChild(overlay);
    }

    function populateBalloons(container, count = 32) {
      if (!container) return;
      container.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "balloon";
        s.textContent = "🎈";
        const size = Math.round(26 + Math.random() * 46);
        s.style.fontSize = size + "px";
        s.style.left = Math.random() * 100 + "%";
        s.style.top = Math.random() * 100 + "%";
        const tx = Math.round((Math.random() * 900 - 450));
        const ty = Math.round((Math.random() * 900 - 450));
        const rot = Math.round((Math.random() * 720 - 360));
        s.style.setProperty("--tx", tx + "px");
        s.style.setProperty("--ty", ty + "px");
        s.style.setProperty("--rot", rot + "deg");
        const dur = (6 + Math.random() * 8);
        s.style.setProperty("--dur", dur + "s");
        s.style.animationDelay = (Math.random() * 3) + "s";
        s.style.animationName = 'balloon-float';
        s.style.setProperty('--sway', Math.round(6 + Math.random() * 24) + 'px');
        s.style.opacity = (0.6 + Math.random() * 0.35).toString();
        const hue = Math.round(Math.random() * 360);
        s.style.color = `hsl(${hue} 80% 66% / 1)`;
        container.appendChild(s);
      }
    }

    populateBalloons(overlay, 40);
    window.setInterval(() => populateBalloons(overlay, 26 + Math.round(Math.random() * 36)), reduceMotion ? 60000 : 9000);
  }

  function initGarlands() {
    const opening = select("#open-scene");
    if (!opening || reduceMotion) return;
    let garland = opening.querySelector('.garland');
    if (!garland) {
      garland = document.createElement('div');
      garland.className = 'garland';
      const inner = document.createElement('div');
      inner.className = 'garland-inner';
      // create two lines of flags for depth
      for (let row = 0; row < 2; row++) {
        const line = document.createElement('div');
        line.className = 'garland-line';
        inner.appendChild(line);
        const flagsCount = 18;
        for (let i = 0; i < flagsCount; i++) {
          const f = document.createElement('span');
          f.className = 'garland-flag';
          // random color palette (pastel party)
          const palettes = [[345,78,68],[15,88,64],[50,85,66],[200,74,64],[280,70,68]];
          const p = palettes[Math.floor(Math.random() * palettes.length)];
          f.style.background = `hsl(${p[0]} ${p[1]}% ${p[2]}%)`;
          const delay = Math.random() * 1.6;
          const dur = 2.6 + Math.random() * 1.8;
          f.style.setProperty('--dur', dur + 's');
          f.style.animationDelay = (row * 0.2 + delay) + 's';
          f.style.transform = `rotate(${Math.random() * 12 - 6}deg)`;
          inner.appendChild(f);
        }
      }
      garland.appendChild(inner);
      opening.appendChild(garland);
    }
  }

  const messages = [
    {
      name: "Ephraim",
      note: "La première voix",
      portrait: "img/ephraim.webp",
      message: "Papa, Aujourd’hui, je veux simplement te dire merci. Merci de nous aimer tels que nous sommes, de nous encourager et de toujours nous soutenir. Je vois les efforts que tu fais chaque jour pour nous et pour toute la famille. Je vois tes retours tard le soir et tout le travail que tu accomplis pour nous donner le meilleur. Merci aussi de toujours croire en mes idées. Qu’elles soient bonnes ou parfois moins bonnes, tu as toujours pris le temps de m’écouter, de m’encourager et de me pousser à avancer. Pour moi, ça compte énormément. En tant que grand frère, je veux te dire une chose : je ferai tout pour devenir un homme dont tu seras fier. Que Dieu te donne la force, la santé et de longues années pour voir tout ce que tes efforts auront construit. Joyeux anniversaire Papa."
    },
    {
      name: "Brayan",
      note: "Un merci qui reste",
      portrait: "img/brayan.webp",
      message: "Papa Papy, en ce jour où nous célébrons ton anniversaire, je veux simplement te dire merci. Merci d'avoir été là pour nous, de nous avoir soutenus et encouragés dans les moments où nous en avions besoin. Au fil du temps, tu as pris une place importante dans notre famille et dans nos vies. Aujourd'hui, nous partageons tellement de choses ensemble et je suis reconnaissant pour tous ces moments. Je te souhaite une très belle et longue vie, remplie de bonheur, de paix et de réussite. Profite pleinement de cette journée parce que tu la mérites. Joyeux anniversaire Papa."
    },
    {
      name: "Gabriella",
      note: "Bonjour Pa Papy 😄❤️",
      portrait: "img/gabriella.webp",
      message: "Bonjour Pa Papy 😄❤️ Aujourd’hui est un jour spécial, et je voulais simplement vous souhaiter un très joyeux anniversaire. 🎂🥳 Merci pour votre gentillesse, vos conseils, votre soutien et pour la belle personne que vous êtes. Je suis reconnaissante de vous avoir dans notre famille et je vous porte beaucoup d’affection et de respect. ❤️ Que Dieu vous accorde une longue vie, une excellente santé, beaucoup de bonheur, de paix et de réussite. Qu’Il vous protège, bénisse vos projets et vous permette de profiter encore longtemps de tous ceux qui vous aiment. 🙏🏽 Joyeux anniversaire Pa Papy ! 🎉❤️ Que cette nouvelle année vous apporte tout le bonheur que vous méritez. 🙏🏽❤️"
    },
    {
      name: "Christelvie",
      note: "En cette occasion spéciale, nous te souhaitons un joyeux anniversaire. 🎉🎂",
      portrait: "img/christelvie.webp",
      message: "En cette occasion spéciale, nous te souhaitons un joyeux anniversaire. 🎉🎂 Nous te remercions aussi pour tout ce que tu as fait pour nous pendant toutes ces années. ❤️ Chaque jour qui passe est un cadeau pour nous, car nous t’avons à nos côtés. 🥰 Alors, nous te souhaitons un joyeux anniversaire et une longue vie, notre papa bien-aimé. ❤️🙏🏽 Et n’oublie jamais une chose : nous t’aimons. 🥳💖"
    },
    {
      name: "Hermille",
      note: "Un message depuis la ville universitaire",
      portrait: "img/hermille.webp",
      message: "Joyeux anniversaire à mon papa chéri ❤️🎂 Aujourd’hui, je remercie Dieu de m’avoir donné un père comme toi. Tu es bien plus qu’un papa pour moi : tu es une force, un exemple, un protecteur et l’une des personnes les plus précieuses de ma vie. ❤️ Papa, je n’ai peut-être pas toujours les mots pour te dire à quel point je t’aime et à quel point je suis reconnaissante pour tout ce que tu fais pour moi. Mais sache que chacune de tes paroles, chacun de tes sacrifices et chacun de tes conseils restent gravés dans mon cœur. Je prie le Bon Dieu de te donner une longue vie, une excellente santé, beaucoup de bonheur et la force de voir tes enfants réussir et te rendre fier. Que chaque année de plus soit une nouvelle bénédiction dans ta vie. Je t’aime profondément, mon papa chéri. Que Dieu te garde encore longtemps auprès de nous. ❤️🙏🏽 Joyeux anniversaire, mon héros. 🎉🎂"
    },
    {
      name: "Grace",
      note: "Une lettre douce d’amour",
      portrait: "img/grace.webp",
      message: "Cher Papa,\nAujourd’hui, nous célébrons l’homme exceptionnel que tu es. Merci pour ton amour, tes sacrifices et tous les efforts que tu fais pour nous. Ta présence est un précieux cadeau que nous chérirons toujours.\nJe prie pour que Dieu te protège, te donne une longue vie, une santé parfaite et une paix profonde. Que cette nouvelle année soit remplie de bonheur et de bénédictions. Joyeux anniversaire, Papa, nous t’aimons infiniment. ❤️🥳"
    },
    {
      name: "Divine",
      note: "Un message sincère depuis le cœur",
      portrait: "img/divine.webp",
      message: "Joyeux anniversaire, Papa ! En ce jour spécial, je veux te dire merci pour ta patience, ta générosité et tous les petits gestes qui rendent nos vies plus belles. Ta présence est un refuge et un exemple — grâce à toi, j'apprends chaque jour le sens du courage et de l'amour. Que Dieu te garde en bonne santé et t'offre encore de nombreuses années de bonheur. Je t'aime plus que les mots ne peuvent l'exprimer. ❤️"
    },
    {
      name: "Mapitshi",
      note: "Un hommage du fond du cœur",
      portrait: "img/mapitshi.webp",
      message: "Avec un cœur rempli d'amour, je te souhaite un joyeux anniversaire. Que Dieu te protège, te comble de sa grâce et concrétise ce qu'il t'avait promis. Je t'aime fort Mayala.\n\nMerci pour tout ce que tu fais pour nous. Tu es notre force. ❤️❤️❤️"
    }
  ];

  function wordMarkup(text) {
    // Support explicit line breaks: replace \n with a placeholder <br/> token
    // and avoid wrapping that token in a <span> so it becomes a real line break in the output.
    const normalized = String(text).replace(/\r/g, "").replace(/\n/g, " <br/> ");
    return normalized.split(" ").map((word) => word === "<br/>" ? "<br/>" : `<span>${word}</span>`).join(" ");
  }

  function revealWords(copy) {
    const words = selectAll("span", copy);
    words.forEach((word, index) => {
      window.setTimeout(() => word.classList.add("is-revealed"), reduceMotion ? 1 : 18 * index);
    });
  }

  function initMessages() {
    const stage = select("#message-stage");
    const name = select("#message-name");
    const note = select("#message-note");
    const indexLabel = select("#message-index");
    const copy = select("#message-copy");
    const signoff = select("#message-signoff");
    const portrait = select("#portrait-image");
    const portraitCaption = select("#portrait-caption");
    const previous = select("#message-prev");
    const next = select("#message-next");
    const progress = select(".header-progress span");
    if (!stage || !name || !note || !indexLabel || !copy || !signoff || !portrait || !portraitCaption || !previous || !next) return;

    let currentIndex = 0;
    let isChanging = false;

    function populateHearts(container, count = 32) {
      if (!container) return;
      container.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "heart";
        s.textContent = "❤";
        const size = Math.round(12 + Math.random() * 30);
        s.style.fontSize = size + "px";
        s.style.left = Math.random() * 100 + "%";
        s.style.top = Math.random() * 100 + "%";
        const tx = Math.round((Math.random() * 800 - 400));
        const ty = Math.round(-120 - Math.random() * 700);
        const rot = Math.round((Math.random() * 720 - 360));
        s.style.setProperty("--tx", tx + "px");
        s.style.setProperty("--ty", ty + "px");
        s.style.setProperty("--rot", rot + "deg");
        const dur = (4 + Math.random() * 6);
        s.style.setProperty('--dur', dur + 's');
        s.style.animationDelay = (Math.random() * 2) + "s";
        s.style.animationName = 'heart-flutter';
        s.style.animationIterationCount = 'infinite';
        s.style.setProperty('--sway', Math.round(8 + Math.random() * 28) + 'px');
        s.style.opacity = (0.6 + Math.random() * 0.4).toString();
        // slight hue variance
        const hue = 330 + Math.round(Math.random() * 20);
        s.style.color = `hsl(${hue} 86% 68% / 0.95)`;
        container.appendChild(s);
      }
    }

    function renderMessage(index, firstRender = false) {
      const item = messages[index];
      if (!item) return;
      currentIndex = index;
      stage.className = `message-stage message-variant-${index + 1}${firstRender ? " is-ready" : ""}`;
      // manage hearts overlay for Mapitshi (8th message)
      const overlaySelector = ".heart-overlay";
      let overlay = stage.querySelector(overlaySelector);
      if (index === 7 && !reduceMotion) {
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.className = "heart-overlay";
          stage.appendChild(overlay);
        }
        populateHearts(overlay, 40);
      } else if (overlay) {
        // clear hearts when not on Mapitshi
        overlay.innerHTML = "";
      }
      name.textContent = item.name;
      note.textContent = item.note;
      indexLabel.textContent = `${String(index + 1).padStart(2, "0")} / ${String(messages.length).padStart(2, "0")}`;
      copy.innerHTML = wordMarkup(item.message);
      copy.setAttribute("aria-label", item.message);
      signoff.textContent = `Avec affection, ${item.name}`;
      portraitCaption.textContent = item.name;
      portrait.alt = `Portrait de ${item.name}`;
      portrait.src = item.portrait;
      portrait.classList.remove("is-missing");
      setupImageFallback(portrait);
      previous.disabled = index === 0;
      next.querySelector(".button-label").textContent = index === messages.length - 1 ? "Voir les souvenirs" : "Suivant";
      if (progress) progress.style.width = `${((index + 1) / messages.length) * 100}%`;
      window.requestAnimationFrame(() => {
        stage.classList.add("is-ready");
        revealWords(copy);
      });
    }

    async function changeMessage(nextIndex) {
      if (isChanging || nextIndex < 0 || nextIndex >= messages.length) return;
      isChanging = true;
      stage.classList.remove("is-ready");
      stage.classList.add("is-transitioning");
      await wait(reduceMotion ? 1 : 540);
      renderMessage(nextIndex);
      stage.classList.remove("is-transitioning");
      isChanging = false;
    }

    previous.addEventListener("click", () => {
      if (currentIndex === 0) goTo("index.html");
      else changeMessage(currentIndex - 1);
    });
    next.addEventListener("click", () => {
      if (currentIndex === messages.length - 1) goTo("souvenirs.html");
      else changeMessage(currentIndex + 1);
    });

    renderMessage(0, true);
    // Keyboard navigation: flèches droite/gauche pour avancer/reculer
    const onKeydown = (event) => {
      if (event.defaultPrevented) return;
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      if (event.key === 'ArrowRight') {
        if (currentIndex === messages.length - 1) goTo('souvenirs.html');
        else changeMessage(currentIndex + 1);
      } else if (event.key === 'ArrowLeft') {
        if (currentIndex === 0) goTo('index.html');
        else changeMessage(currentIndex - 1);
      }
    };
    document.addEventListener('keydown', onKeydown);
  }

  const memoryPhotos = Array.from({ length: 8 }, (_, index) => ({
    src: `img/${index + 1}.webp`,
    label: `Souvenir ${index + 1}`
  }));

  function initMemoryCarousel() {
    const deck = select("#memory-deck");
    const count = select("#memory-count");
    const previous = select("#memory-prev");
    const next = select("#memory-next");
    if (!deck || !count || !previous || !next) return;

    let currentIndex = 0;
    let timer = 0;
    const cards = memoryPhotos.map((photo, index) => {
      const card = document.createElement("figure");
      card.className = "memory-card";
      card.setAttribute("aria-hidden", "true");
      card.innerHTML = `<div class="media-placeholder"><span class="placeholder-mark">${String(index + 1).padStart(2, "0")}</span><span>Photo à ajouter</span></div><img src="${photo.src}" alt="${photo.label} de la famille" loading="lazy"><figcaption class="memory-card-label"><span>${photo.label}</span><span>12.08</span></figcaption>`;
      deck.appendChild(card);
      setupImageFallback(select("img", card));
      return card;
    });

    function renderMemory(index) {
      currentIndex = (index + memoryPhotos.length) % memoryPhotos.length;
      cards.forEach((card, cardIndex) => {
        card.classList.toggle("is-active", cardIndex === currentIndex);
        card.classList.toggle("is-before", cardIndex === (currentIndex - 1 + cards.length) % cards.length);
        card.classList.toggle("is-after", cardIndex === (currentIndex + 1) % cards.length);
        card.setAttribute("aria-hidden", cardIndex === currentIndex ? "false" : "true");
      });
      count.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(memoryPhotos.length).padStart(2, "0")}`;
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(() => renderMemory(currentIndex + 1), reduceMotion ? 10000 : 6200);
    }

    previous.addEventListener("click", () => { renderMemory(currentIndex - 1); restartTimer(); });
    next.addEventListener("click", () => { renderMemory(currentIndex + 1); restartTimer(); });
    deck.addEventListener("mouseenter", () => window.clearInterval(timer));
    deck.addEventListener("mouseleave", restartTimer);
    deck.addEventListener("focusin", () => window.clearInterval(timer));
    deck.addEventListener("focusout", restartTimer);
    renderMemory(0);
    restartTimer();
  }

  const finalPhotos = [
    { src: "img/leon.webp", label: "Leon" },
    ...[1, 2, 3, 4, 5].map((number) => ({
      src: `img/${number}.webp`,
      label: `Famille ${String(number).padStart(2, "0")}`
    }))
  ];

  function initFinalGallery() {
    const deck = select("#final-deck");
    if (!deck) return;
    finalPhotos.forEach((photo, index) => {
      const card = document.createElement("div");
      card.className = `final-card${index === 0 ? " is-active" : ""}`;
      card.innerHTML = `<div class="media-placeholder"><span class="placeholder-mark">${String(index + 1).padStart(2, "0")}</span><span>Photo finale à ajouter</span></div><img src="${photo.src}" alt="${photo.label}, souvenir de famille" loading="${index === 0 ? "eager" : "lazy"}">`;
      deck.appendChild(card);
      setupImageFallback(select("img", card));
    });
    const cards = selectAll(".final-card", deck);
    let currentIndex = 0;
    window.setInterval(() => {
      cards[currentIndex]?.classList.remove("is-active");
      currentIndex = (currentIndex + 1) % cards.length;
      cards[currentIndex]?.classList.add("is-active");
    }, reduceMotion ? 10000 : 7200);
  }

  const finalParagraphs = [
    { text: "PAPA PAPY,", className: "final-address" },
    { text: "Il y a des mots qui ne suffisent pas pour dire tout ce qu’une personne représente pour nous." },
    { text: "Alors aujourd’hui, nous voulons simplement te regarder à travers ces quelques lignes et te dire :" },
    { text: "MERCI D’ÊTRE NOTRE PAPA.", className: "blessing" },
    { text: "Merci pour ta présence, pour ta force, pour tes sacrifices et pour tout ce que tu fais, parfois dans le silence, pour ceux que tu aimes." },
    { text: "Merci pour les conseils, les encouragements, les rires, les discussions, les moments simples et tous ces souvenirs qui prennent de la valeur avec le temps." },
    { text: "Nous ne te souhaitons pas seulement un joyeux anniversaire." },
    { text: "Nous te souhaitons une longue vie pour voir grandir tout ce que tu as construit, assez de force pour continuer à avancer, assez de bonheur pour remplir ton cœur et assez de beaux moments pour profiter pleinement de la vie.", className: "blessing" },
    { text: "Que Dieu de Papa Simon Kimbangu veille sur toi, te protège à chaque instant et t’accorde de nombreuses années encore parmi nous." },
    { text: "Et si un jour tu doutes de la place que tu occupes dans nos vies, souviens-toi simplement de ceci :" },
    { text: "TU ES NOTRE PAPA.", className: "final-birthday" },
    { text: "TU ES AIMÉ.", className: "final-birthday" },
    { text: "TU ES IMPORTANT.", className: "final-birthday" },
    { text: "ET TU RESTERAS TOUJOURS SPÉCIAL POUR NOUS.", className: "final-birthday" },
    { text: "En ce 12 août, toute la famille te souhaite un merveilleux anniversaire." },
    { text: "Joyeux anniversaire, Papa Papy Modeste Mayala, alias MUFASA 🦁", className: "final-birthday" },
    { text: "Avec tout notre amour. ❤️", className: "final-love" }
  ];

  function initFinalMessage() {
    const copy = select("#final-copy");
    if (!copy) return;
    finalParagraphs.forEach((paragraph, index) => {
      const element = document.createElement("p");
      element.textContent = paragraph.text;
      if (paragraph.className) element.classList.add(paragraph.className);
      element.style.animationDelay = `${reduceMotion ? 0 : 480 + index * 250}ms`;
      copy.appendChild(element);
    });
  }

  function initMusic() {
    const audio = select("#final-music");
    const toggle = select("#sound-toggle");
    if (!audio || !toggle) return;
    let waitingForGesture = false;

    const playMusic = () => {
      if (audio.muted) return;
      const attempt = audio.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => { waitingForGesture = true; });
      }
    };
    const playAfterGesture = () => {
      if (!waitingForGesture) return;
      waitingForGesture = false;
      playMusic();
    };

    toggle.addEventListener("click", () => {
      audio.muted = !audio.muted;
      toggle.classList.toggle("is-muted", audio.muted);
      toggle.setAttribute("aria-pressed", String(audio.muted));
      toggle.setAttribute("aria-label", audio.muted ? "Réactiver le son" : "Couper le son");
      if (!audio.muted) playMusic();
    });
    document.addEventListener("pointerdown", playAfterGesture, { passive: true });
    document.addEventListener("keydown", playAfterGesture);
    playMusic();
  }

  function initPageTransitions() {
    const transitionDuration = reduceMotion ? 1 : 420;
    const isLocalInternalLink = (link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      if (link.target && link.target !== "_self") return false;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname && url.hash) return false;
      return true;
    };

    window.requestAnimationFrame(() => {
      document.body.classList.add("page-loaded");
    });

    selectAll("a[href]").forEach((link) => {
      if (!isLocalInternalLink(link)) return;
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        document.body.classList.add("is-page-exiting");
        window.setTimeout(() => {
          window.location.href = link.href;
        }, transitionDuration);
      });
    });
  }

  function initPointerDepth() {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const pageFinal = document.body.classList.contains("page-final");
    const portrait = select(".portrait-wrap");
    const deck = select(".photo-deck");
    const aurora = select(".final-aurora");
    let frame = 0;
    let x = 0;
    let y = 0;
    document.addEventListener("pointermove", (event) => {
      x = (event.clientX / window.innerWidth - .5) * 2;
      y = (event.clientY / window.innerHeight - .5) * 2;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        if (portrait) portrait.style.marginLeft = `${x * 5}px`;
        if (deck) deck.style.marginTop = `${y * 8}px`;
        if (pageFinal && aurora) aurora.style.transform = `translateX(calc(-50% + ${x * 16}px)) translateY(${y * 10}px)`;
        frame = 0;
      });
    }, { passive: true });
  }

  function init() {
    setupMediaFallbacks();
    if (page === "opening") { initOpening(); initBalloons(); initGarlands(); }
    if (page === "messages") initMessages();
    if (page === "souvenirs") initMemoryCarousel();
    if (page === "final") { initFinalGallery(); initFinalMessage(); initMusic(); }
    initPointerDepth();
    initPageTransitions();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
