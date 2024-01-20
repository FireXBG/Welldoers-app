document.addEventListener("DOMContentLoaded", function () {
  const rulesForm = document.querySelector(".rules-form");

  rulesForm.addEventListener("click", function (event) {
    if (event.target.matches("button.add-rule")) {
      addRule();
    } else if (event.target.matches("button.delete-rule")) {
      const rule = event.target.closest(".current_rule");
      deleteRule(rule);
    }
  });
});

function deleteRule(rule) {
  if (rule) {
    rule.remove();
  }
}

function addRule() {
  const rulesForm = document.querySelector(".rules-form");
  const rulesLength = document.querySelectorAll(".current_rule").length;

  const html = `
      <input type="text" name="rule"">
      <button type="button" class="delete-rule">Delete</button>
  `;

  const newRule = document.createElement("div");
  newRule.classList.add("current_rule");
  newRule.setAttribute("id", `rule${rulesLength}`);
  newRule.innerHTML = html;

  rulesForm.appendChild(newRule);
}
