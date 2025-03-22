document.getElementById("noteForm").addEventListener("submit", async function (event) {
    event.preventDefault();  // ✅ Prevent page reload

    const noteId = document.getElementById("noteId").value.trim();
    const title = document.getElementById("title").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const important = document.getElementById("important").checked;

    if (!title || !desc) {
        alert("Title and Description cannot be empty.");
        return;
    }

    const noteData = { title, desc, important };

    try {
        if (noteId) {
            console.log("Updating Note:", noteId, noteData);
            const response = await fetch(`/notes/${noteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(noteData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Note updated successfully!");
                location.reload();
            } else {
                console.error("Update Failed:", result);
                alert("Failed to update note. Reason: " + result.detail);
            }
        } else {
            console.log("Creating New Note:", noteData);
            const response = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(noteData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Note added successfully!");
                location.reload();
            } else {
                console.error("Post Failed:", result);
                alert("Failed to add note. Reason: " + result.detail);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});

// ✅ Read Note Modal Function (Updated for long text)
function readNote(title, desc) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDesc").textContent = desc;
    $('#readNoteModal').modal('show');
}
// ✅ Attach event listener to all Read buttons dynamically
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".read-btn").forEach(button => {
        button.addEventListener("click", function () {
            const title = this.getAttribute("data-title");
            const desc = this.getAttribute("data-desc").replace(/&#10;/g, '\n');  // ✅ Convert back newlines

            document.getElementById("modalTitle").textContent = title;
            document.getElementById("modalDesc").textContent = desc;
            $('#readNoteModal').modal('show');
        });
    });
});


// ✅ Fix: Stop speech before starting a new one
function readAloud() {
    const text = document.getElementById("modalDesc").textContent;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();  // ✅ Stop any ongoing speech
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    } else {
        alert("Sorry, your browser does not support text-to-speech.");
    }
}

// ✅ Edit Note Function
function editNote(event, noteId) {
    event.preventDefault();
    
    const button = document.querySelector(`button[onclick="editNote(event, '${noteId}')"]`);
    
    if (button) {
        const title = button.getAttribute("data-title");
        const desc = button.getAttribute("data-desc").replace(/&#10;/g, '\n');  // ✅ Convert back newlines
        const important = button.getAttribute("data-important") === "true";

        document.getElementById("noteId").value = noteId;
        document.getElementById("title").value = title;
        document.getElementById("desc").value = desc;
        document.getElementById("important").checked = important;
        document.getElementById("submitBtn").textContent = "Update Note";
    }
}

// ✅ Delete Note Function
async function deleteNote(noteId) {
    if (confirm("Are you sure you want to delete this note?")) {
        const response = await fetch(`/notes/${noteId}`, { method: "DELETE" });
        if (response.ok) {
            alert("Note deleted successfully!");
            location.reload();
        } else {
            alert("Failed to delete note.");
        }
    }
}
