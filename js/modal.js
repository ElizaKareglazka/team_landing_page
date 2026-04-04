/* ═══════════════════════════════════════════
   modal.js — Modal Logic
   ═══════════════════════════════════════════ */

const modalOverlay = document.getElementById('modalOverlay');

/**
 * Open team member modal
 */
function openTeamModal(member) {
  const photoContainer = document.getElementById('modalPhoto');
  photoContainer.innerHTML = '';
  photoContainer.appendChild(createPhotoElement(member.photo, member.name));

  document.getElementById('modalName').textContent = member.name;
  document.getElementById('modalRole').textContent = member.role;
  document.getElementById('modalBio').textContent = member.bio;

  document.getElementById('modalTags').innerHTML = member.skills
    .map(s => `<span class="modal-tag">${s}</span>`)
    .join('');

  document.getElementById('modalContacts').innerHTML = member.contacts
    .map(c => {
      const icon = c.type === 'email' ? icons.email : icons.telegram;
      const href = c.type === 'email'
        ? `mailto:${c.value}`
        : `https://t.me/${c.value.replace('@', '')}`;
      return `<a href="${href}" class="modal-contact" target="_blank">${icon}${c.value}</a>`;
    })
    .join('');

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on overlay click
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// Close button
document.getElementById('modalClose').addEventListener('click', closeModal);

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
