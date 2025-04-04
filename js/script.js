document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const generateBtn = document.getElementById("generate-btn");
  const routeContainer = document.getElementById("route-container");
  const tableBody = document.getElementById("employee-table-body");
  const resetBtn = document.getElementById("resetButton");

  let placeQueue = [];
  let groupedByPlace = {};
  let generatedPlaces = [];

  menuBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });

  resetBtn.addEventListener("click", () => {
    routeContainer.innerHTML = "";
    placeQueue = Object.keys(groupedByPlace);
    generatedPlaces = [];

    localStorage.removeItem("generatedPlaces");
    localStorage.removeItem("placeQueue");
  });

  // Load and Display Table
  fetch("/public/data/passengers.json")
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = "";

      data.employees.forEach((emp) => {
        const row = document.createElement("tr");
        row.className = "border-b";

        const nameDisplay =
          emp.name.length > 10 ? emp.name.slice(0, 10) + ".." : emp.name;

        row.innerHTML = `
          <td class="py-2">${String(emp.s1_no).padStart(2, "0")}</td>
          <td>${emp.empid}</td>
          <td class="truncate w-20">${nameDisplay}</td>
          <td class="font-bold">(${emp.gender[0].toUpperCase()})</td>
        `;

        tableBody.appendChild(row);
      });

      data.employees.forEach((emp) => {
        const place = emp.place.toUpperCase();
        if (!groupedByPlace[place]) groupedByPlace[place] = [];
        groupedByPlace[place].push(emp);
      });

      const storedPlaces = JSON.parse(localStorage.getItem("generatedPlaces") || "[]");
      const storedQueue = JSON.parse(localStorage.getItem("placeQueue") || "[]");

      generatedPlaces = storedPlaces;
      placeQueue = storedQueue.length ? storedQueue : Object.keys(groupedByPlace);

      generatedPlaces.forEach((placeName) => {
        createCard(placeName, groupedByPlace[placeName]);
      });
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
    });

    generateBtn?.addEventListener("click", () => {
      if (placeQueue.length === 0) {
        const alertBox = document.getElementById("alertBox");
        alertBox.classList.remove("hidden");
    
        setTimeout(() => {
          alertBox.classList.add("hidden");
        }, 3000);
    
        return;
      }
    
      const placeName = placeQueue.shift();
    
      if (generatedPlaces.includes(placeName)) {
        console.warn(`Card for ${placeName} already exists.`);
        return;
      }
    
      const passengers = groupedByPlace[placeName];
    
      createCard(placeName, passengers);
      generatedPlaces.push(placeName);
    
      localStorage.setItem("generatedPlaces", JSON.stringify(generatedPlaces));
      localStorage.setItem("placeQueue", JSON.stringify(placeQueue));
    });
    
  function createCard(placeName, passengers) {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg p-4 border border-gray-300 w-full sm:w-[300px] lg:w-[220px] h-[250px] overflow-hidden mb-5";

    card.innerHTML = `
      <div class="flex justify-between gap-5 items-center mb-5">
        <h2 class="text-blue-600 font-bold text-lg">${placeName}</h2>
        <i class="fas fa-pen text-blue-600 cursor-pointer"></i>
      </div>

      <div class="flex justify-between text-blue-600 mb-4">
        <div class="flex items-center gap-1"><i class="fas fa-users"></i><span>${passengers.length}</span></div>
        <div class="flex items-center gap-1"><i class="fas fa-user"></i><span>${
          passengers.filter((p) => p.gender === "Male").length
        }</span></div>
        <div class="flex items-center gap-1"><i class="fas fa-user"></i><span>${
          passengers.filter((p) => p.gender === "Female").length
        }</span></div>
        <div class="flex items-center gap-1 text-green-600"><i class="fas fa-user-check"></i><span>01</span></div>
      </div>

      <div class="mt-2">
        <ul class="passenger-list">
          ${passengers
            .map(
              (p) => `
            <li class="flex justify-between items-center py-1 border-b">
              <span class="text-gray-600">${p.empid}</span>
              <span class="text-gray-700">${
                p.name.length > 10 ? p.name.slice(0, 10) + ".." : p.name
              }</span>
              <span class="font-bold">(${p.gender[0].toUpperCase()})</span>
              <i class="fas fa-trash text-blue-600 cursor-pointer"></i>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>

      <div class="flex justify-between mt-3">
        <i class="fas fa-trash text-blue-800 cursor-pointer text-2xl"></i>
        <i class="fa-solid fa-print text-blue-800 cursor-pointer text-2xl"></i>
      </div>
    `;

    routeContainer.appendChild(card);
  }
});
