// ================================================
// AMIGO SECRETO DOS FERNANDES ❤️
// Sistema de sorteio com link único compartilhado
// ================================================

// ================================================
// ELEMENTOS DO SITE
// ================================================

const form = document.getElementById("participant-form");

const nameInput = document.getElementById("participant-name");

const participantList = document.getElementById("participant-list");

const participantCount = document.getElementById("participant-count");

const drawButton = document.getElementById("draw-button");

const organizerPanel = document.getElementById("organizer-panel");

const resultsPanel = document.getElementById("results-panel");

const participantResult = document.getElementById("participant-result");

const sharedLinkInput = document.getElementById("shared-link");

const copyLinkButton = document.getElementById("copy-link-button");

const shareLinkButton = document.getElementById("share-link-button");

const lookupForm = document.getElementById("lookup-form");

const lookupName = document.getElementById("lookup-name");

const lookupError = document.getElementById("lookup-error");

const revealedResult = document.getElementById("revealed-result");

const friendNameElement = document.getElementById("friend-name");

const toast = document.getElementById("toast");

// ================================================
// CONFIGURAÇÕES
// ================================================

// Chave nova para não misturar dados da versão anterior.
const STORAGE_KEY = "fernandes_amigo_secreto_v2";

let participants = [];

let drawResults = null;

let toastTimer = null;

// ================================================
// NOTIFICAÇÕES
// ================================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}

// ================================================
// EFEITO DE NEVE
// ================================================

function createSnow() {

    const container = document.getElementById("snow-container");

    for (let i = 0; i < 40; i++) {

        const snowflake = document.createElement("span");

        snowflake.className = "snowflake";

        snowflake.textContent = "❄";

        snowflake.style.left = Math.random() * 100 + "%";

        snowflake.style.fontSize =
            (Math.random() * 9 + 7) + "px";

        snowflake.style.animationDuration =
            (Math.random() * 8 + 8) + "s";

        snowflake.style.animationDelay =
            (Math.random() * 10) + "s";

        container.appendChild(snowflake);

    }

}

createSnow();

// ================================================
// CADASTRAR PARTICIPANTES
// ================================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    if (drawResults) {

        showToast("O sorteio já foi realizado.");

        return;

    }

    const name = nameInput.value.trim();

    if (name.length < 2) {

        showToast("Digite um nome válido.");

        return;

    }

    if (name.length > 60) {

        showToast("O nome deve ter até 60 caracteres.");

        return;

    }

    const normalizedName = normalizeName(name);

    const alreadyExists = participants.some(person =>
        normalizeName(person) === normalizedName
    );

    if (alreadyExists) {

        showToast("Esse participante já está cadastrado.");

        return;

    }

    participants.push(name);

    saveParticipants();

    renderParticipants();

    nameInput.value = "";

    nameInput.focus();

    showToast("Participante adicionado! ❤️");

});

// ================================================
// NORMALIZAR NOMES
// ================================================

function normalizeName(name) {

    return name
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("pt-BR");

}

// ================================================
// REMOVER PARTICIPANTES
// ================================================

function removeParticipant(index) {

    if (drawResults) {

        showToast("O sorteio já foi realizado.");

        return;

    }

    participants.splice(index, 1);

    saveParticipants();

    renderParticipants();

    showToast("Participante removido.");

}

// ================================================
// MOSTRAR PARTICIPANTES
// ================================================

function renderParticipants() {

    participantList.innerHTML = "";

    participantCount.textContent =
        participants.length +
        (participants.length === 1
            ? " participante"
            : " participantes");

    if (participants.length === 0) {

        const empty = document.createElement("li");

        empty.className = "empty-list";

        empty.textContent =
            "Nenhum participante adicionado ainda.";

        participantList.appendChild(empty);

    }

    participants.forEach((name, index) => {

        const item = document.createElement("li");

        item.className = "participant-item";

        const person = document.createElement("div");

        person.className = "participant-name";

        const avatar = document.createElement("span");

        avatar.className = "participant-avatar";

        avatar.textContent = "🎄";

        const nameText = document.createElement("span");

        nameText.textContent = name;

        person.appendChild(avatar);

        person.appendChild(nameText);

        item.appendChild(person);

        if (!drawResults) {

            const removeButton = document.createElement("button");

            removeButton.type = "button";

            removeButton.className = "remove-button";

            removeButton.textContent = "✕";

            removeButton.title = "Remover participante";

            removeButton.setAttribute(
                "aria-label",
                "Remover " + name
            );

            removeButton.addEventListener("click", () => {

                removeParticipant(index);

            });

            item.appendChild(removeButton);

        }

        participantList.appendChild(item);

    });

    drawButton.disabled =
        participants.length < 2 || Boolean(drawResults);

    if (drawResults) {

        drawButton.textContent = "✓ SORTEIO CONCLUÍDO";

    }

}

// ================================================
// NÚMEROS ALEATÓRIOS
// ================================================

function secureRandom(max) {

    if (
        !Number.isSafeInteger(max) ||
        max < 1
    ) {

        throw new Error("Limite aleatório inválido.");

    }

    const range = 4294967296;

    const limit = Math.floor(range / max) * max;

    const array = new Uint32Array(1);

    let number;

    do {

        crypto.getRandomValues(array);

        number = array[0];

    } while (number >= limit);

    return number % max;

}

// ================================================
// EMBARALHAR PARTICIPANTES
// ================================================

function shuffle(array) {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = secureRandom(i + 1);

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }

    return shuffled;

}

// ================================================
// CRIAR SORTEIO SEM REPETIÇÕES
// ================================================

function createDraw(names) {

    if (names.length < 2) {

        throw new Error("São necessários pelo menos dois participantes.");

    }

    const shuffled = shuffle(names);

    // Cada participante tira o próximo nome da lista embaralhada.
    // O último participante tira o primeiro nome.

    const results = shuffled.map((person, index) => {

        return {

            participant: person,

            friend: shuffled[(index + 1) % shuffled.length]

        };

    });

    validateResults(results);

    return results;

}

// ================================================
// VALIDAR RESULTADOS
// ================================================

function validateResults(results) {

    if (!Array.isArray(results) || results.length < 2) {

        throw new Error("Sorteio inválido.");

    }

    const participantsNames = results.map(item =>
        normalizeName(item.participant)
    );

    const friendsNames = results.map(item =>
        normalizeName(item.friend)
    );

    const uniqueParticipants = new Set(participantsNames);

    const uniqueFriends = new Set(friendsNames);

    const valid = results.every(item => {

        return (
            item &&
            typeof item.participant === "string" &&
            typeof item.friend === "string" &&
            item.participant.trim().length >= 2 &&
            item.friend.trim().length >= 2 &&
            item.participant.length <= 60 &&
            item.friend.length <= 60 &&
            normalizeName(item.participant) !==
            normalizeName(item.friend)
        );

    });

    if (
        !valid ||
        uniqueParticipants.size !== results.length ||
        uniqueFriends.size !== results.length ||
        !participantsNames.every(name =>
            friendsNames.includes(name)
        )
    ) {

        throw new Error("Os resultados não passaram na validação.");

    }

    return true;

}

// ================================================
// REALIZAR O SORTEIO
// ================================================

drawButton.addEventListener("click", function() {

    if (drawResults) {

        showToast("O sorteio já foi realizado.");

        return;

    }

    if (participants.length < 2) {

        showToast("Cadastre pelo menos duas pessoas.");

        return;

    }

    const confirmed = confirm(

        "Deseja realizar o sorteio?\n\n" +

        "Confira todos os participantes antes de continuar.\n\n" +

        "O sorteio será definitivo neste navegador."

    );

    if (!confirmed) return;

    try {

        const results = createDraw(participants);

        drawResults = results;

        if (!saveDraw()) {

            drawResults = null;

            showToast(
                "Não foi possível salvar o sorteio. Verifique o armazenamento do navegador."
            );

            return;

        }

        renderParticipants();

        generateSharedLink();

        organizerPanel.classList.add("hidden");

        resultsPanel.classList.remove("hidden");

        resultsPanel.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

        showToast("Sorteio realizado com sucesso! ❤️");

        if (
            window.location.protocol === "file:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        ) {

            setTimeout(() => {

                showToast(
                    "Atenção: publique o site antes do sorteio oficial."
                );

            }, 4000);

        }

    } catch (error) {

        console.error("Erro no sorteio:", error);

        drawResults = null;

        showToast("Ocorreu um erro. Nenhum sorteio foi concluído.");

    }

});

// ================================================
// CODIFICAR RESULTADOS
// ================================================

function encodeResults(results) {

    const json = JSON.stringify({

        version: 1,

        results: results

    });

    const bytes = new TextEncoder().encode(json);

    let binary = "";

    bytes.forEach(byte => {

        binary += String.fromCharCode(byte);

    });

    return btoa(binary)

        .replace(/\+/g, "-")

        .replace(/\//g, "_")

        .replace(/=/g, "");

}

// ================================================
// DECODIFICAR RESULTADOS
// ================================================

function decodeResults(encoded) {

    if (
        typeof encoded !== "string" ||
        encoded.length === 0 ||
        encoded.length > 100000
    ) {

        throw new Error("Link inválido.");

    }

    const base64 = encoded

        .replace(/-/g, "+")

        .replace(/_/g, "/");

    const padded = base64.padEnd(

        Math.ceil(base64.length / 4) * 4,

        "="

    );

    const binary = atob(padded);

    const bytes = Uint8Array.from(

        binary,

        character => character.charCodeAt(0)

    );

    const json = new TextDecoder().decode(bytes);

    const data = JSON.parse(json);

    if (
        !data ||
        data.version !== 1 ||
        !Array.isArray(data.results)
    ) {

        throw new Error("Dados do sorteio inválidos.");

    }

    validateResults(data.results);

    return data.results;

}

// ================================================
// GERAR UM ÚNICO LINK
// ================================================

function generateSharedLink() {

    if (!drawResults) return;

    const url = new URL(window.location.href);

    // Remover parâmetros antigos e fragmentos.
    url.search = "";

    url.hash = "";

    const encoded = encodeResults(drawResults);

    url.searchParams.set("sorteio", encoded);

    sharedLinkInput.value = url.toString();

}

// ================================================
// COPIAR LINK
// ================================================

async function copyText(text) {

    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(text);

        } else {

            const textarea = document.createElement("textarea");

            textarea.value = text;

            textarea.style.position = "fixed";

            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            const copied = document.execCommand("copy");

            textarea.remove();

            if (!copied) {

                throw new Error("Não foi possível copiar.");

            }

        }

        showToast("Link copiado com sucesso! ❤️");

    } catch (error) {

        console.error("Erro ao copiar:", error);

        showToast("Não foi possível copiar. Selecione o link manualmente.");

    }

}

copyLinkButton.addEventListener("click", function() {

    if (!sharedLinkInput.value) {

        showToast("Nenhum link disponível.");

        return;

    }

    copyText(sharedLinkInput.value);

});

// ================================================
// COMPARTILHAR PELO WHATSAPP
// ================================================

shareLinkButton.addEventListener("click", function() {

    const link = sharedLinkInput.value;

    if (!link) {

        showToast("Nenhum link disponível.");

        return;

    }

    const message =

        "🎄 O sorteio do Amigo secreto dos Fernandes está pronto!\n\n" +

        "Acesse o link abaixo, digite seu nome e descubra quem você tirou! ❤️\n\n" +

        link;

    const whatsapp =

        "https://wa.me/?text=" +

        encodeURIComponent(message);

    window.open(

        whatsapp,

        "_blank",

        "noopener,noreferrer"

    );

});

// ================================================
// SALVAR PARTICIPANTES
// ================================================

function saveParticipants() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({

                participants: participants,

                results: null

            })

        );

        return true;

    } catch (error) {

        console.error("Erro ao salvar participantes:", error);

        return false;

    }

}

// ================================================
// SALVAR SORTEIO
// ================================================

function saveDraw() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({

                participants: participants,

                results: drawResults

            })

        );

        return true;

    } catch (error) {

        console.error("Erro ao salvar sorteio:", error);

        return false;

    }

}

// ================================================
// RECUPERAR DADOS DO ORGANIZADOR
// ================================================

function loadSavedData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        if (
            !data ||
            !Array.isArray(data.participants) ||
            data.participants.some(name =>
                typeof name !== "string" ||
                name.trim().length < 2 ||
                name.length > 60
            )
        ) {

            throw new Error("Dados salvos inválidos.");

        }

        const normalizedNames = data.participants.map(normalizeName);

        if (
            new Set(normalizedNames).size !==
            normalizedNames.length
        ) {

            throw new Error("Existem nomes duplicados.");

        }

        participants = data.participants;

        if (data.results !== null) {

            validateResults(data.results);

            const savedParticipants = data.participants.map(normalizeName);

            const resultParticipants = data.results.map(item =>
                normalizeName(item.participant)
            );

            if (
                savedParticipants.length !== resultParticipants.length ||
                !savedParticipants.every(name =>
                    resultParticipants.includes(name)
                )
            ) {

                throw new Error("Os participantes não correspondem ao sorteio.");

            }

            drawResults = data.results;

        }

    } catch (error) {

        console.error("Erro ao recuperar dados:", error);

        participants = [];

        drawResults = null;

        showToast("Não foi possível recuperar os dados salvos.");

    }

}

// ================================================
// MOSTRAR ERRO DE NOME
// ================================================

function showLookupError(message) {

    lookupError.textContent = message;

    lookupError.classList.remove("hidden");

}

// ================================================
// PARTICIPANTE DESCOBRE SEU AMIGO
// ================================================

lookupForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = lookupName.value.trim();

    lookupError.classList.add("hidden");

    revealedResult.classList.add("hidden");

    if (!name) {

        showLookupError("Digite seu nome.");

        return;

    }

    const participant = drawResults.find(item =>

        normalizeName(item.participant) === normalizeName(name)

    );

    if (!participant) {

        showLookupError(
            "Nome não encontrado. Confira a escrita e tente novamente."
        );

        return;

    }

    // Mostrar somente o resultado da pessoa que informou o nome.

    friendNameElement.textContent = participant.friend;

    revealedResult.classList.remove("hidden");

    lookupForm.classList.add("hidden");

    revealedResult.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

});

// ================================================
// VERIFICAR LINK COMPARTILHADO
// ================================================

function checkSharedLink() {

    const params = new URLSearchParams(

        window.location.search

    );

    const encoded = params.get("sorteio");

    if (!encoded) return false;

    try {

        drawResults = decodeResults(encoded);

        // Exibir a tela de participante.
        organizerPanel.classList.add("hidden");

        resultsPanel.classList.add("hidden");

        participantResult.classList.remove("hidden");

        document.title = "Amigo secreto dos Fernandes ❤️";

        return true;

    } catch (error) {

        console.error("Erro ao abrir link:", error);

        organizerPanel.classList.add("hidden");

        resultsPanel.classList.add("hidden");

        participantResult.classList.remove("hidden");

        participantResult.innerHTML = `

            <div class="result-decoration">🎄</div>

            <h2>Não foi possível abrir o sorteio.</h2>

            <p class="result-message">

                O link está inválido ou incompleto.

                Solicite novamente o endereço ao organizador.

            </p>

        `;

        return true;

    }

}

// ================================================
// INICIALIZAÇÃO
// ================================================

function initialize() {

    // Verificar primeiro se o visitante acessou
    // o link compartilhado da família.

    const isSharedLink = checkSharedLink();

    if (isSharedLink) return;

    // Se não for um link compartilhado,
    // carregar os dados do organizador.

    loadSavedData();

    renderParticipants();

    // Se o sorteio já tiver sido realizado,
    // mostrar novamente o link único.

    if (drawResults) {

        organizerPanel.classList.add("hidden");

        resultsPanel.classList.remove("hidden");

        generateSharedLink();

    }

}

initialize();
