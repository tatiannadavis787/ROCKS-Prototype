document.addEventListener('DOMContentLoaded', () => {
  const status = document.querySelector('#login-demo-status');
  const requestedRole = new URLSearchParams(window.location.search).get('demoRole');
  if (requestedRole === 'coordinator' || requestedRole === 'volunteer') {
    status.textContent = `Choose “Continue as ${requestedRole === 'coordinator' ? 'a coordinator' : 'a volunteer'}” to open that demo view.`;
  }

  document.querySelectorAll('[data-demo-role]').forEach((button) => {
    button.addEventListener('click', () => {
      const role = button.dataset.demoRole;
      if (role !== 'volunteer' && role !== 'coordinator') return;
      const section = role === 'coordinator' ? '#coordinator' : '#my-activity';
      window.location.href = `volunteer.html?demoRole=${role}${section}`;
    });
  });
});
