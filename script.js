// Estado da aplicação
let currentType = "";
let favorites = [];

// Carregar favoritos do localStorage
function loadFavorites() {
  const saved = localStorage.getItem("mapFavorites");
  if (saved) {
    try {
      favorites = JSON.parse(saved);
      displayFavorites();
      updateRecommendations();
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      favorites = [];
      displayEmptyState();
    }
  } else {
    displayEmptyState();
  }
}

// Salvar favoritos no localStorage
function saveFavorites() {
  localStorage.setItem("mapFavorites", JSON.stringify(favorites));
}

// Exibir favoritos na tela
function displayFavorites() {
  const grid = document.getElementById("favoritesGrid");
  const section = document.getElementById("favoritesSection");

  if (favorites.length === 0) {
    displayEmptyState();
    return;
  }

  section.style.display = "block";
  grid.innerHTML = favorites
    .map(
      (item, index) => `
        <div class="favorite-item" data-index="${index}">
            <div class="favorite-header">
                <h3>${item.name}</h3>
                <button class="remove-btn" onclick="removeFavorite(${index})" title="Remover">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            ${item.artist ? `<p>Por: ${item.artist}</p>` : ""}
            <span class="category-tag">${getCategoryLabel(item.type)}</span>
        </div>
    `
    )
    .join("");
}

// Exibir estado vazio
function displayEmptyState() {
  const grid = document.getElementById("favoritesGrid");
  const section = document.getElementById("favoritesSection");

  section.style.display = "block";
  grid.innerHTML =
    '<div class="empty-message">Adicione seus primeiros favoritos para começar!</div>';
}

// Remover favorito
function removeFavorite(index) {
  if (confirm("Tem certeza que deseja remover este item dos favoritos?")) {
    favorites.splice(index, 1);
    saveFavorites();
    displayFavorites();
    updateRecommendations();
  }
}

// Obter label da categoria
function getCategoryLabel(type) {
  const labels = {
    music: "Música",
    album: "Álbum",
    artist: "Artista",
  };
  return labels[type] || type;
}

// Configurar event listeners
function setupEventListeners() {
  // Botões de categoria
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      currentType = this.dataset.type;
      openModal(currentType);
    });
  });

  // Formulário
  document.getElementById("addForm").addEventListener("submit", handleSubmit);

  // Botão fechar
  document.getElementById("closeBtn").addEventListener("click", closeModal);

  // Fechar modal clicando fora
  document.getElementById("inputModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });

  // Fechar modal com ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

// Abrir modal
function openModal(type) {
  const modal = document.getElementById("inputModal");
  const title = document.getElementById("modalTitle");
  const artistGroup = document.getElementById("artistGroup");

  // Configurar título e campos baseado no tipo
  const titles = {
    music: "Adicionar Música",
    album: "Adicionar Álbum",
    artist: "Adicionar Artista",
  };

  title.textContent = titles[type] || "Adicionar";

  // Mostrar/esconder campo artista
  if (type === "artist") {
    artistGroup.style.display = "none";
    document.getElementById("artistName").removeAttribute("required");
  } else {
    artistGroup.style.display = "block";
    document.getElementById("artistName").setAttribute("required", "");
  }

  // Limpar campos
  document.getElementById("itemName").value = "";
  document.getElementById("artistName").value = "";

  modal.classList.add("active");
  document.getElementById("itemName").focus();
}

// Fechar modal
function closeModal() {
  const modal = document.getElementById("inputModal");
  modal.classList.remove("active");
}

// Lidar com submissão do formulário
function handleSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("itemName").value.trim();
  const artist = document.getElementById("artistName").value.trim();

  if (!name) {
    alert("Por favor, preencha o nome.");
    return;
  }

  if (currentType !== "artist" && !artist) {
    alert("Por favor, preencha o nome do artista.");
    return;
  }

  // Verificar se já existe
  const exists = favorites.some(
    (item) =>
      item.name.toLowerCase() === name.toLowerCase() &&
      item.type === currentType &&
      (currentType === "artist" ||
        item.artist.toLowerCase() === artist.toLowerCase())
  );

  if (exists) {
    alert("Este item já está nos seus favoritos!");
    return;
  }

  // Adicionar aos favoritos
  const newItem = {
    name: name,
    type: currentType,
    dateAdded: new Date().toISOString(),
  };

  if (currentType !== "artist") {
    newItem.artist = artist;
  }

  favorites.push(newItem);
  saveFavorites();
  displayFavorites();
  updateRecommendations();
  closeModal();

  // Feedback visual
  showNotification(
    `${getCategoryLabel(currentType)} adicionado aos favoritos!`
  );
}

// Mostrar notificação
function showNotification(message) {
  // Remove notificação existente se houver
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Array de sugestões baseadas nos favoritos
const musicDatabase = {
  rock: [
    { name: "Bohemian Rhapsody", artist: "Queen", reason: "Clássico do rock" },
    {
      name: "Stairway to Heaven",
      artist: "Led Zeppelin",
      reason: "Épico do rock progressivo",
    },
    {
      name: "Hotel California",
      artist: "Eagles",
      reason: "Rock clássico americano",
    },
  ],
  pop: [
    { name: "Blinding Lights", artist: "The Weeknd", reason: "Pop moderno" },
    {
      name: "Watermelon Sugar",
      artist: "Harry Styles",
      reason: "Pop contemporâneo",
    },
    { name: "Levitating", artist: "Dua Lipa", reason: "Dance-pop atual" },
  ],
  jazz: [
    { name: "Take Five", artist: "Dave Brubeck", reason: "Jazz clássico" },
    { name: "So What", artist: "Miles Davis", reason: "Jazz modal" },
    {
      name: "Blue in Green",
      artist: "Bill Evans",
      reason: "Jazz contemplativo",
    },
  ],
  eletronic: [
    { name: "Strobe", artist: "Deadmau5", reason: "Progressive house" },
    { name: "Midnight City", artist: "M83", reason: "Synthwave" },
    { name: "One More Time", artist: "Daft Punk", reason: "French house" },
  ],
};

// Atualizar recomendações baseadas nos favoritos
function updateRecommendations() {
  const grid = document.querySelector(".recommendations-grid");
  const message = document.querySelector(".recommendations-message");

  if (favorites.length === 0) {
    message.textContent =
      "Adicione seus primeiros favoritos para ver recomendações personalizadas!";
    message.style.display = "block";
    grid.innerHTML = "";
    return;
  }

  // Gerar recomendações baseadas nos favoritos
  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    message.textContent =
      "Continue adicionando favoritos para recomendações mais precisas!";
    message.style.display = "block";
    grid.innerHTML = "";
    return;
  }

  message.style.display = "none";
  grid.innerHTML = recommendations
    .map(
      (rec) => `
        <div class="recommendation-card">
            <h3>${rec.name}</h3>
            <p>Por: ${rec.artist}</p>
            <small class="recommendation-reason">${rec.reason}</small>
        </div>
    `
    )
    .join("");
}

// Gerar recomendações baseadas nos favoritos
function generateRecommendations() {
  const recommendations = [];
  const usedItems = new Set();

  // Analisar gêneros dos favoritos (simulação básica)
  favorites.forEach((favorite) => {
    const genre = detectGenre(favorite.name, favorite.artist || favorite.name);
    const genreRecs = musicDatabase[genre] || [];

    genreRecs.forEach((rec) => {
      const key = `${rec.name}-${rec.artist}`;
      if (!usedItems.has(key) && recommendations.length < 6) {
        // Verificar se não é um favorito existente
        const isAlreadyFavorite = favorites.some(
          (fav) =>
            fav.name.toLowerCase() === rec.name.toLowerCase() &&
            (fav.artist || "").toLowerCase() === rec.artist.toLowerCase()
        );

        if (!isAlreadyFavorite) {
          recommendations.push({
            ...rec,
            reason: `Baseado em seu gosto por ${favorite.name}`,
          });
          usedItems.add(key);
        }
      }
    });
  });

  return recommendations;
}

// Detectar gênero (simulação básica - em produção seria mais sofisticado)
function detectGenre(name, artist) {
  const rockKeywords = [
    "rock",
    "metal",
    "punk",
    "grunge",
    "queen",
    "led zeppelin",
    "pink floyd",
  ];
  const popKeywords = [
    "pop",
    "taylor",
    "ariana",
    "billie",
    "harry styles",
    "dua lipa",
  ];
  const jazzKeywords = ["jazz", "blue", "miles", "coltrane", "bebop"];
  const electronicKeywords = [
    "electronic",
    "house",
    "techno",
    "edm",
    "daft punk",
  ];

  const searchText = `${name} ${artist}`.toLowerCase();

  if (rockKeywords.some((keyword) => searchText.includes(keyword)))
    return "rock";
  if (popKeywords.some((keyword) => searchText.includes(keyword))) return "pop";
  if (jazzKeywords.some((keyword) => searchText.includes(keyword)))
    return "jazz";
  if (electronicKeywords.some((keyword) => searchText.includes(keyword)))
    return "eletronic";

  // Default para rock se não identificar
  return "rock";
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  loadFavorites();

  // Mostrar seção de favoritos sempre
  document.getElementById("favoritesSection").style.display = "block";
});
