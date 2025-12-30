
document.addEventListener('DOMContentLoaded', () => {
	const nameInput = document.getElementById('name');
	const bioInput = document.getElementById('bio');
	const skillInput = document.getElementById('skillInput');
	const addSkillBtn = document.getElementById('addSkillBtn');
	const skillsList = document.getElementById('skillsList');
	const form = document.getElementById('profileForm');
	const displayName = document.getElementById('displayName');
	const displayBio = document.getElementById('displayBio');
	const displaySkills = document.getElementById('displaySkills');
	const clearBtn = document.getElementById('clearBtn');
 	const clearProfileBtn = document.getElementById('clearProfileBtn');
	const editBtn = document.getElementById('editBtn');
	const avatarInput = document.getElementById('avatarInput');
	const removeAvatarBtn = document.getElementById('removeAvatarBtn');
	const displayAvatar = document.getElementById('displayAvatar');
	const formAvatarPreview = document.getElementById('formAvatarPreview');

	let currentProfile = { name: '', bio: '', skills: [], picture: undefined };

	function updateDisplay(profile) {
		displayName.textContent = profile.name || '—';
		displayBio.textContent = profile.bio || '';
		// render skills as tags
		displaySkills.innerHTML = '';
		const skills = profile.skills || [];
		skills.forEach((s, i) => {
			const chip = document.createElement('div');
			chip.className = 'tag';
			chip.style.padding = '6px 8px';
			chip.style.background = '#eef';
			chip.style.borderRadius = '16px';
			chip.style.display = 'inline-flex';
			chip.style.alignItems = 'center';
			chip.style.gap = '8px';
			chip.textContent = s;
			const removeBtn = document.createElement('button');
			removeBtn.textContent = '×';
			removeBtn.style.marginLeft = '8px';
			removeBtn.style.border = 'none';
			removeBtn.style.background = 'transparent';
			removeBtn.style.cursor = 'pointer';
			removeBtn.addEventListener('click', () => { removeSkill(i); });
			chip.appendChild(removeBtn);
			displaySkills.appendChild(chip);
		});
	}

	function updateAvatarDisplay(profile) {
		if (profile.picture) {
			displayAvatar.src = profile.picture;
			displayAvatar.style.display = 'inline-block';
			formAvatarPreview.src = profile.picture;
			formAvatarPreview.style.display = 'inline-block';
		} else {
			displayAvatar.src = '';
			displayAvatar.style.display = 'none';
			formAvatarPreview.src = '';
			formAvatarPreview.style.display = 'none';
		}
	}

	function saveProfile(profile) {
		localStorage.setItem('profile', JSON.stringify(profile));
		currentProfile = Object.assign({}, profile);
	}

	function loadProfile() {
		const stored = localStorage.getItem('profile');
		if (!stored) {
			currentProfile = { name: '', bio: '', skills: [], picture: undefined };
			updateDisplay(currentProfile);
			renderFormSkills();
			updateAvatarDisplay(currentProfile);
			return;
		}
		try {
			const profile = JSON.parse(stored);
			currentProfile = {
				name: profile.name || '',
				bio: profile.bio || '',
				skills: Array.isArray(profile.skills) ? profile.skills : [],
				picture: profile.picture || undefined
			};
			nameInput.value = currentProfile.name;
			bioInput.value = currentProfile.bio;
			updateDisplay(currentProfile);
			renderFormSkills();
			updateAvatarDisplay(currentProfile);
		} catch (e) {
			console.error('Invalid profile in storage', e);
		}
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		currentProfile.name = nameInput.value.trim();
		currentProfile.bio = bioInput.value.trim();
		saveProfile(currentProfile);
		updateDisplay(currentProfile);
	});

	// Live-update: as the user types, update display and persist immediately
	const liveUpdate = () => {
		currentProfile.name = nameInput.value.trim();
		currentProfile.bio = bioInput.value.trim();
		updateDisplay(currentProfile);
		saveProfile(currentProfile);
	};

	nameInput.addEventListener('input', liveUpdate);
	bioInput.addEventListener('input', liveUpdate);

	// Skills management
	function renderFormSkills() {
		skillsList.innerHTML = '';
		(currentProfile.skills || []).forEach((s, i) => {
			const chip = document.createElement('div');
			chip.style.padding = '6px 8px';
			chip.style.background = '#def';
			chip.style.borderRadius = '16px';
			chip.style.display = 'inline-flex';
			chip.style.alignItems = 'center';
			chip.style.gap = '8px';
			chip.textContent = s;
			const removeBtn = document.createElement('button');
			removeBtn.textContent = '×';
			removeBtn.style.marginLeft = '8px';
			removeBtn.style.border = 'none';
			removeBtn.style.background = 'transparent';
			removeBtn.style.cursor = 'pointer';
			removeBtn.addEventListener('click', () => { removeSkill(i); });
			chip.appendChild(removeBtn);
			skillsList.appendChild(chip);
		});
	}

	function addSkill() {
		const v = (skillInput.value || '').trim();
		if (!v) return;
		// avoid duplicates (case-insensitive)
		const exists = (currentProfile.skills || []).some(s => s.toLowerCase() === v.toLowerCase());
		if (exists) { skillInput.value = ''; return; }
		currentProfile.skills = currentProfile.skills || [];
		currentProfile.skills.push(v);
		saveProfile(currentProfile);
		renderFormSkills();
		updateDisplay(currentProfile);
		skillInput.value = '';
		skillInput.focus();
	}

	function removeSkill(index) {
		if (!currentProfile.skills) return;
		currentProfile.skills.splice(index, 1);
		saveProfile(currentProfile);
		renderFormSkills();
		updateDisplay(currentProfile);
	}

	addSkillBtn.addEventListener('click', addSkill);
	skillInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });

	// Avatar handling: read file as DataURL and save to profile
	function handleAvatarFile(file) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function (ev) {
			const dataUrl = ev.target.result;
			currentProfile.picture = dataUrl;
			saveProfile(currentProfile);
			updateAvatarDisplay(currentProfile);
		};
		reader.readAsDataURL(file);
	}

	avatarInput.addEventListener('change', (e) => {
		const file = e.target.files && e.target.files[0];
		handleAvatarFile(file);
	});

	removeAvatarBtn.addEventListener('click', () => {
		currentProfile.picture = undefined;
		saveProfile(currentProfile);
		updateAvatarDisplay(currentProfile);
		// also clear file input
		avatarInput.value = '';
	});

	if (editBtn) editBtn.addEventListener('click', () => { nameInput.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

	function clearProfile() {
		localStorage.removeItem('profile');
		currentProfile = { name: '', bio: '', skills: [], picture: undefined };
		nameInput.value = '';
		bioInput.value = '';
		skillInput.value = '';
		avatarInput.value = '';
		renderFormSkills();
		updateDisplay(currentProfile);
		updateAvatarDisplay(currentProfile);
	}

	clearBtn.addEventListener('click', clearProfile);
	if (clearProfileBtn) clearProfileBtn.addEventListener('click', clearProfile);

	loadProfile();
});
