/* ======================================================
   ADMIN PANEL DASHBOARD LOGIC - PIXELCRAFT STUDIOS
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global Admin App State
  const state = {
    token: localStorage.getItem('adminToken') || '',
    theme: localStorage.getItem('theme') || 'dark',
    requests: [],
    metrics: {},
    activeRequest: null
  };

  // ----------------- DOM ELEMENTS -----------------
  const loader = document.getElementById('adminLoader');
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  
  // Login Form
  const loginForm = document.getElementById('adminLoginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const btnLoginSubmit = document.getElementById('btnLoginSubmit');

  // Dashboard Headers
  const adminUserIndicator = document.getElementById('adminUserIndicator');
  const btnLogout = document.getElementById('btnAdminLogout');
  const themeToggleBtn = document.getElementById('themeToggle');

  // Metrics
  const metricTotal = document.getElementById('metricTotal');
  const metricNew = document.getElementById('metricNew');
  const metricProgress = document.getElementById('metricProgress');
  const metricCompleted = document.getElementById('metricCompleted');

  // Filters
  const searchBar = document.getElementById('searchBar');
  const filterStatus = document.getElementById('filterStatus');
  const filterType = document.getElementById('filterType');
  const filterService = document.getElementById('filterService');
  const sortOrder = document.getElementById('sortOrder');
  const btnExportCSV = document.getElementById('btnExportCSV');

  // Main area
  const requestsGrid = document.getElementById('requestsGrid');
  const emptyState = document.getElementById('emptyState');

  // Details Modal
  const detailsModal = document.getElementById('detailsModal');
  const btnDetailsClose = document.getElementById('btnDetailsClose');
  const updateStatusSelect = document.getElementById('updateStatusSelect');
  const btnDeleteRequest = document.getElementById('btnDeleteRequest');

  // Theme Manager
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    state.theme = theme;
  };
  applyTheme(state.theme);

  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // ----------------- UTILS & REQUEST HEADERS -----------------
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    };
  };

  const showLoader = () => loader.classList.remove('hidden');
  const hideLoader = () => loader.classList.add('hidden');

  // ----------------- AUTHENTICATION CHECKS -----------------
  const verifyToken = async () => {
    if (!state.token) {
      showLoginScreen();
      return;
    }

    try {
      showLoader();
      const response = await fetch('/api/auth/me', {
        headers: getAuthHeaders()
      });
      const data = await response.ok ? await response.json() : null;

      if (data && data.success) {
        adminUserIndicator.textContent = data.admin.username;
        showDashboard();
      } else {
        localStorage.removeItem('adminToken');
        state.token = '';
        showLoginScreen();
      }
    } catch (error) {
      console.error('[Verify Auth Error] ', error.message);
      showLoginScreen();
    } finally {
      hideLoader();
    }
  };

  const showLoginScreen = () => {
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    hideLoader();
  };

  const showDashboard = () => {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    fetchRequests();
  };

  // Submit Login Form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.textContent = '';
    
    const submitText = btnLoginSubmit.querySelector('.btn-text');
    const spinner = btnLoginSubmit.querySelector('.btn-spinner');
    
    btnLoginSubmit.disabled = true;
    submitText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login credentials failed');
      }

      state.token = result.token;
      localStorage.setItem('adminToken', result.token);
      adminUserIndicator.textContent = result.admin.username;
      
      // Reset credentials form
      loginForm.reset();
      showDashboard();

    } catch (error) {
      loginErrorMsg.textContent = error.message;
    } finally {
      btnLoginSubmit.disabled = false;
      submitText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });

  // Logout Trigger
  btnLogout.addEventListener('click', () => {
    if (confirm('Are you sure you want to sign out of the Admin panel?')) {
      localStorage.removeItem('adminToken');
      state.token = '';
      showLoginScreen();
    }
  });

  // ----------------- FETCHING & RENDERING DATA -----------------
  const fetchRequests = async () => {
    try {
      showLoader();
      
      // Construct URL parameters
      const params = new URLSearchParams({
        search: searchBar.value,
        status: filterStatus.value,
        businessType: filterType.value,
        service: filterService.value,
        sortBy: sortOrder.value
      });

      const response = await fetch(`/api/requests?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch requests');
      }

      state.requests = result.data;
      state.metrics = result.metrics;
      
      renderMetrics();
      renderRequestsGrid();

    } catch (error) {
      console.error('[Fetch Requests Error]', error.message);
      // If unauthorized response code, boot back to login screen
      if (error.message.includes('expired') || error.message.includes('token')) {
        state.token = '';
        localStorage.removeItem('adminToken');
        showLoginScreen();
      } else {
        alert('Failed to reload requests from server.');
      }
    } finally {
      hideLoader();
    }
  };

  // Render Metric Header Cards
  const renderMetrics = () => {
    const m = state.metrics;
    if (!m) return;
    metricTotal.textContent = m.total;
    metricNew.textContent = m.new;
    metricProgress.textContent = m.inProgress;
    metricCompleted.textContent = m.completed;
  };

  // Render Requests
  const renderRequestsGrid = () => {
    requestsGrid.innerHTML = '';
    
    if (state.requests.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');

    state.requests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'request-item-card';
      
      const formattedDate = new Date(req.createdAt).toLocaleDateString();
      const statusClass = req.status.toLowerCase().replace(/\s/g, '');

      card.innerHTML = `
        <div class="card-top">
          <div>
            <h4>${req.businessName}</h4>
            <span class="req-id">${req.requestId}</span>
          </div>
          <span class="status-badge ${statusClass}">${req.status}</span>
        </div>
        
        <div class="card-details">
          <div class="detail-line">
            <span class="label">Client:</span>
            <span class="val">${req.fullName}</span>
          </div>
          <div class="detail-line">
            <span class="label">Service:</span>
            <span class="val service-tag">${req.requiredService}</span>
          </div>
          <div class="detail-line">
            <span class="label">Type:</span>
            <span class="val">${req.businessType}</span>
          </div>
          <div class="detail-line">
            <span class="label">Budget:</span>
            <span class="val" style="color: var(--primary-light)">${req.budgetRange || 'Flexible'}</span>
          </div>
          <div class="detail-line">
            <span class="label">Submitted:</span>
            <span class="val">${formattedDate}</span>
          </div>
        </div>
        
        <button class="btn btn-outline btn-full btn-sm btn-view-details" data-id="${req._id}">
          View Details
        </button>
      `;

      // Event listener for the individual details button
      card.querySelector('.btn-view-details').addEventListener('click', () => {
        openRequestDetails(req._id);
      });

      requestsGrid.appendChild(card);
    });
  };

  // Metric Click actions (Filter by status directly!)
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      const filterVal = card.getAttribute('data-status');
      if (filterVal === 'All') {
        filterStatus.value = '';
      } else {
        filterStatus.value = filterVal;
      }
      fetchRequests();
    });
  });

  // Debounced live searching
  let searchTimeout;
  searchBar.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchRequests, 350);
  });

  // Bind remaining filter dropdown elements
  filterStatus.addEventListener('change', fetchRequests);
  filterType.addEventListener('change', fetchRequests);
  filterService.addEventListener('change', fetchRequests);
  sortOrder.addEventListener('change', fetchRequests);

  // CSV Exporter Hook
  btnExportCSV.addEventListener('click', () => {
    // Generate CSV via backend download route
    // Since it's protected by JWT, we can open in window with query parameter token,
    // which requestController reads safely.
    window.open(`/api/requests/export?token=${state.token}`, '_blank');
  });

  // ----------------- OPEN & MANAGE DETAILED DETAILS MODAL -----------------
  const openRequestDetails = async (requestId) => {
    try {
      showLoader();
      const response = await fetch(`/api/requests/${requestId}`, {
        headers: getAuthHeaders()
      });

      const result = await response.ok ? await response.json() : null;

      if (!result || !result.success) {
        throw new Error('Could not retrieve request detail profile.');
      }

      const req = result.data;
      state.activeRequest = req;

      // Populate elements
      document.getElementById('modalBusinessName').textContent = req.businessName;
      document.getElementById('modalRequestId').textContent = `ID: ${req.requestId}`;
      document.getElementById('modalFullName').textContent = req.fullName;
      
      const emailLink = document.getElementById('modalEmailLink');
      emailLink.textContent = req.email;
      emailLink.href = `mailto:${req.email}`;

      const mobileLink = document.getElementById('modalMobileLink');
      mobileLink.textContent = req.mobile;
      mobileLink.href = `tel:${req.mobile}`;

      const whatsappLink = document.getElementById('modalWhatsappLink');
      whatsappLink.textContent = req.whatsapp || req.mobile;
      whatsappLink.href = `https://wa.me/${(req.whatsapp || req.mobile).replace(/\+/g, '')}`;

      document.getElementById('modalBusinessType').textContent = req.businessType;
      document.getElementById('modalAddress').textContent = req.businessAddress || 'Not Provided';
      document.getElementById('modalCityState').textContent = req.cityState || 'Not Provided';
      document.getElementById('modalDescription').textContent = req.businessDescription || 'No description provided.';
      
      document.getElementById('modalService').textContent = req.requiredService;
      document.getElementById('modalBudget').textContent = req.budgetRange || 'Flexible';
      
      const deadlineVal = req.deadline ? new Date(req.deadline).toLocaleDateString() : 'Flexible / ASAP';
      document.getElementById('modalDeadline').textContent = deadlineVal;

      const refLink = document.getElementById('modalReferenceLink');
      if (req.referenceLink) {
        refLink.textContent = req.referenceLink;
        refLink.href = req.referenceLink;
        refLink.parentElement.parentElement.style.display = '';
      } else {
        refLink.parentElement.parentElement.style.display = 'none';
      }

      // Sync color swatch indicator
      document.getElementById('modalColorIndicator').style.backgroundColor = req.preferredColor;
      document.getElementById('modalColorHex').textContent = req.preferredColor;

      // Sync features checklist
      const featuresStr = req.featuresRequired && req.featuresRequired.length > 0
        ? req.featuresRequired.join(', ')
        : 'No specific features selected.';
      document.getElementById('modalFeatures').textContent = featuresStr;

      // Notes
      const notesSection = document.getElementById('modalNotesSection');
      if (req.additionalNotes) {
        notesSection.classList.remove('hidden');
        document.getElementById('modalAdditionalNotes').textContent = req.additionalNotes;
      } else {
        notesSection.classList.add('hidden');
      }

      // Uploads: Logo Preview
      const logoBox = document.getElementById('modalLogoBox');
      const logoAssetBox = document.getElementById('logoAssetBox');
      if (req.logoUrl) {
        logoAssetBox.style.display = 'block';
        logoBox.innerHTML = `<img src="${req.logoUrl}" alt="Client Logo" title="View full logo" onclick="window.open('${req.logoUrl}', '_blank')">`;
      } else {
        logoAssetBox.style.display = 'none';
      }

      // Uploads: Photos Gallery grid
      const photosBox = document.getElementById('modalPhotosBox');
      const photosAssetBox = document.getElementById('photosAssetBox');
      photosBox.innerHTML = '';
      
      if (req.photosUrls && req.photosUrls.length > 0) {
        photosAssetBox.style.display = 'block';
        req.photosUrls.forEach(url => {
          const div = document.createElement('div');
          div.className = 'photo-thumb';
          div.innerHTML = `<img src="${url}" alt="Business Local Photo" onclick="window.open('${url}', '_blank')">`;
          photosBox.appendChild(div);
        });
      } else {
        photosAssetBox.style.display = 'none';
      }

      // Sync active status selection dropdown in details
      updateStatusSelect.value = req.status;

      // Modal visual badge
      const statusBadge = document.getElementById('modalStatusBadge');
      statusBadge.className = `modal-badge status-${req.status.toLowerCase().replace(/\s/g, '')}`;
      statusBadge.textContent = req.status;

      // Show details modal window
      detailsModal.classList.remove('hidden');

    } catch (error) {
      alert(error.message || 'Error occurred loading details.');
    } finally {
      hideLoader();
    }
  };

  // Close details modal
  const closeDetailsModal = () => {
    detailsModal.classList.add('hidden');
    state.activeRequest = null;
  };

  btnDetailsClose.addEventListener('click', closeDetailsModal);
  
  // Close details modal clicking on backdrop overlay
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
      closeDetailsModal();
    }
  });

  // Change request status dropdown selector
  updateStatusSelect.addEventListener('change', async () => {
    if (!state.activeRequest) return;
    const nextStatus = updateStatusSelect.value;
    
    try {
      showLoader();
      const response = await fetch(`/api/requests/${state.activeRequest._id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update request status');
      }

      // Update local state and details modal UI indicators
      state.activeRequest.status = nextStatus;
      
      const statusBadge = document.getElementById('modalStatusBadge');
      statusBadge.className = `modal-badge status-${nextStatus.toLowerCase().replace(/\s/g, '')}`;
      statusBadge.textContent = nextStatus;

      // Refresh requests datagrid
      fetchRequests();

    } catch (error) {
      alert(error.message || 'Error updating status state.');
    } finally {
      hideLoader();
    }
  });

  // Delete Demo Request Button
  btnDeleteRequest.addEventListener('click', async () => {
    if (!state.activeRequest) return;
    
    const confirmMessage = `WARNING: Are you sure you want to delete the demo request from "${state.activeRequest.businessName}"?\n\nThis will permanently delete this client profile and all associated logos/images from the server database!`;
    if (!confirm(confirmMessage)) return;

    try {
      showLoader();
      const response = await fetch(`/api/requests/${state.activeRequest._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to execute request deletion');
      }

      alert('Request profile deleted successfully.');
      closeDetailsModal();
      fetchRequests();

    } catch (error) {
      alert(error.message || 'Error occurred during deletion.');
    } finally {
      hideLoader();
    }
  });

  // Run Auth check on start
  verifyToken();
});
