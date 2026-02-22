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
  };
}

function validate(payload) {
  if (payload.pitch.length < 40) return 'Pitch should be at least 40 characters.';
  if (!payload.skills.length) return 'Please select at least one skill.';
  return '';
}

async function submitApplication(payload) {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || 'Failed to submit application.');
  }

  return body;
}

form.addEventListener('submit', async (event) => {
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

  try {
    const result = await submitApplication(payload);
    preview.textContent = JSON.stringify({ ...payload, applicationId: result.applicationId }, null, 2);
    previewSection.hidden = false;
    message.textContent = `Application submitted successfully. ID: ${result.applicationId}`;
    message.className = 'message success';
  } catch (err) {
    message.textContent = err.message;
    message.className = 'message error';
  }
});

resetBtn.addEventListener('click', () => {
  form.reset();
  previewSection.hidden = true;
  preview.textContent = '';
  message.textContent = '';
  message.className = 'message';
});
