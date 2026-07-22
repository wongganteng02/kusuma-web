function renderSubmenu(containerId, dataList) {
  const container = document.getElementById(containerId);
  if (!container || !dataList) return;

  const linksHTML = dataList.map(item => `
    <a
      href="${item.link}"
      class="block py-2 px-3 text-xs text-slate-400 hover:text-emerald-400 transition-all rounded-md hover:bg-emerald-500/5"
    >
      <i class="fas fa-${item.icon} mr-2 ${item.color} w-4 text-center"></i>${item.judul}
    </a>
  `).join('');

  // Menempelkan link baru tepat di bawah item lama
  container.insertAdjacentHTML('beforeend', linksHTML);
}

function populateNavbarMenus() {
  // Render ke masing-masing ID submenu
  renderSubmenu("project-submenu", menuData.projects);
  renderSubmenu("aktifitas-submenu", menuData.aktifitas);
  renderSubmenu("articles-submenu", menuData.articles);
}

document.addEventListener("DOMContentLoaded", populateNavbarMenus);