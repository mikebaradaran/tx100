document.addEventListener("DOMContentLoaded", () => {
    fetch("/startData")
        .then(res => res.json())
        .then(data => {
            if (!data || Object.keys(data).length === 0) {
                console.error("startData is empty");
                return;
            }
            setupForm(data);
        })
        .catch(err => console.error("Error loading startData:", err));
});

let courseData = {};

function setupForm(data) {
    courseData = data;

    // Safe defaults
    courseData.students = Array.isArray(courseData.students) ? courseData.students : [];
    courseData.pcs = Array.isArray(courseData.pcs) ? courseData.pcs : [];
   
    const evalLink = `https://evaluation.qa.com/Login.aspx?course=${courseData.code || ""}&pin=${courseData.pin || ""}`;

    // Title
    const titleEl = get("course_title");
    if (titleEl) {
        titleEl.innerHTML = `${courseData.course_title || ""} - ${courseData.courseDuration || ""} days
            <div id='trainer'>${courseData.trainer || ""}</div>`;
    }

    // Material link
    const material = get("material");
    if (material) material.href = courseData.material || "#";

    // Setup combobox
    const cboMessages = get("cboMessages");
    if (cboMessages) {
        cboMessages.addEventListener("change", () => onMessageChange(cboMessages, evalLink));
    }

    // Students + PCS links
    const ol = get("pcs");
    if (ol) {
        const allStudents = ["Trainer", ...courseData.students];
        allStudents.forEach((stu, i) => {
            if (!stu) return;
            ol.innerHTML += `<li><a href=${courseData.pcs[i]}>${stu}</a></li>`;
            // const li = document.createElement("li");
            // const a = document.createElement("a");

            // a.innerHTML = stu;
            // a.target = "_blank";

            // // Safe PCS link
            // a.href = courseData.pcs[i] || "#";

            // li.appendChild(a);
            // ol.appendChild(li);
        });
    }

    hideUnusedFields();
}

function onMessageChange(cboMessages, evalLink) {
    const qaTimer = get("qaTimer");
    const txtArea = get("txtArea");

    const opt = cboMessages.options[cboMessages.selectedIndex];
    if (!opt) return;

    const msg = opt.getAttribute("msg");
    const link = opt.getAttribute("link");
    const timerValue = opt.getAttribute("timer");
    const afa = opt.getAttribute("afa");

    if (afa) {
        copy(courseData.webex_email || "");
        return;
    }

    if (txtArea) txtArea.value = msg || "";

    // Timer logic
    if (qaTimer && typeof qaTimer.start === "function") {
        if (timerValue == 0) {
            qaTimer.stopTimer?.();
            qaTimer.message = "";
        } else if (timerValue) {
            qaTimer.timerValue = timerValue * 60;
            qaTimer.start(qaTimer.timerValue);
        }
    }

    // Links
    if (link === "evaluation") {
        window.open(evalLink, "_blank");
    }
}

function hideUnusedFields() {
    const fields = [
        { value: courseData.password1, el: document.getElementsByName("passwords")[0] },
        { value: courseData.password2, el: document.getElementsByName("passwords")[1] },
        { value: courseData.password3, el: document.getElementsByName("passwords")[2] },
        { value: courseData.mimeo, el: get("mimeo") }
    ];

    fields.forEach(({ value, el }) => {
        if (!el) return;
        if (!value || value.length < 2) {
            el.style.visibility = "hidden";
        }
    });
}

function copy(str) {
    if (!str) return;
    if (!navigator.clipboard) {
        console.warn("Clipboard API not available");
        return;
    }
    navigator.clipboard.writeText(str).catch(err => console.error("Copy failed:", err));
}

function get(id) {
    return document.getElementById(id);
}

function mimeo() {
    copy(courseData.mimeo || "");
    window.open("https://mimeo.digital/QALtd/distributions", "_blank");
}

function toggle(span) {
    const parent = span.parentElement;
    const children = Array.from(parent.children).slice(1);

    children.forEach(c => {
        c.style.display = (c.style.display === "none") ? "" : "none";
    });

    span.classList.toggle("rotated");
}
