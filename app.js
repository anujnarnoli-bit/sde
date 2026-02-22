const form = document.getElementById('applicationForm');
const message = document.getElementById('formMessage');
const previewSection = document.getElementById('previewSection');
const preview = document.getElementById('preview');
const resetBtn = document.getElementById('resetBtn');

function getSelectedSkills() {
  return [...document.querySelectorAll('input[name="skills"]:checked')].map((el) => el.value);
}

function buildPayload(formData) {
  return {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    experience: Number(formData.get('experience')),
    stack: formData.get('stack'),
    skills: getSelectedSkills(),
    pitch: formData.get('pitch').trim(),
    submittedAt: new Date().toISOString(),
  };
}

function validate(payload) {
  if (payload.pitch.length < 40) return 'Pitch should be at least 40 characters.';
  if (!payload.skills.length) return 'Please select at least one skill.';
  return '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    message.textContent = 'Please complete all required fields correctly.';
    message.className = 'message error';
    return;
  }

  const payload = buildPayload(new FormData(form));
  const error = validate(payload);
  if (error) {
    message.textContent = error;
    message.className = 'message error';
    return;
  }

  preview.textContent = JSON.stringify(payload, null, 2);
  previewSection.hidden = false;
  message.textContent = 'Application submitted successfully (demo mode).';
  message.className = 'message success';
});

resetBtn.addEventListener('click', () => {
  form.reset();
  previewSection.hidden = true;
  preview.textContent = '';
  message.textContent = '';
  message.className = 'message';
});
