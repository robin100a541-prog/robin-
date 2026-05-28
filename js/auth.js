/* ============================================================
   CRJ Fastigheter AB — Auth Helpers
   ============================================================ */

/**
 * Get current authenticated user (async).
 * @returns {Promise<object|null>}
 */
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user || null;
}

/**
 * Redirect to login if not authenticated.
 * @param {string} redirectTo - page to return to after login (optional)
 */
async function requireAuth(redirectTo) {
  const user = await getCurrentUser();
  if (!user) {
    const url = redirectTo ? `login.html?next=${encodeURIComponent(redirectTo)}` : 'login.html';
    window.location.href = url;
    return null;
  }
  return user;
}

/**
 * Redirect to index if not admin. Returns user if admin.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !getAdminStatus(user)) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

/**
 * Sign out and redirect to index.
 */
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

/**
 * Update the navbar dynamically based on auth state.
 * Adds an auth area after the nav links.
 */
async function updateNavbar() {
  const authArea = document.getElementById('navbar-auth');
  const mobileAuthArea = document.getElementById('navbar-mobile-auth');
  if (!authArea) return;

  if (!isSupabaseConfigured()) {
    authArea.innerHTML = `<a href="login.html" class="navbar__auth-btn"><i class="fa-solid fa-user"></i> Logga in</a>`;
    if (mobileAuthArea) mobileAuthArea.innerHTML = `<a href="login.html" class="navbar__mobile-link navbar__mobile-auth-link">Logga in</a>`;
    return;
  }

  const user = await getCurrentUser();

  if (user) {
    const isAdmin = getAdminStatus(user);
    const initials = (user.user_metadata?.full_name || user.email || 'U')
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    let adminLink = isAdmin ? `<a href="admin.html" class="navbar__auth-dropdown-item"><i class="fa-solid fa-shield-halved"></i> Admin</a>` : '';

    authArea.innerHTML = `
      <div class="navbar__auth-user" id="navbar-user-btn" aria-expanded="false" role="button" tabindex="0" aria-label="Användarmeny">
        <div class="navbar__auth-avatar">${initials}</div>
        <span class="navbar__auth-name">${user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : 'Mitt konto'}</span>
        <i class="fa-solid fa-chevron-down navbar__auth-chevron"></i>
      </div>
      <div class="navbar__auth-dropdown" id="navbar-dropdown" role="menu">
        <a href="dashboard.html" class="navbar__auth-dropdown-item" role="menuitem"><i class="fa-solid fa-user-circle"></i> Min sida</a>
        ${adminLink}
        <div class="navbar__auth-dropdown-divider"></div>
        <button onclick="logout()" class="navbar__auth-dropdown-item navbar__auth-dropdown-btn" role="menuitem"><i class="fa-solid fa-right-from-bracket"></i> Logga ut</button>
      </div>
    `;

    if (mobileAuthArea) {
      mobileAuthArea.innerHTML = `
        <a href="dashboard.html" class="navbar__mobile-link navbar__mobile-auth-link">Min sida</a>
        ${isAdmin ? '<a href="admin.html" class="navbar__mobile-link navbar__mobile-auth-link">Admin</a>' : ''}
        <button onclick="logout()" class="navbar__mobile-link navbar__mobile-auth-link" style="background:none;border:none;font-family:inherit;cursor:pointer;color:rgba(255,255,255,0.7);font-size:1.5rem;font-weight:700;padding:12px 32px;text-align:center;font-family:var(--font-heading);">Logga ut</button>
      `;
    }

    // Toggle dropdown
    const userBtn = document.getElementById('navbar-user-btn');
    const dropdown = document.getElementById('navbar-dropdown');
    if (userBtn && dropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        dropdown.classList.toggle('open');
        userBtn.setAttribute('aria-expanded', !isOpen);
      });
      userBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          userBtn.click();
        }
      });
      document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        userBtn.setAttribute('aria-expanded', 'false');
      });
    }
  } else {
    authArea.innerHTML = `<a href="login.html" class="navbar__auth-btn"><i class="fa-solid fa-right-to-bracket"></i> Logga in</a>`;
    if (mobileAuthArea) mobileAuthArea.innerHTML = `<a href="login.html" class="navbar__mobile-link navbar__mobile-auth-link">Logga in</a>`;
  }
}

/**
 * Show a toast notification (bottom-right, auto-dismiss after 3s).
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('toast--visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Run navbar update on every page load
document.addEventListener('DOMContentLoaded', updateNavbar);
