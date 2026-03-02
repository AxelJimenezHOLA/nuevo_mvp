document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("articleForm");
    const titulo = document.getElementById("titulo");
    const autores = document.getElementById("autores");
    const pdf = document.getElementById("pdf");
    const successMessage = document.getElementById("successMessage");
    const articlesContainer = document.getElementById("articlesContainer");

    async function renderArticles() {
        const articles = await getArticles();
        articlesContainer.innerHTML = "";

        if (!articles.length) {
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
            file.textContent = "Archivo: " + article.pdf.name;

            const viewButton = document.createElement("button");
            viewButton.textContent = "Ver PDF";
            viewButton.style.marginRight = "0.5rem";

            viewButton.addEventListener("click", function () {
                const url = URL.createObjectURL(article.pdf);
                window.open(url, "_blank");
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.classList.add("delete-btn");

            deleteButton.addEventListener("click", async function () {
                await deleteArticle(article.id);
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
        console.log("Artículos renderizados.");
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
        } else {
            clearError(input);
            return true;
        }
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

        if (isTituloValid && isAutoresValid && isPDFValid) {

            const newArticle = {
                titulo: titulo.value.trim(),
                autores: autores.value.trim(),
                pdf: pdf.files[0], // Guardamos el archivo REAL (Blob)
                createdAt: new Date()
            };

            await addArticle(newArticle);
            await renderArticles();

            successMessage.textContent = "Artículo guardado correctamente.";
            form.reset();
        }
    });

    titulo.addEventListener("input", () => validateTextField(titulo, "Título"));
    autores.addEventListener("input", () => validateTextField(autores, "Autores"));
    pdf.addEventListener("change", () => validatePDF(pdf));

    renderArticles();

});