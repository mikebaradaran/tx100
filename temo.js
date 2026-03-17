let students = [
    "Oliver, Schone",
    "Thomas, Clarke",
    "James, Wright",
    "Farzaneh, Haghani",
    "Muhammad, Essat",
    "Jamie, Airey",
    "George, Sage",
    "Benjamin, Crump",
    "Kian, Winstanley",
    "Kevin, Leddy",
    "Benjamin, Harvey",
    "Christopher, Kelly",
    "Oliver, Dean Johnston",
    "Jamie, Birkett",
    "Deivis, Jankauskas"
];

students = students.map(student => {
    const parts = student.split(",");
    return parts[0].trim() + " " + parts[1].trim().substring(0, 3);
});

console.log(students);


