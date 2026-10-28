(function () {
  "use strict";

  // Актуальный год в футере
  var yearNodes = document.querySelectorAll("#year, .js-year");
  var currentYear = new Date().getFullYear();
  yearNodes.forEach(function (el) {
    el.textContent = currentYear;
  });

  // Мобильное меню
  var menuBtn = document.querySelector(".menu-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Фильтрация карточек по поисковому запросу и GET-параметрам (включая старые ?action=searchresult и ?action=showreplies)
  var params = new URLSearchParams(window.location.search);
  var rawQuery =
    params.get("q") ||
    params.get("title") ||
    params.get("author") ||
    params.getAll("sdata").filter(Boolean).pop() ||
    "";
  var topicId = params.get("topic") || "";
  var action = params.get("action") || "";

  var banner = document.querySelector("#query-banner");
  var filterableCards = document.querySelectorAll("[data-searchable]");

  function applyFilter(term) {
    var clean = (term || "").trim().toLowerCase();
    if (!filterableCards.length) return;
    var matched = 0;
    filterableCards.forEach(function (card) {
      var text = (card.textContent || "").toLowerCase();
      var show = !clean || text.indexOf(clean) !== -1;
      card.style.display = show ? "" : "none";
      if (show) matched++;
    });
    if (banner) {
      if (clean) {
        banner.classList.add("is-visible");
        var label = banner.querySelector(".js-query-text");
        if (label) {
          label.textContent =
            'Фильтр по каталогу: «' + term.trim() + '» (найдено материалов: ' + matched + ")";
        }
      } else {
        banner.classList.remove("is-visible");
      }
    }
  }

  if (rawQuery) {
    var titleInput = document.querySelector('input[name="q"], input[name="title"]');
    if (titleInput) titleInput.value = rawQuery;
    applyFilter(rawQuery);
  }

  // Подсветка темы на странице клинического форума (?action=showreplies&fid=...&topic=89|91|92)
  if (topicId) {
    var topicCard = document.getElementById("topic-" + topicId);
    if (topicCard) {
      topicCard.style.borderColor = "#0ea5a4";
      topicCard.style.boxShadow = "0 0 0 3px rgba(14, 165, 164, 0.2)";
      topicCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } else if (action === "archive" && params.get("start")) {
    if (banner) {
      banner.classList.add("is-visible");
      var pageNum = params.get("start");
      var labelNode = banner.querySelector(".js-query-text");
      if (labelNode) {
        labelNode.textContent = "Архивная лента новостей · страница " + pageNum;
      }
    }
  }

  // Перехват локальной формы поиска без перезагрузки, если мы уже на странице с карточками
  var searchForms = document.querySelectorAll(".js-catalog-search");
  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (filterableCards.length > 0) {
        e.preventDefault();
        var q = (form.querySelector('[name="q"]') || {}).value || "";
        var author = (form.querySelector('[name="author"]') || {}).value || "";
        var rubric = (form.querySelector('[name="rubric"]') || {}).value || "";
        var combined = [q, author, rubric].filter(Boolean).join(" ");
        applyFilter(combined);
      }
    });
  });

  // Кнопка сброса фильтра
  var resetBtn = document.querySelector(".js-query-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      applyFilter("");
      searchForms.forEach(function (f) {
        f.reset();
      });
    });
  }

  // Обработка контактных форм (обратная связь / подача рукописи / подписка)
  var contactForms = document.querySelectorAll(".js-editorial-form");
  contactForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".js-form-status");
      if (status) {
        status.textContent =
          "Заявка сформирована. Сейчас откроется почтовый клиент для отправки в редакцию (editorial@dentaljournal.by).";
        status.style.color = "#0b8483";
      }
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      var contact = (form.querySelector('[name="contact"]') || {}).value || "";
      var message = (form.querySelector('[name="message"]') || {}).value || "";
      var subject = encodeURIComponent("Обращение в редакцию «ДенталВестник»");
      var body = encodeURIComponent(
        "ФИО / Организация: " + name + "\nКонтакт: " + contact + "\n\nСообщение:\n" + message
      );
      window.location.href = "mailto:editorial@dentaljournal.by?subject=" + subject + "&body=" + body;
    });
  });
})();
