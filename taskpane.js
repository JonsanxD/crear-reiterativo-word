<!-- Archivo: taskpane.js -->
const camposAsignados = {};

function showAlert(message) {
  alert(message);
}

function actualizarUI() {
  const lista = document.getElementById("listaCampos");
  lista.innerHTML = "";
  const formulario = document.getElementById("formularioDatos");
  formulario.innerHTML = "";

  const campos = Object.keys(camposAsignados);
  if (campos.length === 0) {
    lista.innerHTML = `<div class="text-gray-400 italic flex items-center gap-2"><i class="fas fa-exclamation-circle"></i> No hay campos asignados todavía</div>`;
    return;
  }

  campos.forEach(campo => {
    // Lista de campos asignados
    const li = document.createElement("li");
    li.textContent = `${campo}: "${camposAsignados[campo]}"`;
    lista.appendChild(li);

    // Input para nuevo valor
    const div = document.createElement("div");
    div.className = "campo-input";
    const label = document.createElement("label");
    label.textContent = campo + ": ";
    const input = document.createElement("input");
    input.type = "text";
    input.id = `input_${campo}`;
    input.placeholder = `Nuevo valor para ${campo}`;
    div.appendChild(label);
    div.appendChild(input);
    formulario.appendChild(div);
  });
}

async function asignarCampo() {
  const nombreCampo = document.getElementById("campoNombre").value.trim();
  if (!nombreCampo) return showAlert("Debes ingresar un nombre de campo.");

  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.load("text");
    await context.sync();

    const texto = selection.text.trim();
    if (!texto) return showAlert("Debes seleccionar texto en el documento.");

    camposAsignados[nombreCampo] = texto;
    document.getElementById("campoNombre").value = "";
    actualizarUI();
    showAlert(`Campo "${nombreCampo}" asignado a "${texto}".`);
  });
}

async function generarDocumento() {
  const datos = {};
  Object.keys(camposAsignados).forEach(campo => {
    datos[campo] = document.getElementById(`input_${campo}`).value;
  });

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

function limpiarCampos() {
  Object.keys(camposAsignados).forEach(c => delete camposAsignados[c]);
  actualizarUI();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnAsignar").addEventListener("click", asignarCampo);
  document.getElementById("btnLimpiar").addEventListener("click", limpiarCampos);
  document.getElementById("btnGenerar").addEventListener("click", generarDocumento);
  actualizarUI();
});
