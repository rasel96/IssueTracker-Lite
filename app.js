if (!localStorage.getItem('isAuthenticated')) {
  window.location.href = 'index.html';
}
let allIssues = [];
let currentTab = 'all';

const grid = document.getElementById('issuesGrid');
const loader = document.getElementById('loader');
const issueCount = document.getElementById('issueCount');
const tabs = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('searchInput');

const modal = document.getElementById('issueModal');
const closeModalBtn = document.getElementById('closeModalBtn');
async function fetchIssues(query = '') {
  showLoader();
  try {
    let url = 'https://phi-lab-server.vercel.app/api/v1/lab/issues';
    if (query) {
      url = `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (Array.isArray(data)) {
      allIssues = data;
    } else if (data && Array.isArray(data.data)) {
      allIssues = data.data;
    } else if (data && Array.isArray(data.issues)) {
      allIssues = data.issues;
    } else {
      console.error('Unexpected API response structure:', data);
      allIssues = [];
    }

    renderIssues();
  } catch (error) {
    console.error('Error fetching issues:', error);
    grid.innerHTML =
      '<p class="text-red-500 col-span-full">Failed to load issues.</p>';
  } finally {
    hideLoader();
  }
}

function renderIssues() {
  grid.innerHTML = '';

  const filteredIssues = allIssues.filter(issue => {
    if (currentTab === 'all') return true;
    return (issue.status || '').toLowerCase() === currentTab;
  });

  issueCount.innerText = filteredIssues.length;

  if (filteredIssues.length === 0) {
    grid.innerHTML =
      '<p class="text-gray-500 col-span-full">No issues found.</p>';
    return;
  }

  filteredIssues.forEach(issue => {
    const statusStr = (issue.status || 'open').toLowerCase();
    const borderClass =
      statusStr === 'open' ? 'border-t-green-500' : 'border-t-purple-500';
    const labelsHTML = Array.isArray(issue.labels)
      ? issue.labels
          .map(
            label =>
              `<span class="px-2 py-1 bg-red-50 text-red-500 rounded text-[10px] font-bold uppercase border border-red-100">${label}</span>`,
          )
          .join('')
      : '';
    const issueId = issue.id || issue._id || 'N/A';

    const card = document.createElement('div');
    card.className = `bg-white border-t-4 ${borderClass} shadow-sm border border-gray-100 rounded-md p-4 cursor-pointer hover:shadow-md transition flex flex-col`;
    card.onclick = () => openModal(issueId);

    card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-gray-400">#${issueId}</span>
                <span class="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold uppercase">${issue.priority || 'Medium'}</span>
            </div>
            <h3 class="font-bold text-gray-800 text-sm mb-1 leading-tight line-clamp-2">${issue.title || 'Untitled Issue'}</h3>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2 flex-grow">${issue.description || 'No description provided.'}</p>
            <div class="flex gap-1 flex-wrap mb-4">
                ${labelsHTML}
            </div>
            <div class="text-[10px] text-gray-400 mt-auto border-t pt-2 border-gray-100">
                #${issueId} by ${issue.author || 'Unknown'} <br> ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
            </div>
        `;
    grid.appendChild(card);
  });
}
async function openModal(id) {
  if (!id || id === 'N/A') return;
  showLoader();
  try {
    const response = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    );
    const data = await response.json();
    const issue = data.data || data;

    document.getElementById('modalTitle').innerText = issue.title || 'Untitled';
    document.getElementById('modalDesc').innerText =
      issue.description || 'No description';
    document.getElementById('modalAssignee').innerText =
      issue.author || 'Unassigned';
    document.getElementById('modalPriority').innerText =
      issue.priority || 'Medium';

    const statusBadge = document.getElementById('modalStatus');
    const statusStr = (issue.status || 'open').toLowerCase();
    statusBadge.innerText = issue.status || 'Open';
    statusBadge.className = `px-2 py-1 rounded text-white font-bold uppercase text-xs ${statusStr === 'open' ? 'bg-green-500' : 'bg-purple-500'}`;

    document.getElementById('modalMeta').innerText =
      `Opened by ${issue.author || 'Unknown'} • ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}`;

    const labelsHTML = Array.isArray(issue.labels)
      ? issue.labels
          .map(
            label =>
              `<span class="px-2 py-1 bg-red-50 text-red-500 rounded text-[10px] font-bold uppercase border border-red-100">${label}</span>`,
          )
          .join('')
      : '';
    document.getElementById('modalLabels').innerHTML = labelsHTML;

    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Modal Error:', error);
    alert('Failed to fetch issue details.');
  } finally {
    hideLoader();
  }
}
