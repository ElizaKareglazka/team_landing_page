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

/* ─── Project Modal ─── */
const projectModalOverlay = document.getElementById('projectModalOverlay');

function openProjectModal(project) {
  // Hide cover
  document.getElementById('projectModalCover').style.display = 'none';

  document.getElementById('projectModalTag').textContent = project.tag;
  document.getElementById('projectModalTitle').textContent = project.title;
  document.getElementById('projectModalDesc').textContent = project.desc;
  document.getElementById('projectModalTask').textContent = project.task;
  document.getElementById('projectModalResult').innerHTML = project.result;

  // Subprojects
  const subContainer = document.getElementById('projectModalSubprojects');
  if (project.subprojects && project.subprojects.length > 0) {
    subContainer.innerHTML = project.subprojects
      .map(sp => `
        <div class="subproject-section">
          <h4 class="subproject-title">${sp.title}</h4>
          <p class="subproject-desc">${sp.desc}</p>
          <div class="modal-section">
            <div class="modal-section-title">Задача</div>
            <p>${sp.task}</p>
          </div>
          <div class="modal-section">
            <div class="modal-section-title">Результат</div>
            <p>${sp.result}</p>
          </div>
        </div>
      `)
      .join('');
  } else {
    subContainer.innerHTML = '';
  }

  document.getElementById('projectModalStack').innerHTML = project.stack
    .map(s => `<span class="modal-tag">${s}</span>`)
    .join('');

  projectModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  projectModalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

projectModalOverlay.addEventListener('click', e => {
  if (e.target === projectModalOverlay) closeProjectModal();
});
document.getElementById('projectModalClose').addEventListener('click', closeProjectModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProjectModal();
});
