document.addEventListener('DOMContentLoaded', () => {
  const storageKeys = {
    profiles: 'rocks-volunteer-profiles-v1',
    opportunities: 'rocks-volunteer-opportunities-v1',
    applications: 'rocks-volunteer-applications-v1',
    currentProfile: 'rocks-current-volunteer-profile-v1',
    role: 'rocks-volunteer-demo-role-v1'
  };
  const demoProfiles = [
    {
      id: 'demo-volunteer-1',
      name: 'Jordan Example',
      memberType: 'Active',
      email: 'jordan@example.test',
      phone: '',
      chapter: 'Capital Region',
      city: 'Arlington',
      state: 'VA',
      timeZone: 'Eastern',
      serviceCategory: 'Army',
      rank: 'Retired officer',
      interests: ['Mentoring', 'Professional development'],
      skills: 'Leadership and mentoring',
      availability: 'Recurring service',
      hoursAvailable: '4',
      serviceModes: ['Virtual', 'In person'],
      notifications: true,
      approvedHours: 24
    },
    {
      id: 'demo-volunteer-2',
      name: 'Taylor Sample',
      memberType: 'Retired',
      email: 'taylor@example.test',
      phone: '',
      chapter: 'Great Lakes',
      city: 'Chicago',
      state: 'IL',
      timeZone: 'Central',
      serviceCategory: 'USAR',
      rank: 'Warrant Officer',
      interests: ['Scholarships', 'Event planning'],
      skills: 'Project management and finance',
      availability: 'One-time event',
      hoursAvailable: '2',
      serviceModes: ['In person'],
      notifications: true,
      approvedHours: 12
    },
    {
      id: 'demo-volunteer-3',
      name: 'Casey Demo',
      memberType: 'Guest volunteer',
      email: 'casey@example.test',
      phone: '',
      chapter: 'Capital Region',
      city: 'Washington',
      state: 'DC',
      timeZone: 'Eastern',
      serviceCategory: 'Non-member',
      rank: '',
      interests: ['Communications', 'Community service'],
      skills: 'Marketing and communications',
      availability: 'Short-term project',
      hoursAvailable: '3',
      serviceModes: ['Virtual'],
      notifications: false,
      approvedHours: 0
    }
  ];
  const demoOpportunities = [
    {
      id: 'demo-opportunity-1',
      title: 'Mentor the next generation',
      chapter: 'National',
      mission: 'Mentorship',
      description: 'Meet virtually with an Army professional for a focused career and leadership conversation.',
      date: '2026-11-12',
      location: 'Virtual',
      hours: 2,
      openings: 8,
      skills: 'Leadership or mentoring experience'
    },
    {
      id: 'demo-opportunity-2',
      title: 'Chapter community service day',
      chapter: 'Capital Region',
      mission: 'Community service',
      description: 'Help welcome participants and coordinate on-site activities at a local service event.',
      date: '2026-11-21',
      location: 'Arlington, VA',
      hours: 4,
      openings: 5,
      skills: 'Event support; all experience levels welcome'
    },
    {
      id: 'demo-opportunity-3',
      title: 'Scholarship application review',
      chapter: 'National',
      mission: 'Scholarships',
      description: 'Support a review team by organizing applications and providing consistent rubric-based feedback.',
      date: '2026-12-03',
      location: 'Virtual',
      hours: 3,
      openings: 4,
      skills: 'Attention to detail; scholarship experience helpful'
    }
  ];
  const demoApplications = [
    {
      id: 'demo-application-1',
      profileId: 'demo-volunteer-1',
      opportunityId: 'demo-opportunity-1',
      status: 'Under Review',
      submittedAt: '2026-10-01T12:00:00.000Z'
    }
  ];

  const form = document.querySelector('#volunteer-form');
  const profileFeedback = document.querySelector('#profile-feedback');
  const profileIdInput = document.querySelector('#profile-id');
  const rosterBody = document.querySelector('#roster-body');
  const rosterSearch = document.querySelector('#roster-search');
  const opportunityList = document.querySelector('#opportunity-list');
  const opportunityEmpty = document.querySelector('#opportunity-empty');
  const rosterEmpty = document.querySelector('#roster-empty');
  let profiles;
  let opportunities;
  let applications;
  let currentProfileId;
  let demoRole;
  let adminEditingProfile = false;

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  const readList = (key, defaults) => {
    const saved = localStorage.getItem(key);
    if (saved === null) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error(`Saved volunteer data for ${key} is not in the expected format.`);
    }
    return parsed;
  };

  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const findCurrentProfile = () => profiles.find((profile) => profile.id === currentProfileId);

  const profileCompletion = (profile) => {
    if (!profile) return 0;
    const completed = [
      profile.name,
      profile.memberType,
      profile.email,
      profile.chapter,
      profile.interests && profile.interests.length,
      profile.availability,
      profile.skills
    ].filter(Boolean).length;
    return Math.round((completed / 7) * 100);
  };

  const renderStats = () => {
    document.querySelector('#volunteer-count').textContent = String(profiles.length);
    document.querySelector('#hours-count').textContent = String(
      profiles.reduce((total, profile) => total + (Number(profile.approvedHours) || 0), 0)
    );
    document.querySelector('#opportunity-count').textContent = String(opportunities.length);
  };

  const renderOpportunities = () => {
    const currentApplications = applications.filter((application) => application.profileId === currentProfileId);
    opportunityList.innerHTML = opportunities.map((opportunity) => {
      const applicantCount = applications.filter((application) => application.opportunityId === opportunity.id).length;
      const alreadyApplied = currentApplications.some((application) => application.opportunityId === opportunity.id);
      const full = applicantCount >= Number(opportunity.openings);
      const coordinatorMode = demoRole === 'coordinator';
      const disabled = !coordinatorMode && (alreadyApplied || full);
      const buttonLabel = coordinatorMode ? 'Coordinator view' : alreadyApplied ? 'Application received' : full ? 'Opportunity full' : 'Volunteer now';
      const applicants = applications.filter((application) => application.opportunityId === opportunity.id);
      const applicantContent = applicants.length
        ? applicants.map((application) => {
          const profile = profiles.find((item) => item.id === application.profileId);
          return `<li><strong>${escapeHtml(profile ? profile.name : 'Unknown volunteer')}</strong><span>${escapeHtml(application.status || 'Submitted')}</span></li>`;
        }).join('')
        : '<li class="opportunity-no-applicants">No one has signed up yet.</li>';
      const openingsLeft = Math.max(0, Number(opportunity.openings) - applicantCount);
      return `<article class="opportunity-card">
        <span class="opportunity-tag">${escapeHtml(opportunity.mission)} · ${escapeHtml(opportunity.chapter)}</span>
        <h3>${escapeHtml(opportunity.title)}</h3>
        <p>${escapeHtml(opportunity.description)}</p>
        <ul class="opportunity-details">
          <li><strong>Date:</strong> ${escapeHtml(opportunity.date)}</li>
          <li><strong>Location:</strong> ${escapeHtml(opportunity.location)}</li>
          <li><strong>Time:</strong> About ${escapeHtml(opportunity.hours)} hours</li>
          <li><strong>Looking for:</strong> ${escapeHtml(opportunity.skills)}</li>
          <li><strong>Openings:</strong> ${openingsLeft} of ${escapeHtml(opportunity.openings)} available</li>
        </ul>
        <button class="btn btn-dark" type="button" ${coordinatorMode ? `data-opportunity-applicants="${escapeHtml(opportunity.id)}" aria-expanded="false" aria-controls="applicants-${escapeHtml(opportunity.id)}"` : `data-apply="${escapeHtml(opportunity.id)}"`} ${disabled ? 'disabled' : ''}>${buttonLabel}</button>
        ${coordinatorMode ? `<div class="opportunity-applicants" id="applicants-${escapeHtml(opportunity.id)}" hidden>
          <h4>Signed up · ${applicantCount}</h4>
          <p><strong>${openingsLeft}</strong> ${openingsLeft === 1 ? 'slot' : 'slots'} left</p>
          <ul>${applicantContent}</ul>
        </div>` : ''}
      </article>`;
    }).join('');
    opportunityEmpty.hidden = opportunities.length > 0;
  };

  const renderRoster = () => {
    const query = rosterSearch.value.trim().toLocaleLowerCase();
    const filteredProfiles = profiles.filter((profile) => [
      profile.name, profile.email, profile.chapter, profile.interests.join(' '), profile.skills
    ].join(' ').toLocaleLowerCase().includes(query));
    rosterBody.innerHTML = filteredProfiles.map((profile) => `<tr>
      <td><strong>${escapeHtml(profile.name)}</strong><br>${escapeHtml(profile.city)}${profile.city && profile.state ? ', ' : ''}${escapeHtml(profile.state)}</td>
      <td>${escapeHtml(profile.memberType)}</td>
      <td>${escapeHtml(profile.chapter || '—')}</td>
      <td>${escapeHtml(profile.interests.join(', ') || '—')}</td>
      <td>${escapeHtml(profile.availability || '—')}${profile.hoursAvailable ? `<br>${escapeHtml(profile.hoursAvailable)} hrs/month` : ''}</td>
      <td class="roster-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>${profile.phone ? `<a href="tel:${escapeHtml(profile.phone)}">${escapeHtml(profile.phone)}</a>` : ''}</td>
      <td><button class="btn btn-dark" type="button" data-edit-profile="${escapeHtml(profile.id)}">Edit</button></td>
    </tr>`).join('');
    rosterEmpty.hidden = filteredProfiles.length > 0;
    document.querySelector('#roster-summary').textContent =
      `Showing ${filteredProfiles.length} of ${profiles.length} volunteer${profiles.length === 1 ? '' : 's'}.`;
  };

  const renderApplications = () => {
    const rows = applications.map((application) => {
      const profile = profiles.find((item) => item.id === application.profileId);
      const opportunity = opportunities.find((item) => item.id === application.opportunityId);
      return {
        volunteer: profile ? profile.name : 'Unknown volunteer',
        opportunity: opportunity ? opportunity.title : 'Opportunity no longer available',
        chapter: opportunity ? opportunity.chapter : '—',
        status: application.status || 'Submitted',
        submittedAt: application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : '—'
      };
    });
    document.querySelector('#application-body').innerHTML = rows.map((application, index) => {
      const source = applications[index];
      const approved = application.status === 'Approved';
      const decision = demoRole === 'coordinator'
        ? `<button class="btn ${approved ? 'btn-outline' : 'btn-dark'}" type="button" data-application-action="${approved ? 'unapprove' : 'approve'}" data-application-id="${escapeHtml(source.id)}">${approved ? 'Unapprove' : 'Approve'}</button>`
        : 'Coordinator review';
      return `<tr>
      <td>${escapeHtml(application.volunteer)}</td>
      <td>${escapeHtml(application.opportunity)}</td>
      <td>${escapeHtml(application.chapter)}</td>
      <td><span class="application-status" data-status="${escapeHtml(application.status)}">${escapeHtml(application.status)}</span></td>
      <td>${escapeHtml(application.submittedAt)}</td>
      <td>${decision}</td>
    </tr>`;
    }).join('');
    document.querySelector('#application-empty').hidden = rows.length > 0;
  };

  const renderMemberDashboard = () => {
    const profile = findCurrentProfile();
    if (!profile) return;
    const memberApplications = applications.filter((application) => application.profileId === currentProfileId);
    const pendingApplications = memberApplications.filter((application) =>
      ['Submitted', 'Under Review', 'Information Needed'].includes(application.status)
    );
    document.querySelector('#member-dashboard-name').textContent = profile.name.split(' ')[0];
    document.querySelector('#member-applications-count').textContent = String(memberApplications.length);
    document.querySelector('#member-pending-count').textContent = String(pendingApplications.length);
    document.querySelector('#member-approved-hours').textContent = String(Number(profile.approvedHours) || 0);
    document.querySelector('#member-profile-completion').textContent = `${profileCompletion(profile)}%`;
    const latestDecision = memberApplications
      .filter((application) => application.reviewedAt)
      .sort((first, second) => new Date(second.reviewedAt) - new Date(first.reviewedAt))[0];
    const statusUpdate = document.querySelector('#member-status-update');
    if (latestDecision) {
      const opportunity = opportunities.find((item) => item.id === latestDecision.opportunityId);
      const opportunityName = opportunity ? opportunity.title : 'your volunteer opportunity';
      const approved = latestDecision.status === 'Approved';
      document.querySelector('#member-status-title').textContent = approved
        ? 'Your application has been approved'
        : 'Your application is not approved yet';
      document.querySelector('#member-status-message').textContent = approved
        ? `You’re confirmed for ${opportunityName}. We look forward to seeing you soon.`
        : `Your application for ${opportunityName} has been returned to Under Review.`;
      document.querySelector('#member-status-date').textContent =
        `Updated ${new Date(latestDecision.reviewedAt).toLocaleString()}`;
      statusUpdate.dataset.status = approved ? 'approved' : 'review';
      statusUpdate.hidden = false;
    } else {
      statusUpdate.hidden = true;
    }
    const applicationList = document.querySelector('#member-application-list');
    applicationList.innerHTML = memberApplications.length ? memberApplications.map((application) => {
      const opportunity = opportunities.find((item) => item.id === application.opportunityId);
      const status = application.status || 'Submitted';
      return `<div class="member-application">
        <div><strong>${escapeHtml(opportunity ? opportunity.title : 'Volunteer opportunity')}</strong>
        <span>${escapeHtml(opportunity ? opportunity.date : '')}${opportunity ? ` · ${escapeHtml(opportunity.chapter)}` : ''}</span></div>
        <span class="application-status">${escapeHtml(status)}</span>
      </div>`;
    }).join('') : '<p class="empty-state">No applications yet. Browse opportunities when you are ready to help.</p>';
  };

  const renderRole = () => {
    const hasRole = demoRole === 'volunteer' || demoRole === 'coordinator';
    const isVolunteer = demoRole === 'volunteer';
    document.querySelector('#demo-session').hidden = !hasRole;
    document.querySelector('#role-prompt').hidden = hasRole;
    document.querySelector('#demo-session-role').textContent = isVolunteer
      ? 'Volunteer / Member'
      : demoRole === 'coordinator' ? 'Chapter Coordinator / Admin demo' : '';
    document.querySelector('#my-activity').hidden = !isVolunteer || !findCurrentProfile();
    document.querySelector('#volunteer-profile').hidden = !isVolunteer && !adminEditingProfile;
    document.querySelector('#coordinator').hidden = demoRole !== 'coordinator';
    document.querySelector('#volunteer-profile .profile-intro h2').textContent = isVolunteer
      ? 'Tell us how you’d like to serve.'
      : 'Update volunteer profile.';
    updateFormValidation();
    renderOpportunities();
    if (isVolunteer) renderMemberDashboard();
  };

  const updateProgress = () => {
    const completed = [
      form.elements.name.value.trim(),
      form.elements.email.value.trim(),
      form.elements.memberType.value,
      form.elements.chapter.value.trim(),
      form.querySelectorAll('input[name="interests"]:checked').length,
      form.elements.availability.value,
      form.elements.skills.value.trim()
    ].filter(Boolean).length;
    const percentage = Math.round((completed / 7) * 100);
    const progress = document.querySelector('#profile-progress');
    progress.setAttribute('aria-valuenow', String(percentage));
    progress.querySelector('span').style.width = `${percentage}%`;
    document.querySelector('#profile-progress-label').textContent = `${percentage}%`;
  };

  const updateFormValidation = () => {
    const coordinatorEditing = demoRole === 'coordinator' && adminEditingProfile;
    form.noValidate = coordinatorEditing;
    document.querySelector('#profile-form-hint').textContent = coordinatorEditing
      ? 'You can save updates to an incomplete profile without filling every field.'
      : 'Fields marked with * are required. Please fill in your own information; details are not prefilled.';
  };

  const setForm = (profile) => {
    form.elements.name.value = profile.name || '';
    form.elements.memberType.value = profile.memberType || '';
    form.elements.email.value = profile.email || '';
    form.elements.phone.value = profile.phone || '';
    form.elements.chapter.value = profile.chapter || '';
    form.elements.city.value = profile.city || '';
    form.elements.state.value = profile.state || '';
    form.elements.timeZone.value = profile.timeZone || '';
    form.elements.serviceCategory.value = profile.serviceCategory || '';
    form.elements.rank.value = profile.rank || '';
    form.elements.skills.value = profile.skills || '';
    form.elements.availability.value = profile.availability || '';
    form.elements.hoursAvailable.value = profile.hoursAvailable || '';
    form.elements.notifications.checked = Boolean(profile.notifications);
    profileIdInput.value = profile.id;
    form.querySelectorAll('input[name="interests"]').forEach((input) => {
      input.checked = profile.interests.includes(input.value);
    });
    form.querySelectorAll('input[name="serviceModes"]').forEach((input) => {
      input.checked = profile.serviceModes.includes(input.value);
    });
    updateProgress();
  };

  const showStorageError = (error) => {
    console.error('Unable to load or save volunteer demo data.', error);
    const warning = document.createElement('p');
    warning.className = 'coordinator-warning';
    warning.setAttribute('role', 'alert');
    warning.textContent = 'Volunteer demo data could not be loaded or saved in this browser. Check browser storage settings and reload the page.';
    document.querySelector('.volunteer-notice').after(warning);
    form.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  };

  try {
    const params = new URLSearchParams(window.location.search);
    const requestedRole = params.get('demoRole');
    demoRole = requestedRole === 'volunteer' || requestedRole === 'coordinator'
      ? requestedRole
      : localStorage.getItem(storageKeys.role);
    if (demoRole === 'volunteer' || demoRole === 'coordinator') {
      localStorage.setItem(storageKeys.role, demoRole);
    }
    profiles = readList(storageKeys.profiles, demoProfiles).map((profile) => ({
      ...profile,
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      serviceModes: Array.isArray(profile.serviceModes) ? profile.serviceModes : [],
      approvedHours: Number(profile.approvedHours) || 0
    }));
    opportunities = readList(storageKeys.opportunities, demoOpportunities);
    applications = readList(storageKeys.applications, demoApplications);
    currentProfileId = localStorage.getItem(storageKeys.currentProfile);
    if (requestedRole) {
      const hash = window.location.hash;
      window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
    }
    renderStats();
    renderRoster();
    renderApplications();
    renderRole();
    const initialSection = window.location.hash === '#my-activity' && !findCurrentProfile()
      ? document.querySelector('#volunteer-profile')
      : window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (initialSection && !initialSection.hidden) {
      window.setTimeout(() => initialSection.scrollIntoView(), 0);
    }
  } catch (error) {
    showStorageError(error);
    return;
  }

  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);
  form.addEventListener('reset', () => {
    profileIdInput.value = '';
    profileFeedback.textContent = '';
    window.setTimeout(updateProgress, 0);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const profile = {
      id: profileIdInput.value || `vol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.elements.name.value.trim(),
      memberType: form.elements.memberType.value,
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      chapter: form.elements.chapter.value.trim(),
      city: form.elements.city.value.trim(),
      state: form.elements.state.value.trim(),
      timeZone: form.elements.timeZone.value,
      serviceCategory: form.elements.serviceCategory.value,
      rank: form.elements.rank.value.trim(),
      interests: Array.from(form.querySelectorAll('input[name="interests"]:checked'), (input) => input.value),
      skills: form.elements.skills.value.trim(),
      availability: form.elements.availability.value,
      hoursAvailable: form.elements.hoursAvailable.value,
      serviceModes: Array.from(form.querySelectorAll('input[name="serviceModes"]:checked'), (input) => input.value),
      notifications: form.elements.notifications.checked,
      approvedHours: 0
    };
    const existingIndex = profiles.findIndex((savedProfile) => savedProfile.id === profile.id);
    if (existingIndex >= 0) {
      profile.approvedHours = profiles[existingIndex].approvedHours || 0;
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
      currentProfileId = profile.id;
    }
    try {
      save(storageKeys.profiles, profiles);
      if (!profileIdInput.value) {
        currentProfileId = profile.id;
        localStorage.setItem(storageKeys.currentProfile, currentProfileId);
      }
      profileIdInput.value = profile.id;
      profileFeedback.textContent = demoRole === 'coordinator'
        ? 'Volunteer profile updated in this browser demo.'
        : 'Your volunteer profile has been saved in this browser.';
      renderStats();
      renderRoster();
      renderApplications();
      renderRole();
      updateProgress();
    } catch (error) {
      showStorageError(error);
    }
  });

  rosterSearch.addEventListener('input', renderRoster);

  document.querySelector('#application-body').addEventListener('click', (event) => {
    const button = event.target.closest('[data-application-action]');
    if (!button || demoRole !== 'coordinator') return;
    const application = applications.find((item) => item.id === button.dataset.applicationId);
    if (!application) return;
    const volunteer = profiles.find((profile) => profile.id === application.profileId);
    const nextStatus = button.dataset.applicationAction === 'approve' ? 'Approved' : 'Under Review';
    const updatedApplications = applications.map((item) =>
      item.id === application.id ? { ...item, status: nextStatus, reviewedAt: new Date().toISOString() } : item
    );
    try {
      save(storageKeys.applications, updatedApplications);
      applications = updatedApplications;
      renderApplications();
      renderOpportunities();
      renderMemberDashboard();
      document.querySelector('#application-feedback').textContent =
        `${volunteer ? volunteer.name : 'The volunteer'}'s application is now ${nextStatus.toLowerCase()}.`;
    } catch (error) {
      console.error('Unable to save the application decision.', error);
      document.querySelector('#application-feedback').textContent =
        'The decision could not be saved. Check browser storage settings and try again.';
    }
  });

  rosterBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit-profile]');
    if (!button) return;
    const profile = profiles.find((item) => item.id === button.dataset.editProfile);
    if (!profile) return;
    if (demoRole !== 'coordinator') return;
    adminEditingProfile = true;
    updateFormValidation();
    document.querySelector('#volunteer-profile').hidden = false;
    setForm(profile);
    profileFeedback.textContent = `Coordinator demo: editing ${profile.name}. Save the form to update this roster record.`;
    document.querySelector('#volunteer-profile').scrollIntoView({ behavior: 'smooth' });
    form.elements.name.focus({ preventScroll: true });
  });

  document.querySelector('#update-member-profile').addEventListener('click', () => {
    const profile = findCurrentProfile();
    if (!profile || demoRole !== 'volunteer') return;
    setForm(profile);
    profileFeedback.textContent = 'Your saved profile is loaded for you to update.';
  });

  opportunityList.addEventListener('click', (event) => {
    const applicantsButton = event.target.closest('[data-opportunity-applicants]');
    if (applicantsButton) {
      if (demoRole !== 'coordinator') return;
      const applicantsPanel = document.getElementById(`applicants-${applicantsButton.dataset.opportunityApplicants}`);
      if (!applicantsPanel) return;
      const expanded = applicantsButton.getAttribute('aria-expanded') === 'true';
      applicantsButton.setAttribute('aria-expanded', String(!expanded));
      applicantsButton.textContent = expanded ? 'Coordinator view' : 'Hide sign-ups';
      applicantsPanel.hidden = expanded;
      return;
    }
    const button = event.target.closest('[data-apply]');
    if (!button) return;
    if (demoRole !== 'volunteer') {
      window.location.href = 'login.html?role=volunteer';
      return;
    }
    const profile = findCurrentProfile();
    if (!profile) {
      profileFeedback.textContent = 'Please complete and save your volunteer profile before signing up for an opportunity.';
      document.querySelector('#volunteer-profile').scrollIntoView({ behavior: 'smooth' });
      form.elements.name.focus({ preventScroll: true });
      return;
    }
    const opportunity = opportunities.find((item) => item.id === button.dataset.apply);
    if (!opportunity || applications.some((application) => application.profileId === profile.id && application.opportunityId === opportunity.id)) return;
    const updatedApplications = [...applications, {
      id: `application-${Date.now()}`,
      profileId: profile.id,
      opportunityId: opportunity.id,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    }];
    try {
      save(storageKeys.applications, updatedApplications);
      applications = updatedApplications;
      profileFeedback.textContent = 'Application saved in this browser demo.';
      renderOpportunities();
      renderMemberDashboard();
      renderApplications();
      document.querySelector('#signup-confirmation-opportunity').textContent = opportunity.title;
      document.querySelector('#signup-confirmation').showModal();
    } catch (error) {
      showStorageError(error);
    }
  });

  document.querySelector('#export-roster').addEventListener('click', () => {
    const columns = [
      ['Name', 'name'], ['Member type', 'memberType'], ['Email', 'email'], ['Telephone', 'phone'],
      ['Chapter', 'chapter'], ['City', 'city'], ['State', 'state'], ['Time zone', 'timeZone'],
      ['Service category', 'serviceCategory'], ['Rank / professional category', 'rank'],
      ['Interests', 'interests'], ['Skills and experience', 'skills'], ['Availability', 'availability'],
      ['Hours available per month', 'hoursAvailable'], ['Service modes', 'serviceModes'],
      ['Volunteer notifications', 'notifications'], ['Approved hours', 'approvedHours']
    ];
    const csvCell = (value) => {
      const text = String(Array.isArray(value) ? value.join('; ') : value ?? '');
      const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const rows = [columns.map(([heading]) => csvCell(heading)).join(',')];
    profiles.forEach((profile) => rows.push(columns.map(([, field]) => csvCell(profile[field])).join(',')));
    const blob = new Blob([`\uFEFF${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rocks-volunteer-roster-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  document.querySelector('#demo-sign-out').addEventListener('click', () => {
    localStorage.removeItem(storageKeys.role);
    window.location.href = 'volunteer.html';
  });

  document.querySelector('#signup-close').addEventListener('click', () => {
    document.querySelector('#signup-confirmation').close();
  });

  document.querySelector('#signup-view-activity').addEventListener('click', () => {
    document.querySelector('#signup-confirmation').close();
    document.querySelector('#my-activity').scrollIntoView({ behavior: 'smooth' });
  });
});
