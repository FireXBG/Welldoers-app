// adminAddService.js
const addButton = document.querySelector(".add-service");
const deleteButtons = document.querySelectorAll(".delete-service");

addButton.addEventListener("click", createNewField);
deleteButtons.forEach((button) =>
  button.addEventListener("click", deleteField)
);

function createNewField() {
  const tableBody = document.querySelector("tbody");

  const newRow = document.createElement("tr");

  const serviceCell = document.createElement("td");
  const serviceInput = document.createElement("input");
  serviceInput.type = "text";
  serviceInput.name = "services[]";
  serviceInput.required = true;
  serviceCell.appendChild(serviceInput);
  newRow.appendChild(serviceCell);

  const priceCell = document.createElement("td");
  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.name = "prices[]";
  priceInput.required = true;
  priceCell.appendChild(priceInput);
  newRow.appendChild(priceCell);

  const deleteCell = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-service";
  deleteButton.classList.add("button1");
  deleteButton.textContent = "Delete";
  deleteCell.appendChild(deleteButton);
  newRow.appendChild(deleteCell);

  tableBody.appendChild(newRow);

  // Update event listener for delete buttons
  deleteButton.addEventListener("click", deleteField);
}

function deleteField(event) {
  const tableRow = event.target.closest("tr");
  tableRow.remove();
}
