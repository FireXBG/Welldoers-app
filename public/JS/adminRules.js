function addRule() {
  const ruleContainer = document.querySelector(".rules-form");
  const existingRules = ruleContainer.querySelectorAll('[name^="rule"]');
  const newIndex = existingRules.length;

  const newInput = document.createElement("div");
  newInput.classList.add("rule-input-container");
  newInput.innerHTML = `
    <input type="text" name="rule_${newIndex}" placeholder="New Rule" />
    <button type="button" class="delete-rule" onclick="deleteRule(this)">Delete</button>
  `;
  if (existingRules.length > 0) {
    const lastAddRuleButton =
      ruleContainer.lastElementChild.previousElementSibling;
    ruleContainer.insertBefore(newInput, lastAddRuleButton);
  } else {
    ruleContainer.appendChild(newInput);
  }
}

function deleteRule(button) {
  const ruleContainer = button.parentNode;
  ruleContainer.parentNode.removeChild(ruleContainer);
}
