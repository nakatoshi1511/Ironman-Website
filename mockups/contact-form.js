const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const status = contactForm.querySelector("[data-form-status]");
  const submitButton = contactForm.querySelector("button[type='submit']");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      company_website: String(formData.get("company_website") || "").trim(),
    };

    if (status) {
      status.textContent = "Anfrage wird gesendet ...";
      status.dataset.state = "pending";
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("request failed");
      }

      contactForm.reset();

      if (status) {
        status.textContent = "Vielen Dank. Die Anfrage wurde gesendet.";
        status.dataset.state = "success";
      }
    } catch {
      if (status) {
        status.textContent =
          "Die Anfrage konnte nicht gesendet werden. Bitte nutzen Sie alternativ die oben angegebene E-Mail-Adresse.";
        status.dataset.state = "error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
