let studentInfo = {}; 

// Función para cargar datos de Google Sheets
function fetchSheetData() {
    const SHEET_API_URL = "https://sheets.googleapis.com/v4/spreadsheets/1ggSQM2O96l2ljxubwdBdHxYuHaKpQTAEktVNyiJMtW4/values/BD!A:J?key=AIzaSyAZ5zOnneojWmE5cPKquaG3DpjyZgS-Pv4";
    const studentId = document.getElementById("student-id").value.trim();

    if (!studentId) {
        alert("Por favor, ingresa un ID de estudiante.");
        return;
    }

    fetch(SHEET_API_URL)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            if (!rows) {
                alert("No se encontraron datos en la hoja.");
                return;
            }

            const headers = rows[0];
            const students = rows.slice(1).map(row => {
                const student = {};
                headers.forEach((header, index) => {
                    student[header] = row[index] || "";
                });
                return student;
            });

            const student = students.find(s => s.ID === studentId);

            if (student) {
                studentInfo = {
                    nombre: student.Nombre || "N/A",
                    tipoBeca: student["Tipo de beca"] || "N/A",
                    categoria: student.Categoria || "N/A",
                    porcentaje: student["%"] || "N/A",
                    prepa: student.Prepa || "N/A",
                    programa: student.Programa || "N/A",
                    escuela: student["Escuela de procedencia"] || "N/A",
                    colegiaturaPr25: student["Colegiatura Pr25 (con beca descontada)"] || "N/A"
                };

                displayStudentInfo(studentInfo);
                document.getElementById("calculation-section").style.display = "block";
            } else {
                alert("Estudiante no encontrado.");
            }
        })
        .catch(error => console.error("Error al obtener los datos:", error));
}

// Función para mostrar la información
function displayStudentInfo(student) {
    const container = document.getElementById("data-container");
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>%</th>
                    <th>Tipo de beca</th>
                    <th>Categoría</th>
                    <th>Prepa</th>
                    <th>Programa</th>
                    <th>Escuela de procedencia</th>
                    <th>Colegiatura Pr25</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${student.nombre}</td>
                    <td>${student.porcentaje}</td>
                    <td>${student.tipoBeca}</td>
                    <td>${student.categoria}</td>
                    <td>${student.prepa}</td>
                    <td>${student.programa}</td>
                    <td>${student.escuela}</td>
                    <td>${student.colegiaturaPr25}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// Función para calcular colegiatura
function calculateProfessionalTuition() {
    const scholarship = parseFloat(document.getElementById("professional-scholarship").value);
    const credits = parseInt(document.getElementById("credits").value);
    const selectedProgram = document.getElementById("program").value;

    // Definir costos por crédito según el programa
    let costPerCredit;
    switch (selectedProgram) {
        case "MCP":
            costPerCredit = 4920;
            break;
        case "Arte y Diseño":
            costPerCredit = 4597.5;
            break;
        case "General":
            costPerCredit = 4480;
            break;
        default:
            costPerCredit = 0;
            break;
    }

    if (isNaN(scholarship) || isNaN(credits) || costPerCredit === 0) {
        alert("Por favor, ingresa valores válidos.");
        return;
    }

    const tuition = credits * costPerCredit * (1 - scholarship / 100);
    const difference = tuition - parseFloat(studentInfo.colegiaturaPr25.replace(/[^0-9.-]+/g, ""));

    // Formato americano para números
    const formattedTuition = tuition.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const formattedDifference = difference.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    // Mostrar mensaje dinámico en la aplicación
    showMessage(
        `
        <p><strong>Colegiatura profesional Ot25:</strong> $${formattedTuition}</p>
        <p><strong>Pago adicional en Profesional:</strong> $${formattedDifference}</p>
        `,
        "Simulación de Profesional"
    );
}

// Función para mostrar un mensaje dinámico
function showMessage(content, title = "Mensaje") {
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-overlay";
    messageContainer.innerHTML = `
        <div class="message-box">
            <h3>${title}</h3>
            <div class="message-content">${content}</div>
            <button class="btn-close" onclick="closeMessage()">Cerrar</button>
        </div>
    `;
    document.body.appendChild(messageContainer);
}

// Función para cerrar el mensaje dinámico
function closeMessage() {
    const messageContainer = document.querySelector(".message-overlay");
    if (messageContainer) {
        document.body.removeChild(messageContainer);
    }
}
