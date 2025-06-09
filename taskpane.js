const camposAsignados = {};

function showAlert(message) {
  alert(message);
}

async function asignarCampo() {
  const nombreCampo = document.getElementById("campoNombre").value.trim();
  if (!nombreCampo) {
    return showAlert("Debes ingresar un nombre de campo.");
  }

  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.load("text");
    await context.sync();

    const texto = selection.text.trim();
    if (!texto) {
      return showAlert("Debes seleccionar texto en el documento.");
    }

    camposAsignados[nombreCampo] = texto;
    showAlert(`Campo "${nombreCampo}" asignado a "${texto}".`);
  });
}

async function generarDocumento() {
  let datos;
  try {
    datos = JSON.parse(document.getElementById("datosJson").value);
  } catch {
    return showAlert("Formato JSON inválido.");
  }

  await Word.run(async (context) => {
    const body = context.document.body;
    const searchResultsMap = {};

    for (const [campo, valorOriginal] of Object.entries(camposAsignados)) {
      if (!valorOriginal) continue;
      const results = body.search(valorOriginal, { matchCase: false });
      results.load("items");
      searchResultsMap[campo] = results;
    }

    await context.sync();

    for (const [campo, results] of Object.entries(searchResultsMap)) {
      const nuevoValor = datos[campo] || "";
      results.items.forEach(item => item.insertText(nuevoValor, "Replace"));
    }

    await context.sync();
    showAlert("Documento actualizado con nuevos datos.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnAsignar").addEventListener("click", asignarCampo);
  document.getElementById("btnGenerar").addEventListener("click", generarDocumento);
});
