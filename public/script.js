document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("articleForm");
    const titulo = document.getElementById("titulo");
    const autores = document.getElementById("autores");
    const pdf = document.getElementById("pdf");
    const successMessage = document.getElementById("successMessage");
    const articlesContainer = document.getElementById("articlesContainer");

    let lastServerCount = 0;

    async function uploadArticle(article) {

        const formData = new FormData();
        formData.append("titulo", article.titulo);
        formData.append("autores", article.autores);
        formData.append("pdf", article.pdf);

        const response = await fetch("/api/articles", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error subiendo artículo");
        }

        const data = await response.json();
        return data;
    }

    async function fetchServerArticles() {

        try {

            const res = await fetch("/api/articles");

            if (!res.ok) return [];

            const articles = await res.json();

            lastServerCount = articles.length;

            return articles;

        } catch (err) {

            console.log("Sin conexión con servidor");
            return [];
        }
    }

    async function deleteServerArticle(id) {

        try {

            await fetch("/api/articles/" + id, {
                method: "DELETE"
            });

        } catch (err) {

            console.log("No se pudo eliminar en servidor");
        }
    }

    async function syncPendingArticles() {

        const articles = await getArticles();

        for (const article of articles) {

            if (article.pendingSync) {

                try {

                    await uploadArticle(article);

                    article.pendingSync = false;

                    await updateArticle(article);

                    console.log("Artículo sincronizado:", article.titulo);

                } catch (err) {

                    console.log("No se pudo sincronizar:", article.titulo);
                }

            }
        }

    }

    window.addEventListener("online", syncPendingArticles);

    async function renderArticles() {

        const localArticles = await getArticles();
        const serverArticles = await fetchServerArticles();

        articlesContainer.innerHTML = "";

        const articles = [...serverArticles];

        if (!articles.length && !localArticles.length) {

            articlesContainer.innerHTML = "<li>No hay artículos guardados.</li>";
            return;
        }

        articles.forEach((article) => {

            const li = document.createElement("li");
            li.classList.add("article-item");

            const title = document.createElement("strong");
            title.textContent = article.titulo;

            const br1 = document.createElement("br");

            const authors = document.createElement("span");
            authors.textContent = "Autores: " + article.autores;

            const br2 = document.createElement("br");

            const file = document.createElement("span");
            file.textContent = "Archivo PDF";

            const viewButton = document.createElement("button");
            viewButton.textContent = "Ver PDF";
            viewButton.style.marginRight = "0.5rem";

            viewButton.addEventListener("click", function () {

                const url = "/uploads/" + article.pdfPath;
                window.open(url, "_blank");

            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.classList.add("delete-btn");

            deleteButton.addEventListener("click", async function () {

                await deleteServerArticle(article._id);
                renderArticles();

            });

            li.appendChild(title);
            li.appendChild(br1);
            li.appendChild(authors);
            li.appendChild(br2);
            li.appendChild(file);
            li.appendChild(document.createElement("br"));
            li.appendChild(viewButton);
            li.appendChild(deleteButton);

            articlesContainer.appendChild(li);

        });

        localArticles
            .filter(a => a.pendingSync)
            .forEach((article) => {

                const li = document.createElement("li");
                li.classList.add("article-item");

                const title = document.createElement("strong");
                title.textContent = article.titulo + " (pendiente de sincronizar)";

                const br1 = document.createElement("br");

                const authors = document.createElement("span");
                authors.textContent = "Autores: " + article.autores;

                const viewButton = document.createElement("button");
                viewButton.textContent = "Ver PDF";

                viewButton.addEventListener("click", function () {

                    const url = URL.createObjectURL(article.pdf);
                    window.open(url);

                });

                li.appendChild(title);
                li.appendChild(br1);
                li.appendChild(authors);
                li.appendChild(document.createElement("br"));
                li.appendChild(viewButton);

                articlesContainer.appendChild(li);

            });

    }

    async function checkForUpdates() {

        if (!navigator.onLine) return;

        try {

            const res = await fetch("/api/articles");

            if (!res.ok) return;

            const articles = await res.json();

            if (articles.length !== lastServerCount) {

                console.log("Nuevo artículo detectado");

                lastServerCount = articles.length;

                successMessage.textContent = "Nuevo artículo disponible";

                renderArticles();

            }

        } catch (err) {

            console.log("No se pudo verificar actualizaciones");

        }

    }

    function showError(input, message) {

        const errorElement = input.nextElementSibling;
        errorElement.textContent = message;
        input.style.borderColor = "#d9534f";

    }

    function clearError(input) {

        const errorElement = input.nextElementSibling;
        errorElement.textContent = "";
        input.style.borderColor = "#ccc";

    }

    function validateTextField(input, fieldName) {

        if (input.value.trim() === "") {

            showError(input, `El campo ${fieldName} es obligatorio.`);
            return false;

        }

        clearError(input);
        return true;

    }

    function validatePDF(input) {

        if (input.files.length === 0) {

            showError(input, "Debe seleccionar un archivo PDF.");
            return false;

        }

        const file = input.files[0];

        if (file.type !== "application/pdf") {

            showError(input, "El archivo debe ser un PDF válido.");
            return false;

        }

        clearError(input);
        return true;

    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        successMessage.textContent = "";

        const isTituloValid = validateTextField(titulo, "Título");
        const isAutoresValid = validateTextField(autores, "Autores");
        const isPDFValid = validatePDF(pdf);

        if (!isTituloValid || !isAutoresValid || !isPDFValid) return;

        const newArticle = {

            titulo: titulo.value.trim(),
            autores: autores.value.trim(),
            pdf: pdf.files[0],
            createdAt: new Date(),
            pendingSync: !navigator.onLine

        };

        try {

            await addArticle(newArticle);

            if (navigator.onLine) {

                await uploadArticle(newArticle);

            }

            await renderArticles();

            successMessage.textContent = "Artículo guardado correctamente.";
            form.reset();

        } catch (err) {

            console.error(err);
        }

    });

    titulo.addEventListener("input", () => validateTextField(titulo, "Título"));
    autores.addEventListener("input", () => validateTextField(autores, "Autores"));
    pdf.addEventListener("change", () => validatePDF(pdf));

    renderArticles();
    syncPendingArticles();

    setInterval(checkForUpdates, 5000);

});