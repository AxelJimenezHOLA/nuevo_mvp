document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("articleForm");
    const titulo = document.getElementById("titulo");
    const autores = document.getElementById("autores");
    const pdf = document.getElementById("pdf");
    const successMessage = document.getElementById("successMessage");
    const articlesContainer = document.getElementById("articlesContainer");

    // Obtener artículos almacenados
    function getStoredArticles() {
        return JSON.parse(localStorage.getItem("articulos")) || [];
    }

    // Guardar artículos en localStorage
    function saveArticles(articles) {
        localStorage.setItem("articulos", JSON.stringify(articles));
    }

    // Renderizar lista
// Renderizar lista
function renderArticles() {
  const articles = getStoredArticles();
  articlesContainer.innerHTML = "";

  articles.forEach((article, index) => {

    const li = document.createElement("li");
    li.classList.add("article-item");

    const title = document.createElement("strong");
    title.textContent = article.titulo;

    const br1 = document.createElement("br");

    const authors = document.createElement("span");
    authors.textContent = "Autores: " + article.autores;

    const br2 = document.createElement("br");

    const file = document.createElement("span");
    file.textContent = "Archivo: " + article.pdfName;

    // BOTÓN ELIMINAR
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.classList.add("delete-btn");

    deleteButton.addEventListener("click", function () {
      const updatedArticles = getStoredArticles();
      updatedArticles.splice(index, 1);
      saveArticles(updatedArticles);
      renderArticles();
    });

    li.appendChild(title);
    li.appendChild(br1);
    li.appendChild(authors);
    li.appendChild(br2);
    li.appendChild(file);
    li.appendChild(deleteButton);

    articlesContainer.appendChild(li);
  });
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

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        successMessage.textContent = "";

        const isTituloValid = validateTextField(titulo, "Título");
        const isAutoresValid = validateTextField(autores, "Autores");
        const isPDFValid = validatePDF(pdf);

        if (isTituloValid && isAutoresValid && isPDFValid) {

            const articles = getStoredArticles();

            const newArticle = {
                titulo: titulo.value.trim(),
                autores: autores.value.trim(),
                pdfName: pdf.files[0].name
            };

            articles.push(newArticle);
            saveArticles(articles);
            renderArticles();

            successMessage.textContent = "Artículo guardado correctamente.";
            form.reset();
        }
    });

    titulo.addEventListener("input", () => validateTextField(titulo, "Título"));
    autores.addEventListener("input", () => validateTextField(autores, "Autores"));
    pdf.addEventListener("change", () => validatePDF(pdf));

    // Cargar artículos al iniciar
    renderArticles();

});
